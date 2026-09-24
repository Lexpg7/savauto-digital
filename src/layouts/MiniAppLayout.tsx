import { Outlet, NavLink } from 'react-router-dom';
import { Home, Car, Bell, HeadphonesIcon, User } from 'lucide-react';

const tabs = [
  { to: '/app', icon: Home, label: 'Главная', end: true },
  { to: '/app/cars', icon: Car, label: 'Авто' },
  { to: '/app/notifications', icon: Bell, label: 'Уведомления' },
  { to: '/app/support', icon: HeadphonesIcon, label: 'Поддержка' },
  { to: '/app/profile', icon: User, label: 'Профиль' },
];

export default function MiniAppLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col max-w-lg mx-auto">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? 'text-primary-600' : 'text-surface-700/50'
                }`
              }
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
