import { useState } from 'react';
import { Search, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { tasks, users } from '../../data/mockData';
import type { TaskStatus, TaskPriority } from '../../types';

const statusLabels: Record<TaskStatus, string> = { TODO: 'К выполнению', IN_PROGRESS: 'В работе', WAITING: 'Ожидание', DONE: 'Выполнено', CANCELLED: 'Отменено' };
const priorityColors: Record<TaskPriority, string> = { LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-orange-100 text-orange-700', URGENT: 'bg-red-100 text-red-700' };

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const getUser = (id?: string) => users.find(u => u.id === id);
  const isOverdue = (dueDate?: string) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Задачи</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').length} активных</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
          <Plus size={16} /> Новая задача
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm">
          <option value="all">Все статусы</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm">
          <option value="all">Все приоритеты</option>
          <option value="URGENT">Срочные</option>
          <option value="HIGH">Высокий</option>
          <option value="MEDIUM">Средний</option>
          <option value="LOW">Низкий</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(task => {
          const assignee = getUser(task.assignee_id);
          const overdue = task.status !== 'DONE' && task.status !== 'CANCELLED' && isOverdue(task.due_date);
          return (
            <div key={task.id} className={`bg-white rounded-xl border p-4 transition hover:shadow-md ${overdue ? 'border-red-200 bg-red-50/30' : 'border-surface-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  task.status === 'DONE' ? 'bg-green-500 border-green-500' : 'border-surface-300'
                }`}>
                  {task.status === 'DONE' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium text-sm ${task.status === 'DONE' ? 'text-surface-700/50 line-through' : 'text-surface-900'}`}>{task.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityColors[task.priority]}`}>{task.priority}</span>
                    {overdue && <span className="flex items-center gap-1 text-[10px] text-red-600 font-medium"><AlertTriangle size={10} /> Просрочено</span>}
                  </div>
                  {task.description && <p className="text-xs text-surface-700/60 mt-1">{task.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    {assignee && <span className="text-xs text-surface-700/60">→ {assignee.first_name} {assignee.last_name}</span>}
                    {task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600' : 'text-surface-700/50'}`}>
                        <Calendar size={12} /> {new Date(task.due_date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'WAITING' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{statusLabels[task.status]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
