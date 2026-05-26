import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generatePDF } from '@/lib/pdf';
import { sendMagnetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { magnet_id, email, utm_source, utm_medium, utm_campaign, referrer } = body;

  if (!magnet_id || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Load magnet + creator
  const { data: magnet } = await supabaseAdmin
    .from('lead_magnets')
    .select('*, creators(*)')
    .eq('id', magnet_id)
    .eq('is_published', true)
    .single();

  if (!magnet) {
    return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 });
  }

  const creator = magnet.creators;

  // Check free tier limits (50 subs/month)
  if (creator.subscription_status === 'free') {
    if (creator.monthly_subscriber_count >= 50) {
      return NextResponse.json({
        error: 'This resource is temporarily unavailable. Please try again later.',
      }, { status: 503 });
    }
  }

  // Insert subscriber (idempotent via unique constraint)
  const { data: subscriber, error: insertError } = await supabaseAdmin
    .from('subscribers')
    .insert({
      magnet_id,
      creator_id: creator.id,
      subscriber_email: email.toLowerCase().trim(),
      status: 'pending',
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      referrer_url: referrer || null,
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ success: true, duplicate: true });
    }
    console.error('Insert error:', insertError);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }

  const subscriberId = subscriber.id;

  try {
    // ---- STEP 1: Generate PDF ----
    const pdfStart = Date.now();
    const pdfBuffer = await generatePDF(magnet);

    await supabaseAdmin.from('delivery_logs').insert({
      subscriber_id: subscriberId,
      step: 'pdf_generation',
      status: 'success',
      duration_ms: Date.now() - pdfStart,
    });

    // ---- STEP 2: Send email with PDF ----
    const emailStart = Date.now();
    const creatorName = creator.display_name || creator.channel_name;
    const pdfFilename = `${magnet.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`;

    await sendMagnetEmail({
      to: email,
      from: `${creatorName} via MagnetVault <delivery@magnetvault.io>`,
      replyTo: creator.reply_to_email,
      subject: `Your copy: ${magnet.title}`,
      body: buildDeliveryEmail(creator, magnet),
      pdfBuffer,
      pdfFilename,
    });

    await supabaseAdmin.from('delivery_logs').insert({
      subscriber_id: subscriberId,
      step: 'email_send',
      status: 'success',
      duration_ms: Date.now() - emailStart,
    });

    // ---- STEP 3: Update subscriber status ----
    await supabaseAdmin
      .from('subscribers')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', subscriberId);

    // ---- STEP 4: Update counters ----
    await supabaseAdmin.rpc('increment_magnet_subscribers', { target_magnet_id: magnet_id });
    await supabaseAdmin.rpc('increment_creator_monthly_subs', { target_creator_id: creator.id });

    // ---- STEP 5: Webhook sync (async, don't block) ----
    if (creator.newsletter_webhook_url) {
      fetch(creator.newsletter_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'subscriber.new',
          email: email.toLowerCase().trim(),
          source: 'magnetvault',
          magnet_title: magnet.title,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => {
        console.error('Webhook sync failed:', err.message);
      });
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Delivery error:', message);

    await supabaseAdmin
      .from('subscribers')
      .update({ status: 'failed' })
      .eq('id', subscriberId);

    await supabaseAdmin.from('delivery_logs').insert({
      subscriber_id: subscriberId,
      step: 'unknown',
      status: 'failed',
      error_message: message,
    });

    return NextResponse.json({
      error: 'Delivery failed. Please try again in a moment.',
    }, { status: 500 });
  }
}

function buildDeliveryEmail(creator: { display_name?: string; channel_name: string }, magnet: { title: string; cta_page_body?: string; cta_page_url?: string }): string {
  const name = creator.display_name || creator.channel_name;
  let body = `Hey there!\n\nThank you for requesting "${magnet.title}". Your guide is attached to this email as a PDF — download it and save it for reference.\n`;

  if (magnet.cta_page_body) {
    body += `\nIf you found this helpful, ${magnet.cta_page_body.slice(0, 200)}`;
  }
  if (magnet.cta_page_url) {
    body += `\n\nLearn more: ${magnet.cta_page_url}`;
  }

  body += `\n\nEnjoy!\n— ${name}`;
  return body;
}
