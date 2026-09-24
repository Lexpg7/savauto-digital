import { useState } from 'react';
import { cars } from '../../data/mockData';
import type { CarStatus } from '../../types';
import { Link } from 'react-router-dom';

const columns: CarStatus[] = ['PURCHASED', 'INSPECTION', 'WAREHOUSE', 'PREPARING_FOR_SHIPMENT', 'SHIPPED', 'IN_TRANSIT', 'ARRIVED', 'CUSTOMS', 'CUSTOMS_CLEARANCE', 'READY_FOR_DELIVERY', 'DELIVERED'];

const columnLabels: Record<string, string> = {
  PURCHASED: 'Куплен',
  INSPECTION: 'Осмотр',
  WAREHOUSE: 'Склад',
  PREPARING_FOR_SHIPMENT: 'Подготовка',
  SHIPPED: 'Отправлен',
  IN_TRANSIT: 'В пути',
  ARRIVED: 'Прибыл',
  CUSTOMS: 'Таможня',
  CUSTOMS_CLEARANCE: 'Очистка',
  READY_FOR_DELIVERY: 'Готов',
  DELIVERED: 'Выдан',
};

const columnColors: Record<string, string> = {
  PURCHASED: 'border-t-green-500',
  INSPECTION: 'border-t-blue-500',
  WAREHOUSE: 'border-t-indigo-500',
  PREPARING_FOR_SHIPMENT: 'border-t-purple-500',
  SHIPPED: 'border-t-cyan-500',
  IN_TRANSIT: 'border-t-orange-500',
  ARRIVED: 'border-t-teal-500',
  CUSTOMS: 'border-t-red-500',
  CUSTOMS_CLEARANCE: 'border-t-rose-500',
  READY_FOR_DELIVERY: 'border-t-emerald-500',
  DELIVERED: 'border-t-gray-500',
};

export default function KanbanPage() {
  const [carList, setCarList] = useState(cars);

  const getColumnCars = (status: CarStatus) => carList.filter(c => c.status === status);

  const moveCar = (carId: string, newStatus: CarStatus) => {
    setCarList(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Канбан автомобилей</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">Перетаскивайте карточки между колонками</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map(status => {
          const columnCars = getColumnCars(status);
          return (
            <div key={status} className="flex-shrink-0 w-64">
              <div className={`bg-white rounded-xl border border-surface-200 border-t-3 ${columnColors[status]}`}>
                <div className="px-3 py-2.5 border-b border-surface-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-surface-700">{columnLabels[status]}</h3>
                    <span className="text-[10px] font-bold text-surface-700/50 bg-surface-100 px-1.5 py-0.5 rounded-full">{columnCars.length}</span>
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[100px]">
                  {columnCars.map(car => (
                    <div
                      key={car.id}
                      draggable
                      className="bg-surface-50 rounded-lg p-3 border border-surface-200 cursor-grab hover:shadow-md transition group"
                    >
                      <Link to={`/cars/${car.id}`} className="block">
                        <img src={car.photo_url} alt="" className="w-full h-20 object-cover rounded-md mb-2" />
                        <p className="text-xs font-semibold text-surface-900 truncate">{car.make} {car.model}</p>
                        <p className="text-[10px] text-surface-700/50 mt-0.5">{car.year} • {car.color}</p>
                      </Link>
                      <div className="flex gap-1 mt-2">
                        {currentIndex(status) > 0 && (
                          <button onClick={() => moveCar(car.id, columns[currentIndex(status) - 1])} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-700 hover:bg-surface-300">←</button>
                        )}
                        {currentIndex(status) < columns.length - 1 && (
                          <button onClick={() => moveCar(car.id, columns[currentIndex(status) + 1])} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 hover:bg-primary-200">→</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnCars.length === 0 && (
                    <div className="text-center py-6 text-xs text-surface-700/30">Пусто</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function currentIndex(status: CarStatus): number {
  return columns.indexOf(status);
}
