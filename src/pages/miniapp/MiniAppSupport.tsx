import { useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { supportTickets, supportMessages } from '../../data/mockData';

const clientTickets = supportTickets.filter(t => t.client_id === 'c-001');

export default function MiniAppSupport() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(clientTickets[0]?.id || null);
  const [message, setMessage] = useState('');

  const ticket = supportTickets.find(t => t.id === selectedTicket);
  const messages = supportMessages.filter(m => m.ticket_id === selectedTicket);

  return (
    <div className="flex flex-col h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-xl font-bold text-surface-900">Поддержка</h1>
        <p className="text-sm text-surface-700/60">Свяжитесь с менеджером</p>
      </div>

      {/* Tickets */}
      {!selectedTicket ? (
        <div className="flex-1 px-5">
          <div className="space-y-3">
            {clientTickets.map(t => (
              <button key={t.id} onClick={() => setSelectedTicket(t.id)} className="w-full text-left bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition">
                <p className="font-medium text-sm text-surface-900">{t.subject}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    t.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{t.status === 'OPEN' ? 'Открыт' : t.status === 'IN_PROGRESS' ? 'В работе' : t.status}</span>
                  <span className="text-[10px] text-surface-700/50">{new Date(t.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-surface-200 text-sm text-surface-700/60 hover:border-primary-300 hover:text-primary-600 transition flex items-center justify-center gap-2">
            <Plus size={16} /> Новое обращение
          </button>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <div className="px-5 py-3 border-b border-surface-200 flex items-center gap-3">
            <button onClick={() => setSelectedTicket(null)} className="text-sm text-primary-600">← Назад</button>
            <p className="text-sm font-medium text-surface-900 truncate">{ticket?.subject}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.sender_type === 'client' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_type === 'client' ? 'text-white/60' : 'text-surface-700/40'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-surface-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition">
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
