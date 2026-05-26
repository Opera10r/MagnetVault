'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewMagnetPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [buttonCta, setButtonCta] = useState('Get Your Free Guide');
  const [accentColor, setAccentColor] = useState('#4F46E5');
  const [includeCta, setIncludeCta] = useState(true);
  const [ctaHeading, setCtaHeading] = useState('Want More?');
  const [ctaBody, setCtaBody] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [socialProof, setSocialProof] = useState('');

  const autoSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(val));
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !hook.trim() || !content.trim() || !slug.trim()) {
      setError('Title, hook, slug, and content are required.');
      return;
    }

    setSaving(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setSaving(false); return; }

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!creator) { setError('Creator profile not found'); setSaving(false); return; }

    const { data, error: insertError } = await supabase
      .from('lead_magnets')
      .insert({
        creator_id: creator.id,
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
        is_published: publish,
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        setError('That URL slug is already taken. Choose a different one.');
      } else {
        setError(insertError.message);
      }
      setSaving(false);
      return;
    }

    router.push(`/dashboard/magnets/${data.id}/edit`);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Lead Magnet</h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="The Romance Trope Cheat Sheet"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Hook */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Hook Description <span className="text-zinc-600">(shown on landing page)</span></label>
          <textarea
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            rows={3}
            placeholder="47 romance tropes every author needs to know — with examples, reader expectations, and marketing hooks for each one."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">URL Slug</label>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <span className="px-4 text-zinc-600 text-sm">/v/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 bg-transparent py-3 text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Guide Content <span className="text-zinc-600">(Markdown)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder={"# Your Guide Title\n\n## Section One\n\nWrite your guide content here in Markdown...\n\n- Bullet points work\n- **Bold** and *italic* too\n\n## Section Two\n\nMore content..."}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-mono text-sm"
          />
          <p className="text-xs text-zinc-600 mt-1">{wordCount.toLocaleString()} words</p>
        </div>

        {/* Button CTA + Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Button Text</label>
            <input
              type="text"
              value={buttonCta}
              onChange={(e) => setButtonCta(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-800 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Social Proof <span className="text-zinc-600">(optional)</span></label>
          <input
            type="text"
            value={socialProof}
            onChange={(e) => setSocialProof(e.target.value)}
            placeholder="Join 1,200+ readers"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* CTA Page */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeCta"
              checked={includeCta}
              onChange={(e) => setIncludeCta(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-indigo-500"
            />
            <label htmlFor="includeCta" className="text-sm text-zinc-400">Include CTA page at end of PDF</label>
          </div>
          {includeCta && (
            <div className="space-y-3 ml-6">
              <input
                type="text"
                value={ctaHeading}
                onChange={(e) => setCtaHeading(e.target.value)}
                placeholder="Want More?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <textarea
                value={ctaBody}
                onChange={(e) => setCtaBody(e.target.value)}
                rows={2}
                placeholder="Join my newsletter for weekly tips..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://your-newsletter.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-6 rounded-xl transition disabled:opacity-70 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-70 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Publish & Get Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
