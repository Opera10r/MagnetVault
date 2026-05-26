import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user!.id)
    .single();

  if (!creator) return null;

  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('id, subscriber_email, subscriber_name, status, created_at, utm_source, lead_magnets(title)')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(500);

  const total = subscribers?.length || 0;
  const delivered = subscribers?.filter(s => s.status === 'delivered').length || 0;
  const failed = subscribers?.filter(s => s.status === 'failed').length || 0;

  // Build CSV data as a data URI for client-side download
  const csvRows = [
    ['Email', 'Name', 'Status', 'Magnet', 'Source', 'Date'].join(','),
    ...(subscribers || []).map(s => [
      s.subscriber_email,
      s.subscriber_name || '',
      s.status,
      ((s as any).lead_magnets?.title || '').replace(/,/g, ' '),
      s.utm_source || '',
      new Date(s.created_at).toISOString(),
    ].map(v => `"${v}"`).join(',')),
  ];
  const csvString = csvRows.join('\n');
  const csvDataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Subscribers</h1>
        {total > 0 && (
          <a
            href={csvDataUri}
            download="magnetvault-subscribers.csv"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2 px-4 rounded-lg transition"
          >
            Export CSV
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-sm text-zinc-500 mt-1">Total</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-green-400">{delivered}</div>
          <div className="text-sm text-zinc-500 mt-1">Delivered</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-red-400">{failed}</div>
          <div className="text-sm text-zinc-500 mt-1">Failed</div>
        </div>
      </div>

      {/* List */}
      {(!subscribers || subscribers.length === 0) ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500 mb-4">No subscribers yet.</p>
          <Link
            href="/dashboard/magnets/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
          >
            Create a Lead Magnet
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {/* Header */}
          <div className="p-3 grid grid-cols-12 gap-2 text-xs font-medium text-zinc-500">
            <div className="col-span-4">Email</div>
            <div className="col-span-3">Magnet</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2 text-right">Date</div>
          </div>
          {subscribers.map(s => (
            <div key={s.id} className="p-3 grid grid-cols-12 gap-2 items-center text-sm">
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'delivered' ? 'bg-green-500' : s.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className="text-zinc-300 truncate">{s.subscriber_email}</span>
              </div>
              <div className="col-span-3 text-zinc-500 truncate">{(s as any).lead_magnets?.title || '—'}</div>
              <div className="col-span-1">
                <span className={`text-xs capitalize ${s.status === 'delivered' ? 'text-green-400' : s.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {s.status}
                </span>
              </div>
              <div className="col-span-2 text-zinc-600 text-xs truncate">{s.utm_source || 'Direct'}</div>
              <div className="col-span-2 text-xs text-zinc-600 text-right">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
