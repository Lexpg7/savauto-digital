import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { cars, clients } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';
import type { CarStatus } from '../../types';

// Simulate client view - client c-001 (Андрей Николаев)
const clientCars = cars.filter(c => c.client_id === 'c-001');
const client = clients.find(c => c.id === 'c-001')!;

const statusProgress: Record<CarStatus, number> = {
  PURCHASED: 10, INSPECTION: 15, WAREHOUSE: 20, PREPARING_FOR_SHIPMENT: 30,
  WAITING_FOR_SHIPMENT: 35, SHIPPED: 50, IN_TRANSIT: 60, ARRIVED: 70,
  CUSTOMS: 80, CUSTOMS_CLEARANCE: 85, READY_FOR_DELIVERY: 95, DELIVERED: 100, CANCELLED: 0,
};

export default function MiniAppHome() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-5 pt-10 pb-8 rounded-b-3xl">
        <p className="text-white/70 text-sm">Здравствуйте,</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">{client.first_name} {client.last_name}!</h1>
        <p className="text-white/60 text-xs mt-2">Отслеживайте статус ваших автомобилей</p>
      </div>

      {/* Cars */}
      <div className="px-5 -mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-900">Мои автомобили</h2>
          <Link to="/app/cars" className="text-xs text-primary-600 font-medium">Все →</Link>
        </div>

        <div className="space-y-4">
          {clientCars.map(car => (
            <Link key={car.id} to={`/app/cars/${car.id}`} className="block bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="relative">
                <img src={car.photo_url} alt="" className="w-full h-36 object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg ${CAR_STATUS_COLORS[car.status]}`}>
                    {CAR_STATUS_LABELS[car.status]}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-surface-900">{car.make} {car.model} {car.year}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-surface-700/60">
                  {car.current_location && <span className="flex items-center gap-1"><MapPin size={12} /> {car.current_location}</span>}
                  {car.estimated_delivery_date && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(car.estimated_delivery_date).toLocaleDateString('ru-RU')}</span>}
                </div>
                {/* Progress */}
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all" style={{ width: `${statusProgress[car.status]}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-surface-700/50">Подробнее</span>
                  <ChevronRight size={16} className="text-primary-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 mt-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <p className="text-xs text-surface-700/60">Автомобилей</p>
            <p className="text-xl font-bold text-surface-900 mt-1">{clientCars.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <p className="text-xs text-surface-700/60">В пути</p>
            <p className="text-xl font-bold text-primary-600 mt-1">{clientCars.filter(c => c.status === 'IN_TRANSIT' || c.status === 'SHIPPED').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
