'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EditMagnetPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const magnetId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [buttonCta, setButtonCta] = useState('');
  const [accentColor, setAccentColor] = useState('#4F46E5');
  const [isPublished, setIsPublished] = useState(false);
  const [includeCta, setIncludeCta] = useState(true);
  const [ctaHeading, setCtaHeading] = useState('');
  const [ctaBody, setCtaBody] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [socialProof, setSocialProof] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('id', magnetId)
        .single();

      if (!data) { router.push('/dashboard'); return; }

      setTitle(data.title);
      setHook(data.hook_description);
      setSlug(data.slug);
      setContent(data.raw_markdown_content);
      setButtonCta(data.button_cta || 'Get Your Free Guide');
      setAccentColor(data.accent_color || '#4F46E5');
      setIsPublished(data.is_published);
      setIncludeCta(data.include_cta_page ?? true);
      setCtaHeading(data.cta_page_heading || '');
      setCtaBody(data.cta_page_body || '');
      setCtaUrl(data.cta_page_url || '');
      setSocialProof(data.social_proof_text || '');
      setLoading(false);
    };
    load();
  }, [magnetId]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const updates: Record<string, unknown> = {
      title: title.trim(),
      hook_description: hook.trim(),
      slug: slug.trim(),
      raw_markdown_content: content,
      button_cta: buttonCta || 'Get Your Free Guide',
      accent_color: accentColor,
      social_proof_text: socialProof || null,
      include_cta_page: includeCta,
      cta_page_heading: ctaHeading || 'Want More?',
      cta_page_body: ctaBody || null,
      cta_page_url: ctaUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (publish !== undefined) {
      updates.is_published = publish;
      setIsPublished(publish);
    }

    const { error: updateError } = await supabase
      .from('lead_magnets')
      .update(updates)
      .eq('id', magnetId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(publish ? 'Published!' : 'Saved!');
      setTimeout(() => setSuccess(''), 2000);
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Lead Magnet</h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${isPublished ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
            {isPublished ? 'Live' : 'Draft'}
          </span>
          {isPublished && (
            <a href={`/v/${slug}`} target="_blank" className="text-xs text-indigo-400 hover:text-indigo-300">
              View page &rarr;
            </a>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Hook Description</label>
          <textarea value={hook} onChange={(e) => setHook(e.target.value)} rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">URL Slug</label>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <span className="px-4 text-zinc-600 text-sm">/v/</span>
            <input type="text" value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 bg-transparent py-3 text-white focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Guide Content (Markdown)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-mono text-sm" />
          <p className="text-xs text-zinc-600 mt-1">{wordCount.toLocaleString()} words</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Button Text</label>
            <input type="text" value={buttonCta} onChange={(e) => setButtonCta(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-800 cursor-pointer" />
              <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Social Proof (optional)</label>
          <input type="text" value={socialProof} onChange={(e) => setSocialProof(e.target.value)}
            placeholder="Join 1,200+ readers"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="includeCta" checked={includeCta}
              onChange={(e) => setIncludeCta(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-indigo-500" />
            <label htmlFor="includeCta" className="text-sm text-zinc-400">Include CTA page at end of PDF</label>
          </div>
          {includeCta && (
            <div className="space-y-3 ml-6">
              <input type="text" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)}
                placeholder="Want More?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <textarea value={ctaBody} onChange={(e) => setCtaBody(e.target.value)} rows={2}
                placeholder="Join my newsletter for weekly tips..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none" />
              <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://your-newsletter.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <div className="flex gap-3">
          <button onClick={() => handleSave()} disabled={saving}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-6 rounded-xl transition disabled:opacity-70 cursor-pointer">
            Save
          </button>
          {!isPublished ? (
            <button onClick={() => handleSave(true)} disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-70 cursor-pointer">
              Publish
            </button>
          ) : (
            <button onClick={() => handleSave(false)} disabled={saving}
              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-medium py-3 px-6 rounded-xl transition disabled:opacity-70 cursor-pointer">
              Unpublish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
