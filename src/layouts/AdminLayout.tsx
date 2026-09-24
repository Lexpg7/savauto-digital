import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Briefcase, Car, KanbanSquare, CreditCard, CheckSquare, FileText, HeadphonesIcon, Bell, Settings, Menu, X, Search, LogOut, ChevronDown } from 'lucide-react';
import { currentUser, notifications } from '../data/mockData';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/clients', icon: Users, label: 'Клиенты' },
  { to: '/leads', icon: UserPlus, label: 'Лиды' },
  { to: '/deals', icon: Briefcase, label: 'Сделки' },
  { to: '/cars', icon: Car, label: 'Автомобили' },
  { to: '/cars/kanban', icon: KanbanSquare, label: 'Канбан' },
  { to: '/payments', icon: CreditCard, label: 'Платежи' },
  { to: '/tasks', icon: CheckSquare, label: 'Задачи' },
  { to: '/documents', icon: FileText, label: 'Документы' },
  { to: '/support', icon: HeadphonesIcon, label: 'Поддержка' },
  { to: '/notifications', icon: Bell, label: 'Уведомления' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:in-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-sm">SA</div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">SAVAUTO</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Digital Platform</p>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-surface-200 px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface-100">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 text-sm text-surface-700 hover:bg-surface-200 transition">
                <Search size={16} className="text-surface-700/50" />
                <span className="text-surface-700/50">Глобальный поиск...</span>
              </button>
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-surface-200 p-4 animate-fade-in">
                  <input autoFocus type="text" placeholder="Клиент, VIN, телефон, email..." className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <p className="text-xs text-surface-700/50 mt-2">Поиск по клиентам, автомобилям, VIN, документам</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications */}
              <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-surface-100 transition">
                <Bell size={20} className="text-surface-700" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />}
              </button>

              {/* Profile */}
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.first_name[0]}{currentUser.last_name[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-surface-900">{currentUser.first_name}</p>
                    <p className="text-[10px] text-surface-700/60">{currentUser.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-surface-700/50" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-surface-200 py-2 animate-fade-in">
                    <button onClick={() => { setProfileOpen(false); navigate('/app'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-100 flex items-center gap-2">
                      <span>📱</span> Mini App
                    </button>
                    <hr className="my-1 border-surface-200" />
                    <button onClick={() => { setProfileOpen(false); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-surface-100 flex items-center gap-2">
                      <LogOut size={14} /> Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
