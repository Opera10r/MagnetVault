import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: creator } = await supabase
    .from('creators')
    .select('id, subscription_status, monthly_subscriber_count')
    .eq('user_id', user!.id)
    .single();

  if (!creator) return null;

  const { data: magnets } = await supabase
    .from('lead_magnets')
    .select('id, title, slug, is_published, total_subscribers, created_at')
    .eq('creator_id', creator.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  const { data: recentSubs } = await supabase
    .from('subscribers')
    .select('id, subscriber_email, status, created_at, lead_magnets(title)')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const totalSubs = magnets?.reduce((sum, m) => sum + (m.total_subscribers || 0), 0) || 0;
  const activeMagnets = magnets?.filter(m => m.is_published).length || 0;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white">{totalSubs}</div>
          <div className="text-sm text-zinc-500 mt-1">Total Subscribers</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white">{activeMagnets}</div>
          <div className="text-sm text-zinc-500 mt-1">Active Magnets</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white capitalize">{creator.subscription_status}</div>
          <div className="text-sm text-zinc-500 mt-1">Plan</div>
        </div>
      </div>

      {/* Lead Magnets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Lead Magnets</h2>
          <Link
            href="/dashboard/magnets/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
          >
            + Create New
          </Link>
        </div>

        {(!magnets || magnets.length === 0) ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-500 mb-4">No lead magnets yet. Create your first one!</p>
            <Link
              href="/dashboard/magnets/new"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
            >
              Create Lead Magnet
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {magnets.map((m) => (
              <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{m.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                      {m.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {m.is_published ? (
                      <span>{process.env.NEXT_PUBLIC_APP_URL}/v/{m.slug} &middot; {m.total_subscribers} subscribers</span>
                    ) : (
                      <span>{m.total_subscribers} subscribers</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/magnets/${m.id}/edit`}
                    className="text-xs text-zinc-400 hover:text-white transition bg-zinc-800 hover:bg-zinc-700 py-1.5 px-3 rounded-lg"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/magnets/${m.id}/stats`}
                    className="text-xs text-zinc-400 hover:text-white transition bg-zinc-800 hover:bg-zinc-700 py-1.5 px-3 rounded-lg"
                  >
                    Stats
                  </Link>
                  {m.is_published && (
                    <a
                      href={`/v/${m.slug}`}
                      target="_blank"
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition bg-indigo-500/10 py-1.5 px-3 rounded-lg"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Subscribers */}
      {recentSubs && recentSubs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Subscribers</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {recentSubs.map((s) => (
              <div key={s.id} className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${s.status === 'delivered' ? 'bg-green-500' : s.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-zinc-300">{s.subscriber_email}</span>
                  <span className="text-zinc-600">&middot;</span>
                  <span className="text-zinc-500 text-xs">{(s as any).lead_magnets?.title}</span>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
