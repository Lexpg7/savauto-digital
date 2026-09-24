import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, CreditCard, FileText, Clock } from 'lucide-react';
import { cars, clients, payments, timelineEvents, documents } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const car = cars.find(c => c.id === id);
  if (!car) return <div className="text-center py-20 text-surface-700/50">Автомобиль не найден</div>;

  const client = clients.find(c => c.id === car.client_id);
  const carPayments = payments.filter(p => p.car_id === id);
  const carTimeline = timelineEvents.filter(t => t.car_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const carDocs = documents.filter(d => d.car_id === id);
  const totalPaid = carPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const remaining = car.sale_price - totalPaid;

  const statuses = Object.keys(CAR_STATUS_LABELS) as Array<keyof typeof CAR_STATUS_LABELS>;
  const currentIndex = statuses.indexOf(car.status);
  const progress = ((currentIndex + 1) / statuses.length) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/cars" className="inline-flex items-center gap-1.5 text-sm text-surface-700/60 hover:text-primary-600 transition">
        <ArrowLeft size={16} /> Назад к автомобилям
      </Link>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img src={car.photo_url} alt={`${car.make} ${car.model}`} className="w-full h-64 md:h-full object-cover" />
          </div>
          <div className="md:w-1/2 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-surface-900">{car.make} {car.model}</h1>
                <p className="text-surface-700/60 mt-1">{car.year} • {car.generation || ''} • {car.color}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${CAR_STATUS_COLORS[car.status]}`}>
                {CAR_STATUS_LABELS[car.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><p className="text-xs text-surface-700/50">Двигатель</p><p className="font-medium text-sm">{car.engine} ({car.engine_volume} см³)</p></div>
              <div><p className="text-xs text-surface-700/50">Топливо</p><p className="font-medium text-sm">{car.fuel_type === 'PETROL' ? 'Бензин' : car.fuel_type === 'DIESEL' ? 'Дизель' : car.fuel_type}</p></div>
              <div><p className="text-xs text-surface-700/50">КПП</p><p className="font-medium text-sm">{car.transmission === 'AUTOMATIC' ? 'АКПП' : car.transmission === 'CVT' ? 'Вариатор' : car.transmission}</p></div>
              <div><p className="text-xs text-surface-700/50">Привод</p><p className="font-medium text-sm">{car.drive_type}</p></div>
              <div><p className="text-xs text-surface-700/50">VIN</p><p className="font-medium text-sm font-mono">{car.vin || '—'}</p></div>
              <div><p className="text-xs text-surface-700/50">Страна</p><p className="font-medium text-sm">{car.country}</p></div>
            </div>

            {car.current_location && (
              <div className="flex items-center gap-2 mt-4 text-sm text-surface-700/70">
                <MapPin size={14} className="text-primary-500" /> {car.current_location}
              </div>
            )}
            {car.estimated_delivery_date && (
              <div className="flex items-center gap-2 mt-2 text-sm text-surface-700/70">
                <Calendar size={14} className="text-primary-500" /> Ожидается: {new Date(car.estimated_delivery_date).toLocaleDateString('ru-RU')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 className="font-semibold text-surface-900 mb-3">Прогресс</h3>
        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-surface-700/50">
          <span>Покупка</span>
          <span>Логистика</span>
          <span>Таможня</span>
          <span>Выдача</span>
        </div>
      </div>

      {/* Finance */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Стоимость</p>
          <p className="text-lg font-bold text-surface-900 mt-1">{new Intl.NumberFormat('ru-RU').format(car.sale_price)} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Оплачено</p>
          <p className="text-lg font-bold text-green-600 mt-1">{new Intl.NumberFormat('ru-RU').format(totalPaid)} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Остаток</p>
          <p className="text-lg font-bold text-amber-600 mt-1">{new Intl.NumberFormat('ru-RU').format(remaining > 0 ? remaining : 0)} ₽</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <p className="text-xs text-surface-700/60">Клиент</p>
          <p className="text-lg font-bold text-surface-900 mt-1">{client ? `${client.first_name} ${client.last_name}` : '—'}</p>
        </div>
      </div>

      {/* Timeline & Payments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><Clock size={18} /> Timeline</h3>
          <div className="space-y-4">
            {carTimeline.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-surface-300'}`} />
                  {i < carTimeline.length - 1 && <div className="w-0.5 flex-1 bg-surface-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-surface-900">{event.title}</p>
                  {event.description && <p className="text-xs text-surface-700/60 mt-0.5">{event.description}</p>}
                  <p className="text-[10px] text-surface-700/40 mt-1">{new Date(event.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} {event.location && `• ${event.location}`}</p>
                </div>
              </div>
            ))}
            {carTimeline.length === 0 && <p className="text-sm text-surface-700/50">Нет событий</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Платежи</h3>
            <div className="space-y-2">
              {carPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div>
                    <p className="text-sm text-surface-900">{p.description}</p>
                    <p className="text-xs text-surface-700/50">{new Date(p.payment_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Intl.NumberFormat('ru-RU').format(p.amount)} ₽</p>
                    <span className={`text-[10px] font-semibold ${p.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{p.status === 'PAID' ? '✓' : '⏳'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2"><FileText size={18} /> Документы</h3>
            <div className="space-y-2">
              {carDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 py-2 border-b border-surface-100 last:border-0">
                  <FileText size={14} className="text-primary-500" />
                  <span className="text-sm text-surface-900">{doc.title}</span>
                  <span className="text-xs text-surface-700/50 ml-auto">{doc.category}</span>
                </div>
              ))}
              {carDocs.length === 0 && <p className="text-sm text-surface-700/50">Нет документов</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
