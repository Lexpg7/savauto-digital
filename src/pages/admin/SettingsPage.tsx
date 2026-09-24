import { Settings as SettingsIcon, Users, Shield, Bell, Globe, Database } from 'lucide-react';
import { currentUser, users } from '../../data/mockData';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Настройки</h1>
        <p className="text-sm text-surface-700/60 mt-0.5">Управление платформой</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Company */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Globe size={20} className="text-primary-600" /></div>
            <h3 className="font-semibold text-surface-900">Компания</h3>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-surface-700/60">Название</label><p className="text-sm font-medium text-surface-900">SAVAUTO</p></div>
            <div><label className="text-xs text-surface-700/60">Email</label><p className="text-sm font-medium text-surface-900">info@savauto.ru</p></div>
            <div><label className="text-xs text-surface-700/60">Телефон</label><p className="text-sm font-medium text-surface-900">+7 (495) 123-45-67</p></div>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Users size={20} className="text-primary-600" /></div>
            <h3 className="font-semibold text-surface-900">Профиль</h3>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-surface-700/60">Имя</label><p className="text-sm font-medium text-surface-900">{currentUser.first_name} {currentUser.last_name}</p></div>
            <div><label className="text-xs text-surface-700/60">Email</label><p className="text-sm font-medium text-surface-900">{currentUser.email}</p></div>
            <div><label className="text-xs text-surface-700/60">Роль</label><p className="text-sm font-medium text-surface-900">{currentUser.role}</p></div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Shield size={20} className="text-primary-600" /></div>
            <h3 className="font-semibold text-surface-900">Команда</h3>
          </div>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-2 py-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">{u.first_name[0]}{u.last_name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-900 truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-[10px] text-surface-700/50">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Bell size={20} className="text-primary-600" /></div>
            <h3 className="font-semibold text-surface-900">Уведомления</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between"><span className="text-sm text-surface-700">Email уведомления</span><input type="checkbox" defaultChecked className="rounded" /></label>
            <label className="flex items-center justify-between"><span className="text-sm text-surface-700">Telegram уведомления</span><input type="checkbox" defaultChecked className="rounded" /></label>
            <label className="flex items-center justify-between"><span className="text-sm text-surface-700">Звуковые уведомления</span><input type="checkbox" className="rounded" /></label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Database size={20} className="text-primary-600" /></div>
            <h3 className="font-semibold text-surface-900">Система</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-surface-700/60">Версия</span><span className="font-medium">1.0.0</span></div>
            <div className="flex justify-between text-sm"><span className="text-surface-700/60">API</span><span className="font-medium">v1</span></div>
            <div className="flex justify-between text-sm"><span className="text-surface-700/60">Статус</span><span className="text-green-600 font-medium">● Работает</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
