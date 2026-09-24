import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin } from 'lucide-react';
import { cars, clients } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';
import type { CarStatus } from '../../types';

export default function CarsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = cars.filter(c => {
    const matchSearch = `${c.make} ${c.model} ${c.vin || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getClient = (id: string) => clients.find(c => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Автомобили</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{cars.length} автомобилей</p>
        </div>
        <div className="flex gap-2">
          <Link to="/cars/kanban" className="px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition">
            Канбан
          </Link>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
            <Plus size={16} /> Добавить
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Марка, модель, VIN..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">Все статусы</option>
          {Object.entries(CAR_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(car => {
          const client = getClient(car.client_id);
          return (
            <Link key={car.id} to={`/cars/${car.id}`} className="bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-xl hover:shadow-surface-200/50 transition-all group">
              <div className="relative">
                <img src={car.photo_url} alt={`${car.make} ${car.model}`} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg ${CAR_STATUS_COLORS[car.status]}`}>
                    {CAR_STATUS_LABELS[car.status]}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-surface-900">{car.make} {car.model} {car.year}</h3>
                {car.generation && <p className="text-xs text-surface-700/50 mt-0.5">{car.generation}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-surface-700/60">
                  <span>{car.engine}</span>
                  <span>{car.transmission === 'AUTOMATIC' ? 'АКПП' : car.transmission === 'CVT' ? 'Вариатор' : 'МКПП'}</span>
                  <span>{car.fuel_type === 'PETROL' ? 'Бензин' : car.fuel_type === 'DIESEL' ? 'Дизель' : car.fuel_type === 'HYBRID' ? 'Гибрид' : 'Электро'}</span>
                </div>
                {car.current_location && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-surface-700/50">
                    <MapPin size={12} /> {car.current_location}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                  <span className="text-xs text-surface-700/50">{client ? `${client.first_name} ${client.last_name}` : ''}</span>
                  <span className="font-semibold text-sm text-surface-900">{new Intl.NumberFormat('ru-RU').format(car.sale_price)} ₽</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
