import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supportTickets, supportMessages, clients } from '../../data/mockData';
import type { SupportStatus } from '../../types';

const statusLabels: Record<SupportStatus, string> = { OPEN: 'Открыт', IN_PROGRESS: 'В работе', WAITING_FOR_CLIENT: 'Ожидает клиента', RESOLVED: 'Решён', CLOSED: 'Закрыт' };

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(supportTickets[0]?.id);
  const [message, setMessage] = useState('');

  const ticket = supportTickets.find(t => t.id === selectedTicket);
  const messages = supportMessages.filter(m => m.ticket_id === selectedTicket);
  const getClient = (id: string) => clients.find(c => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Поддержка</h1>
        <p className="text-sm text-surface-700/60 mt-0.5">{supportTickets.length} обращений</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Tickets List */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-surface-200">
            <h3 className="font-semibold text-sm">Обращения</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {supportTickets.map(t => {
              const client = getClient(t.client_id);
              return (
                <button key={t.id} onClick={() => setSelectedTicket(t.id)} className={`w-full text-left p-4 border-b border-surface-100 hover:bg-surface-50 transition ${selectedTicket === t.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''}`}>
                  <p className="font-medium text-sm text-surface-900 truncate">{t.subject}</p>
                  <p className="text-xs text-surface-700/60 mt-1">{client ? `${client.first_name} ${client.last_name}` : ''}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      t.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{statusLabels[t.status]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 overflow-hidden flex flex-col">
          {ticket ? (
            <>
              <div className="p-4 border-b border-surface-200">
                <h3 className="font-semibold text-surface-900">{ticket.subject}</h3>
                <p className="text-xs text-surface-700/60 mt-1">{getClient(ticket.client_id)?.first_name} • {statusLabels[ticket.status]}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender_type === 'staff' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_type === 'staff' ? 'text-white/60' : 'text-surface-700/40'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-surface-200">
                <div className="flex gap-2">
                  <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Введите сообщение..." className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button className="px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition"><Send size={16} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-surface-700/50">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Выберите обращение</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
