import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Phone, Mail, MessageCircle } from 'lucide-react';
import { clients, users } from '../../data/mockData';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = clients.filter(c => {
    const matchSearch = `${c.first_name} ${c.last_name} ${c.phone} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getManager = (id?: string) => users.find(u => u.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Клиенты</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{clients.length} клиентов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени, телефону, email..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">Все статусы</option>
          <option value="ACTIVE">Активные</option>
          <option value="VIP">VIP</option>
          <option value="INACTIVE">Неактивные</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-700/60 bg-surface-50 border-b border-surface-200">
                <th className="px-5 py-3.5 font-medium">Клиент</th>
                <th className="px-5 py-3.5 font-medium">Контакты</th>
                <th className="px-5 py-3.5 font-medium">Менеджер</th>
                <th className="px-5 py-3.5 font-medium">Источник</th>
                <th className="px-5 py-3.5 font-medium">Статус</th>
                <th className="px-5 py-3.5 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const manager = getManager(client.manager_id);
                return (
                  <tr key={client.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition">
                    <td className="px-5 py-4">
                      <Link to={`/clients/${client.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900 group-hover:text-primary-600 transition">{client.last_name} {client.first_name}</p>
                          {client.middle_name && <p className="text-xs text-surface-700/50">{client.middle_name}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-surface-700/70">
                          <Phone size={12} /> <span className="text-xs">{client.phone}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-surface-700/70">
                            <Mail size={12} /> <span className="text-xs">{client.email}</span>
                          </div>
                        )}
                        {client.telegram_username && (
                          <div className="flex items-center gap-1.5 text-primary-600">
                            <MessageCircle size={12} /> <span className="text-xs">{client.telegram_username}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-surface-700/70 text-xs">{manager ? `${manager.first_name} ${manager.last_name}` : '—'}</td>
                    <td className="px-5 py-4 text-surface-700/70 text-xs">{client.source}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        client.status === 'VIP' ? 'bg-amber-100 text-amber-700' :
                        client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{client.status === 'VIP' ? 'VIP' : client.status === 'ACTIVE' ? 'Активный' : 'Неактивный'}</span>
                    </td>
                    <td className="px-5 py-4 text-surface-700/50 text-xs">{new Date(client.created_at).toLocaleDateString('ru-RU')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-700/50">
            <p className="text-sm">Клиенты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
