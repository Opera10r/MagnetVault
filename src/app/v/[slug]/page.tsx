import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import LandingPageClient from './LandingPageClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: magnet } = await supabaseAdmin
    .from('lead_magnets')
    .select('title, meta_title, meta_description, hook_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!magnet) return { title: 'Not Found' };

  return {
    title: magnet.meta_title || magnet.title,
    description: magnet.meta_description || magnet.hook_description,
    openGraph: {
      title: magnet.meta_title || magnet.title,
      description: magnet.meta_description || magnet.hook_description,
    },
  };
}

export default async function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: magnet } = await supabaseAdmin
    .from('lead_magnets')
    .select('*, creators(channel_name, display_name, logo_url, accent_color)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!magnet) notFound();

  const creator = magnet.creators;
  const accentColor = magnet.accent_color || creator.accent_color || '#4F46E5';

  return <LandingPageClient magnet={magnet} creator={creator} accentColor={accentColor} />;
}
