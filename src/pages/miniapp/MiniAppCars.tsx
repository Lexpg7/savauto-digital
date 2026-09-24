import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { cars } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';
import type { CarStatus } from '../../types';

const clientCars = cars.filter(c => c.client_id === 'c-001');

const statusProgress: Record<CarStatus, number> = {
  PURCHASED: 10, INSPECTION: 15, WAREHOUSE: 20, PREPARING_FOR_SHIPMENT: 30,
  WAITING_FOR_SHIPMENT: 35, SHIPPED: 50, IN_TRANSIT: 60, ARRIVED: 70,
  CUSTOMS: 80, CUSTOMS_CLEARANCE: 85, READY_FOR_DELIVERY: 95, DELIVERED: 100, CANCELLED: 0,
};

export default function MiniAppCars() {
  return (
    <div className="px-5 pt-8 pb-8 animate-fade-in">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Мои автомобили</h1>
      <p className="text-sm text-surface-700/60 mb-6">{clientCars.length} автомобилей</p>

      <div className="space-y-4">
        {clientCars.map(car => (
          <Link key={car.id} to={`/app/cars/${car.id}`} className="block bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
            <div className="flex">
              <img src={car.photo_url} alt="" className="w-28 h-28 object-cover" />
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-surface-900">{car.make} {car.model}</h3>
                    <p className="text-xs text-surface-700/50">{car.year} • {car.color}</p>
                  </div>
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CAR_STATUS_COLORS[car.status]}`}>
                  {CAR_STATUS_LABELS[car.status]}
                </span>
                <div className="mt-2">
                  <div className="w-full h-1 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${statusProgress[car.status]}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {car.current_location && <span className="text-[10px] text-surface-700/50 flex items-center gap-0.5"><MapPin size={10} /> {car.current_location}</span>}
                  <ChevronRight size={14} className="text-primary-500" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
