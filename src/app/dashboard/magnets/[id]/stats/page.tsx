import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function MagnetStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: magnet } = await supabase
    .from('lead_magnets')
    .select('id, title, slug, is_published, total_subscribers, total_delivered, created_at')
    .eq('id', id)
    .single();

  if (!magnet) notFound();

  const { data: subs } = await supabase
    .from('subscribers')
    .select('id, subscriber_email, status, created_at, utm_source, referrer_url')
    .eq('magnet_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  const delivered = subs?.filter(s => s.status === 'delivered').length || 0;
  const failed = subs?.filter(s => s.status === 'failed').length || 0;
  const rate = magnet.total_subscribers > 0 ? Math.round((delivered / magnet.total_subscribers) * 100) : 0;

  // Source breakdown
  const sources: Record<string, number> = {};
  subs?.forEach(s => {
    const src = s.utm_source || (s.referrer_url ? new URL(s.referrer_url).hostname : 'Direct');
    sources[src] = (sources[src] || 0) + 1;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 text-sm">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-white">{magnet.title}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white">{magnet.total_subscribers}</div>
          <div className="text-sm text-zinc-500 mt-1">Total Subs</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-green-400">{delivered}</div>
          <div className="text-sm text-zinc-500 mt-1">Delivered</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white">{rate}%</div>
          <div className="text-sm text-zinc-500 mt-1">Delivery Rate</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-red-400">{failed}</div>
          <div className="text-sm text-zinc-500 mt-1">Failed</div>
        </div>
      </div>

      {/* Sources */}
      {Object.keys(sources).length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Traffic Sources</h2>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(sources).sort(([,a],[,b]) => b - a).map(([src, count]) => (
              <div key={src} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm">
                <span className="text-white">{src}</span>
                <span className="text-zinc-500 ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriber List */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Subscribers</h2>
        {(!subs || subs.length === 0) ? (
          <p className="text-zinc-600 text-sm">No subscribers yet.</p>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {subs.map(s => (
              <div key={s.id} className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${s.status === 'delivered' ? 'bg-green-500' : s.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-zinc-300">{s.subscriber_email}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-600">
                  {s.utm_source && <span>{s.utm_source}</span>}
                  <span>{new Date(s.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
