import { FileText, Search, Filter } from 'lucide-react';
import { documents } from '../../data/mockData';

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Документы</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">{documents.length} документов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition">
          <FileText size={16} /> Загрузить
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-700/40" />
          <input type="text" placeholder="Поиск документов..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surface-200 text-sm"><Filter size={14} /> Фильтры</button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-surface-700/60 bg-surface-50 border-b border-surface-200">
              <th className="px-5 py-3.5 font-medium">Название</th>
              <th className="px-5 py-3.5 font-medium">Категория</th>
              <th className="px-5 py-3.5 font-medium">Размер</th>
              <th className="px-5 py-3.5 font-medium">Клиент</th>
              <th className="px-5 py-3.5 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    <span className="font-medium text-surface-900">{doc.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-100 text-surface-700">{doc.category}</span></td>
                <td className="px-5 py-4 text-surface-700/60">{(doc.size / 1024).toFixed(0)} KB</td>
                <td className="px-5 py-4 text-surface-700/60">{doc.is_visible_to_client ? '👁 Видим' : '🔒 Скрыт'}</td>
                <td className="px-5 py-4 text-surface-700/50">{new Date(doc.created_at).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
