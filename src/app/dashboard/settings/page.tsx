'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const supabase = createClient();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setCreator(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const updates = {
      channel_name: form.get('channel_name') as string,
      display_name: form.get('display_name') as string || null,
      reply_to_email: form.get('reply_to_email') as string,
      website_url: form.get('website_url') as string || null,
      accent_color: form.get('accent_color') as string || '#4F46E5',
      newsletter_webhook_url: form.get('newsletter_webhook_url') as string || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', creator.id);

    setSaving(false);
    setMessage(error ? 'Failed to save. Try again.' : 'Settings saved.');
    if (!error) setCreator({ ...creator, ...updates });
  }

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (!creator) {
    return <div className="text-zinc-500">Creator profile not found.</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-2">Profile</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Channel Name *</label>
            <input
              name="channel_name"
              defaultValue={creator.channel_name}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Display Name</label>
            <input
              name="display_name"
              defaultValue={creator.display_name || ''}
              placeholder="Shown in emails"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Reply-to Email *</label>
            <input
              name="reply_to_email"
              type="email"
              defaultValue={creator.reply_to_email}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Website URL</label>
            <input
              name="website_url"
              type="url"
              defaultValue={creator.website_url || ''}
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-2">Branding</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                name="accent_color"
                type="color"
                defaultValue={creator.accent_color || '#4F46E5'}
                className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
              />
              <span className="text-xs text-zinc-500">Used on landing pages and PDFs</span>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 mb-2">Integrations</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Newsletter Webhook URL</label>
            <input
              name="newsletter_webhook_url"
              type="url"
              defaultValue={creator.newsletter_webhook_url || ''}
              placeholder="https://... (receives new subscriber events)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-zinc-600 mt-1">POST request with subscriber data on each new sign-up</p>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Billing</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium capitalize">{creator.subscription_status} Plan</div>
              <div className="text-xs text-zinc-500 mt-1">
                {creator.subscription_status === 'free'
                  ? `${creator.monthly_subscriber_count}/50 subscribers this month`
                  : 'Unlimited magnets and subscribers'}
              </div>
            </div>
            {creator.subscription_status === 'free' && (
              <a
                href="/api/billing/checkout"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
              >
                Upgrade to Pro — $19/mo
              </a>
            )}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <span className={`text-sm ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
