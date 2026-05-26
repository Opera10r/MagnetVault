'use client';

import { useState } from 'react';

interface Props {
  magnet: {
    id: string;
    title: string;
    hook_description: string;
    button_cta: string;
    social_proof_text?: string;
    hero_image_url?: string;
  };
  creator: {
    channel_name: string;
    display_name?: string;
    logo_url?: string;
  };
  accentColor: string;
}

export default function LandingPageClient({ magnet, creator, accentColor }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState('submitting');

    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch('/api/vault/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          magnet_id: magnet.id,
          email: email.trim(),
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          referrer: document.referrer || null,
        }),
      });

      const data = await res.json();

      if (data.duplicate) {
        setState('duplicate');
      } else if (data.success) {
        setState('success');
      } else {
        setErrorMsg(data.error || 'Something went wrong.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  };

  if (state === 'success' || state === 'duplicate') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">&#9993;&#65039;</div>
          <h2 className="text-xl font-bold text-gray-900">
            {state === 'duplicate' ? 'Already subscribed!' : 'Check your inbox!'}
          </h2>
          <p className="mt-2 text-gray-600">
            {state === 'duplicate'
              ? `We've already sent "${magnet.title}" to this email. Check your inbox (and spam folder).`
              : `"${magnet.title}" is on its way to ${email}. It should arrive within a minute.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {creator.logo_url && (
          <img src={creator.logo_url} alt="" className="h-10 mx-auto" />
        )}

        {magnet.hero_image_url && (
          <img
            src={magnet.hero_image_url}
            alt=""
            className="w-full rounded-xl"
          />
        )}

        <div className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: accentColor }}
          >
            Free Resource by {creator.display_name || creator.channel_name}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{magnet.title}</h1>
          <p className="mt-3 text-gray-600 text-sm leading-relaxed">
            {magnet.hook_description}
          </p>
        </div>

        {magnet.social_proof_text && (
          <p className="text-center text-xs text-gray-400">
            {magnet.social_proof_text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full py-4 text-white font-semibold rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {state === 'submitting' ? 'Sending...' : magnet.button_cta}
          </button>
        </form>

        {state === 'error' && (
          <p className="text-center text-sm text-red-500">{errorMsg}</p>
        )}

        <p className="text-center text-xs text-gray-400">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
