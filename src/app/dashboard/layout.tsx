import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Ensure creator profile exists
  const { data: creator } = await supabase
    .from('creators')
    .select('id, channel_name')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    // Auto-create creator profile on first login
    await supabase.from('creators').insert({
      user_id: user.id,
      channel_name: user.email?.split('@')[0] || 'My Channel',
      reply_to_email: user.email || '',
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-white">
              MagnetVault
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/dashboard/magnets/new" className="text-zinc-400 hover:text-white transition">
                New Magnet
              </Link>
              <Link href="/dashboard/subscribers" className="text-zinc-400 hover:text-white transition">
                Subscribers
              </Link>
              <Link href="/dashboard/settings" className="text-zinc-400 hover:text-white transition">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
