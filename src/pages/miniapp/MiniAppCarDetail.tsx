import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, CreditCard, FileText, Clock } from 'lucide-react';
import { cars, payments, timelineEvents, documents } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';
import type { CarStatus } from '../../types';

const statusProgress: Record<CarStatus, number> = {
  PURCHASED: 10, INSPECTION: 15, WAREHOUSE: 20, PREPARING_FOR_SHIPMENT: 30,
  WAITING_FOR_SHIPMENT: 35, SHIPPED: 50, IN_TRANSIT: 60, ARRIVED: 70,
  CUSTOMS: 80, CUSTOMS_CLEARANCE: 85, READY_FOR_DELIVERY: 95, DELIVERED: 100, CANCELLED: 0,
};

export default function MiniAppCarDetail() {
  const { id } = useParams<{ id: string }>();
  const car = cars.find(c => c.id === id);
  if (!car) return <div className="text-center py-20 text-surface-700/50">Не найдено</div>;

  const carPayments = payments.filter(p => p.car_id === id);
  const carTimeline = timelineEvents.filter(t => t.car_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const carDocs = documents.filter(d => d.car_id === id && d.is_visible_to_client);
  const totalPaid = carPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const remaining = car.sale_price - totalPaid;

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero Image */}
      <div className="relative">
        <img src={car.photo_url} alt="" className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link to="/app/cars" className="absolute top-8 left-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <ArrowLeft size={16} className="text-white" />
        </Link>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-xl font-bold">{car.make} {car.model}</h1>
          <p className="text-white/70 text-sm">{car.year} • {car.color}</p>
        </div>
        <div className="absolute top-8 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${CAR_STATUS_COLORS[car.status]}`}>{CAR_STATUS_LABELS[car.status]}</span>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-surface-200 p-4">
          <h3 className="text-sm font-semibold text-surface-900 mb-3">Прогресс</h3>
          <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${statusProgress[car.status]}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-surface-700/50">
            <span>Покупка</span><span>Отправка</span><span>Таможня</span><span>Выдача</span>
          </div>
          {car.current_location && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-surface-700/70">
              <MapPin size={14} className="text-primary-500" /> {car.current_location}
            </div>
          )}
          {car.estimated_delivery_date && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-surface-700/70">
              <Calendar size={14} className="text-primary-500" /> Ожидается: {new Date(car.estimated_delivery_date).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>

        {/* Finance */}
        <div className="bg-white rounded-2xl border border-surface-200 p-4">
          <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2"><CreditCard size={16} /> Финансы</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-surface-700/50">Стоимость</p>
              <p className="text-sm font-bold text-surface-900">{(car.sale_price / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-surface-700/50">Оплачено</p>
              <p className="text-sm font-bold text-green-600">{(totalPaid / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-surface-700/50">Остаток</p>
              <p className="text-sm font-bold text-amber-600">{remaining > 0 ? `${(remaining / 1000000).toFixed(1)}M` : '0'}</p>
            </div>
          </div>
          {carPayments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-100 space-y-2">
              {carPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-surface-700/70">{p.description}</span>
                  <span className={`font-medium ${p.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{new Intl.NumberFormat('ru-RU').format(p.amount)} ₽</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-surface-200 p-4">
          <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2"><Clock size={16} /> История</h3>
          <div className="space-y-3">
            {carTimeline.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-surface-300'}`} />
                  {i < carTimeline.length - 1 && <div className="w-0.5 flex-1 bg-surface-200 mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs font-medium text-surface-900">{event.title}</p>
                  {event.description && <p className="text-[10px] text-surface-700/60 mt-0.5">{event.description}</p>}
                  <p className="text-[10px] text-surface-700/40 mt-1">{new Date(event.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            ))}
            {carTimeline.length === 0 && <p className="text-xs text-surface-700/50">Нет событий</p>}
          </div>
        </div>

        {/* Documents */}
        {carDocs.length > 0 && (
          <div className="bg-white rounded-2xl border border-surface-200 p-4">
            <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2"><FileText size={16} /> Документы</h3>
            <div className="space-y-2">
              {carDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 py-2 border-b border-surface-100 last:border-0">
                  <FileText size={14} className="text-primary-500" />
                  <span className="text-xs text-surface-900">{doc.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
