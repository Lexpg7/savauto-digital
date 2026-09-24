import { Users, Briefcase, Car, CreditCard, AlertTriangle, CheckCircle, HeadphonesIcon, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardStats, revenueByMonth, carsByStatus, cars, tasks, payments } from '../../data/mockData';
import { CAR_STATUS_LABELS, CAR_STATUS_COLORS } from '../../types';
import { Link } from 'react-router-dom';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function DashboardPage() {
  const stats = dashboardStats;
  const recentCars = cars.filter(c => c.status !== 'DELIVERED' && c.status !== 'CANCELLED').slice(0, 4);
  const urgentTasks = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').sort((a, b) => {
    const p = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return p[a.priority] - p[b.priority];
  }).slice(0, 5);
  const recentPayments = payments.slice(-5).reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Дашборд</h1>
          <p className="text-sm text-surface-700/60 mt-0.5">Обзор деятельности компании</p>
        </div>
        <p className="text-sm text-surface-700/50">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Клиенты" value={stats.total_clients} change="+2" positive />
        <StatCard icon={Briefcase} label="Активные сделки" value={stats.active_deals} />
        <StatCard icon={Car} label="Авто в работе" value={stats.total_cars} change="+1" positive />
        <StatCard icon={TrendingUp} label="Выручка" value={formatCurrency(stats.total_revenue)} change="+15%" positive />
        <StatCard icon={CreditCard} label="Ожидают оплаты" value={formatCurrency(stats.outstanding_payments)} />
        <StatCard icon={ArrowDownRight} label="Расходы" value={formatCurrency(stats.total_expenses)} />
        <StatCard icon={CheckCircle} label="Прибыль (оценка)" value={formatCurrency(stats.estimated_profit)} change="+22%" positive />
        <StatCard icon={AlertTriangle} label="Просроченные задачи" value={stats.overdue_tasks} alert />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Выручка и расходы</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Выручка" />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cars by Status */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Автомобили по статусу</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={carsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {carsByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {carsByStatus.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-surface-700">{item.status}</span>
                  <span className="font-medium text-surface-900 ml-auto">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Cars */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Автомобили в работе</h3>
            <Link to="/cars" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Все →</Link>
          </div>
          <div className="space-y-3">
            {recentCars.map(car => (
              <Link key={car.id} to={`/cars/${car.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition group">
                <img src={car.photo_url} alt={`${car.make} ${car.model}`} className="w-16 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 text-sm">{car.make} {car.model} {car.year}</p>
                  <p className="text-xs text-surface-700/60 truncate">{car.current_location || car.country}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${CAR_STATUS_COLORS[car.status]}`}>
                  {CAR_STATUS_LABELS[car.status]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Задачи</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Все →</Link>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <div key={task.id} className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{task.priority}</span>
                  {task.due_date && <span className="text-[10px] text-surface-700/60">{new Date(task.due_date).toLocaleDateString('ru-RU')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900">Последние платежи</h3>
          <Link to="/payments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Все →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-700/60 border-b border-surface-200">
                <th className="pb-3 font-medium">Дата</th>
                <th className="pb-3 font-medium">Описание</th>
                <th className="pb-3 font-medium">Тип</th>
                <th className="pb-3 font-medium text-right">Сумма</th>
                <th className="pb-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p.id} className="border-b border-surface-100 last:border-0">
                  <td className="py-3 text-surface-700/60">{new Date(p.payment_date).toLocaleDateString('ru-RU')}</td>
                  <td className="py-3 text-surface-900">{p.description}</td>
                  <td className="py-3 text-surface-700/60">{p.type}</td>
                  <td className="py-3 text-right font-medium text-surface-900">{formatCurrency(p.amount)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{p.status === 'PAID' ? 'Оплачен' : p.status === 'PENDING' ? 'Ожидает' : p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive, alert }: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-4 lg:p-5 hover:shadow-lg hover:shadow-surface-200/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-red-100' : 'bg-primary-50'}`}>
          <Icon size={20} className={alert ? 'text-red-600' : 'text-primary-600'} />
        </div>
        {change && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
      <p className="text-xs text-surface-700/60 mt-1">{label}</p>
    </div>
  );
}
