import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { payments, clients } from '../../data/mockData';
import type { PaymentStatus, PaymentType } from '../../types';

const statusLabels: Record<PaymentStatus, string> = { PENDING: 'Ожидает', PARTIAL: 'Частично', PAID: 'Оплачен', CANCELLED: 'Отменён', REFUNDED: 'Возврат' };
const typeLabels: Record<PaymentType, string> = { DEPOSIT: 'Залог', CAR_PAYMENT: 'За авто', DELIVERY: 'Доставка', CUSTOMS: 'Таможня', COMMISSION: 'Комиссия', ADDITIONAL: 'Доп.', REFUND: 'Возврат', OTHER: 'Прочее' };

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = payments.filter(p => {
    const matchSearch = (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getClient = (id: string) => clients.find(c => c.id === id);
  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Платежи</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{payments.length} платежей</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Всего оплачено</p>
          <p className="text-xl font-bold text-green-600 mt-1">{(totalPaid / 1000000).toFixed(1)}M ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Ожидает оплаты</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{(totalPending / 1000000).toFixed(1)}M ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Транзакций</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{payments.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">Все статусы</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-700/60 bg-surface-50 border-b border-surface-200">
                <th className="px-5 py-3.5 font-medium">Дата</th>
                <th className="px-5 py-3.5 font-medium">Клиент</th>
                <th className="px-5 py-3.5 font-medium">Описание</th>
                <th className="px-5 py-3.5 font-medium">Тип</th>
                <th className="px-5 py-3.5 font-medium text-right">Сумма</th>
                <th className="px-5 py-3.5 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const client = getClient(p.client_id);
                return (
                  <tr key={p.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition">
                    <td className="px-5 py-4 text-surface-700/60">{new Date(p.payment_date).toLocaleDateString('ru-RU')}</td>
                    <td className="px-5 py-4 text-surface-900">{client ? `${client.first_name} ${client.last_name}` : '—'}</td>
                    <td className="px-5 py-4 text-surface-700">{p.description}</td>
                    <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-100 text-surface-700">{typeLabels[p.type]}</span></td>
                    <td className="px-5 py-4 text-right font-semibold text-surface-900">{new Intl.NumberFormat('ru-RU').format(p.amount)} ₽</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        p.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>{statusLabels[p.status]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
