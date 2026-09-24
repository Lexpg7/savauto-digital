import { Bell, Check } from 'lucide-react';
import { notifications } from '../../data/mockData';
import type { NotificationType } from '../../types';

const typeIcons: Record<NotificationType, string> = {
  STATUS_CHANGED: '🚗',
  PAYMENT_CREATED: '💰',
  PAYMENT_DUE: '⏰',
  PAYMENT_OVERDUE: '⚠️',
  DOCUMENT_ADDED: '📄',
  TASK_ASSIGNED: '✅',
  TASK_DUE: '📋',
  SUPPORT_MESSAGE: '💬',
  SYSTEM: '⚙️',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Уведомления</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{notifications.filter(n => !n.read_at).length} непрочитанных</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition">
          <Check size={16} /> Прочитать все
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`bg-white rounded-xl border p-4 transition hover:shadow-md ${!n.read_at ? 'border-primary-200 bg-primary-50/30' : 'border-surface-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{typeIcons[n.type]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${!n.read_at ? 'text-surface-900' : 'text-surface-700/70'}`}>{n.title}</p>
                  {!n.read_at && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
                <p className="text-xs text-surface-700/60 mt-1">{n.body}</p>
                <p className="text-[10px] text-surface-700/40 mt-2">{new Date(n.created_at).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
