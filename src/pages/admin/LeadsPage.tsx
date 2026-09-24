import { useState } from 'react';
import { Search, Plus, Phone, ArrowRight } from 'lucide-react';
import { leads } from '../../data/mockData';
import { LEAD_STATUS_LABELS } from '../../types';
import type { LeadStatus } from '../../types';

const statusColors: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-indigo-100 text-indigo-700',
  QUALIFIED: 'bg-purple-100 text-purple-700',
  PROPOSAL: 'bg-amber-100 text-amber-700',
  NEGOTIATION: 'bg-orange-100 text-orange-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-gray-100 text-gray-600',
};

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = leads.filter(l => {
    const matchSearch = `${l.first_name} ${l.last_name} ${l.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Лиды</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{leads.length} лидов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Новый лид
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">Все статусы</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-700/60 bg-surface-50 border-b border-surface-200">
                <th className="px-5 py-3.5 font-medium">Имя</th>
                <th className="px-5 py-3.5 font-medium">Телефон</th>
                <th className="px-5 py-3.5 font-medium">Источник</th>
                <th className="px-5 py-3.5 font-medium">Статус</th>
                <th className="px-5 py-3.5 font-medium">Заметки</th>
                <th className="px-5 py-3.5 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        {lead.first_name[0]}{lead.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{lead.last_name} {lead.first_name}</p>
                        {lead.email && <p className="text-xs text-surface-700/50">{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-surface-700/70 flex items-center gap-1"><Phone size={12} /> {lead.phone}</td>
                  <td className="px-5 py-4 text-surface-700/70">{lead.source}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColors[lead.status]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-surface-700/60 text-xs max-w-[200px] truncate">{lead.notes || '—'}</td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                      В клиент <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
