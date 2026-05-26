import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold">MagnetVault</span>
          <div className="flex items-center gap-4 text-sm">
            <a href="#features" className="text-zinc-400 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition">Pricing</a>
            <Link href="/login" className="text-zinc-400 hover:text-white transition">Log In</Link>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
          Turn your content into<br />
          <span className="text-indigo-400">lead-generating machines</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Create beautiful landing pages, auto-generate PDFs from your content,
          and deliver them instantly to new subscribers. No design skills required.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
          >
            Start Free
          </Link>
          <a
            href="#features"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium py-3 px-8 rounded-lg text-lg transition"
          >
            See How It Works
          </a>
        </div>
        <p className="text-sm text-zinc-600 mt-4">Free tier: 1 magnet, 50 subscribers/month. No credit card required.</p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to grow your list</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Instant PDF Generation',
              description: 'Write in Markdown, get a polished PDF with your branding — title page, formatted content, CTA page, and custom footer.',
            },
            {
              title: 'Landing Pages That Convert',
              description: 'Every lead magnet gets a shareable landing page with social proof, custom colors, and a mobile-first design.',
            },
            {
              title: 'Automatic Email Delivery',
              description: 'Subscribers get their PDF within seconds via email. No manual work, no file uploads, no broken links.',
            },
            {
              title: 'Subscriber Analytics',
              description: 'Track total signups, delivery rates, traffic sources, and UTM campaigns for every magnet.',
            },
            {
              title: 'Webhook Integrations',
              description: 'Auto-sync new subscribers to your email platform via webhook — ConvertKit, Mailchimp, or any tool that accepts POST.',
            },
            {
              title: 'Multi-Magnet Dashboard',
              description: 'Manage unlimited lead magnets from a single dashboard. Create, edit, archive, and monitor performance.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { step: '1', title: 'Write your content', description: 'Paste or write Markdown. Add a hook description and CTA.' },
            { step: '2', title: 'Publish your magnet', description: 'Get a shareable link instantly. Embed it anywhere.' },
            { step: '3', title: 'Collect subscribers', description: 'Visitors opt in, get a PDF, and you get their email.' },
          ].map((s) => (
            <div key={s.step}>
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-400">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-1">Free</h3>
            <div className="text-3xl font-bold text-white mb-4">$0<span className="text-base font-normal text-zinc-500">/mo</span></div>
            <ul className="space-y-2 text-sm text-zinc-400 mb-6">
              <li>1 lead magnet</li>
              <li>50 subscribers/month</li>
              <li>PDF generation + email delivery</li>
              <li>Basic analytics</li>
            </ul>
            <Link
              href="/login"
              className="block text-center border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium py-2.5 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
          <div className="bg-zinc-900 border-2 border-indigo-500 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-8 bg-indigo-600 text-xs font-bold text-white px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
            <div className="text-3xl font-bold text-white mb-4">$19<span className="text-base font-normal text-zinc-500">/mo</span></div>
            <ul className="space-y-2 text-sm text-zinc-400 mb-6">
              <li>Unlimited lead magnets</li>
              <li>Unlimited subscribers</li>
              <li>Custom branding + colors</li>
              <li>Webhook integrations</li>
              <li>Full analytics + CSV export</li>
              <li>Priority delivery</li>
            </ul>
            <Link
              href="/login"
              className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition"
            >
              Start Free, Upgrade Later
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to build your list?</h2>
        <p className="text-zinc-400 mb-8">Create your first lead magnet in under 5 minutes.</p>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-lg text-lg transition"
        >
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-zinc-600">
          <span>MagnetVault by Raven&apos;s Gate Publishers LLC</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
