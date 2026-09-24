import { Phone, Mail, MessageCircle, LogOut } from 'lucide-react';
import { clients } from '../../data/mockData';

const client = clients.find(c => c.id === 'c-001')!;

export default function MiniAppProfile() {
  return (
    <div className="px-5 pt-8 pb-8 animate-fade-in">
      <h1 className="text-xl font-bold text-surface-900 mb-6">Профиль</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {client.first_name[0]}{client.last_name[0]}
        </div>
        <h2 className="text-lg font-semibold text-surface-900 mt-3">{client.last_name} {client.first_name}</h2>
        {client.middle_name && <p className="text-sm text-surface-700/60">{client.middle_name}</p>}
        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
          client.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        }`}>{client.status === 'VIP' ? 'VIP клиент' : 'Активный'}</span>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="divide-y divide-surface-100">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Phone size={18} className="text-surface-700/40" />
            <div>
              <p className="text-[10px] text-surface-700/50">Телефон</p>
              <p className="text-sm text-surface-900">{client.phone}</p>
            </div>
          </div>
          {client.email && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Mail size={18} className="text-surface-700/40" />
              <div>
                <p className="text-[10px] text-surface-700/50">Email</p>
                <p className="text-sm text-surface-900">{client.email}</p>
              </div>
            </div>
          )}
          {client.telegram_username && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <MessageCircle size={18} className="text-primary-500" />
              <div>
                <p className="text-[10px] text-surface-700/50">Telegram</p>
                <p className="text-sm text-primary-600">{client.telegram_username}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <button className="w-full py-3 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition">
          Редактировать профиль
        </button>
        <button className="w-full py-3 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2">
          <LogOut size={16} /> Выйти
        </button>
      </div>

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-surface-700/40">SAVAUTO DIGITAL v1.0.0</p>
        <p className="text-[10px] text-surface-700/30 mt-1">Telegram Mini App</p>
      </div>
    </div>
  );
}
