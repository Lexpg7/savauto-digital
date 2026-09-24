import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@savauto.ru');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/30">
            <span className="text-2xl font-bold text-white">SA</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SAVAUTO DIGITAL</h1>
          <p className="text-white/50 text-sm mt-1">Платформа импорта автомобилей</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Вход в систему</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-700/50 hover:text-surface-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium text-sm hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Вход...
                </span>
              ) : 'Войти'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-200">
            <p className="text-xs text-center text-surface-700/50">
              Демо-доступ: alex@savauto.ru / demo123
            </p>
          </div>
        </div>

        {/* Mini App Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/app')}
            className="text-white/70 hover:text-white text-sm transition underline underline-offset-4"
          >
            Открыть Telegram Mini App →
          </button>
        </div>
      </div>
    </div>
  );
}
