import { notifications } from '../../data/mockData';
import type { NotificationType } from '../../types';

const typeIcons: Record<NotificationType, string> = {
  STATUS_CHANGED: '🚗', PAYMENT_CREATED: '💰', PAYMENT_DUE: '⏰', PAYMENT_OVERDUE: '⚠️',
  DOCUMENT_ADDED: '📄', TASK_ASSIGNED: '✅', TASK_DUE: '📋', SUPPORT_MESSAGE: '💬', SYSTEM: '⚙️',
};

export default function MiniAppNotifications() {
  const clientNotifications = notifications.filter(n => ['STATUS_CHANGED', 'PAYMENT_CREATED', 'PAYMENT_DUE', 'DOCUMENT_ADDED'].includes(n.type));

  return (
    <div className="px-5 pt-8 pb-8 animate-fade-in">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Уведомления</h1>
      <p className="text-sm text-surface-700/60 mb-6">{clientNotifications.filter(n => !n.read_at).length} непрочитанных</p>

      <div className="space-y-3">
        {clientNotifications.map(n => (
          <div key={n.id} className={`bg-white rounded-xl border p-4 ${!n.read_at ? 'border-primary-200' : 'border-surface-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{typeIcons[n.type]}</span>
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
        {clientNotifications.length === 0 && (
          <div className="text-center py-12 text-surface-700/50">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-sm">Нет уведомлений</p>
          </div>
        )}
      </div>
    </div>
  );
}
