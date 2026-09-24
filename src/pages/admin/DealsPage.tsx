import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { deals, clients } from '../../data/mockData';
import { DEAL_STATUS_LABELS } from '../../types';
import type { DealStatus } from '../../types';

const statusColors: Record<DealStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CALCULATION: 'bg-indigo-100 text-indigo-700',
  PROPOSAL: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-violet-100 text-violet-700',
  PAYMENT: 'bg-amber-100 text-amber-700',
  CAR_PURCHASE: 'bg-orange-100 text-orange-700',
  LOGISTICS: 'bg-cyan-100 text-cyan-700',
  CUSTOMS: 'bg-red-100 text-red-700',
  READY: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = deals.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getClient = (id: string) => clients.find(c => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Сделки</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{deals.length} сделок</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Новая сделка
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">Все статусы</option>
          {Object.entries(DEAL_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map(deal => {
          const client = getClient(deal.client_id);
          return (
            <div key={deal.id} className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-lg hover:shadow-surface-200/50 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-surface-900">{deal.title}</h3>
                  <p className="text-sm text-surface-700/60 mt-1">
                    Клиент: {client ? `${client.first_name} ${client.last_name}` : '—'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[deal.status]}`}>
                  {DEAL_STATUS_LABELS[deal.status]}
                </span>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-100">
                <div>
                  <p className="text-xs text-surface-700/50">Сумма</p>
                  <p className="font-semibold text-surface-900">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(deal.estimated_amount)}</p>
                </div>
                {deal.final_amount && (
                  <div>
                    <p className="text-xs text-surface-700/50">Итого</p>
                    <p className="font-semibold text-green-600">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(deal.final_amount)}</p>
                  </div>
                )}
                <div className="ml-auto text-xs text-surface-700/50">
                  Создана: {new Date(deal.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
