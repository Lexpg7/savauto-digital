import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, Car, CreditCard, FileText, CheckSquare } from 'lucide-react';
import { clients, deals, cars, payments, documents, tasks, users } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS, DEAL_STATUS_LABELS } from '../../types';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const client = clients.find(c => c.id === id);
  if (!client) return <div className="text-center py-20 text-surface-700/50">Клиент не найден</div>;

  const manager = users.find(u => u.id === client.manager_id);
  const clientDeals = deals.filter(d => d.client_id === id);
  const clientCars = cars.filter(c => c.client_id === id);
  const clientPayments = payments.filter(p => p.client_id === id);
  const clientDocs = documents.filter(d => d.client_id === id);
  const clientTasks = tasks.filter(t => t.client_id === id);

  const totalPaid = clientPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalDeals = clientDeals.reduce((s, d) => s + d.estimated_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-surface-700/60 hover:text-primary-600 transition">
        <ArrowLeft size={16} /> Назад к клиентам
      </Link>

      {/* Client Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xl font-bold">
            {client.first_name[0]}{client.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-surface-900">{client.last_name} {client.first_name} {client.middle_name || ''}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-surface-700/70">
              <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>
              {client.email && <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>}
              {client.telegram_username && <span className="flex items-center gap-1 text-primary-600"><MessageCircle size={14} /> {client.telegram_username}</span>}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                client.status === 'VIP' ? 'bg-amber-100 text-amber-700' :
                client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'
              }`}>{client.status}</span>
              <span className="text-xs text-surface-700/50">Менеджер: {manager ? `${manager.first_name} ${manager.last_name}` : '—'}</span>
              <span className="text-xs text-surface-700/50">Источник: {client.source}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Сделки</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{clientDeals.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Автомобили</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{clientCars.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Общая сумма</p>
          <p className="text-xl font-bold text-surface-900 mt-1">{(totalDeals / 1000000).toFixed(1)}M ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Оплачено</p>
          <p className="text-xl font-bold text-green-600 mt-1">{(totalPaid / 1000000).toFixed(1)}M ₽</p>
        </div>
      </div>

      {/* Deals & Cars */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><Briefcase size={18} /> Сделки</h3>
          <div className="space-y-3">
            {clientDeals.map(deal => (
              <div key={deal.id} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="font-medium text-sm text-surface-900">{deal.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-surface-700/60">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(deal.estimated_amount)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">{DEAL_STATUS_LABELS[deal.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><Car size={18} /> Автомобили</h3>
          <div className="space-y-3">
            {clientCars.map(car => (
              <Link key={car.id} to={`/cars/${car.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100 hover:border-primary-200 transition group">
                <img src={car.photo_url} alt="" className="w-14 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-surface-900 group-hover:text-primary-600">{car.make} {car.model} {car.year}</p>
                  <p className="text-xs text-surface-700/60">{car.current_location || car.country}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${CAR_STATUS_COLORS[car.status]}`}>{CAR_STATUS_LABELS[car.status]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Payments & Documents */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Платежи</h3>
          <div className="space-y-2">
            {clientPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                <div>
                  <p className="text-sm text-surface-900">{p.description}</p>
                  <p className="text-xs text-surface-700/50">{new Date(p.payment_date).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-surface-900">{new Intl.NumberFormat('ru-RU').format(p.amount)} ₽</p>
                  <span className={`text-[10px] font-semibold ${p.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{p.status === 'PAID' ? 'Оплачен' : 'Ожидает'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><FileText size={18} /> Документы</h3>
          <div className="space-y-2">
            {clientDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary-500" />
                  <span className="text-sm text-surface-900">{doc.title}</span>
                </div>
                <span className="text-xs text-surface-700/50">{doc.category}</span>
              </div>
            ))}
          </div>
          {clientTasks.length > 0 && (
            <>
              <h3 className="font-semibold text-surface-900 mb-4 mt-6 flex items-center gap-2"><CheckSquare size={18} /> Задачи</h3>
              <div className="space-y-2">
                {clientTasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                    <span className="text-sm text-surface-900">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Briefcase({ size, className }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
