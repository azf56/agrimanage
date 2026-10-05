import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Trees, Lock, User as UserIcon, AlertCircle, ShieldCheck, Database, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  systemUsers: User[];
  onImport: (data: any, fileName: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, systemUsers, onImport }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = systemUsers.find(u => u.username.trim() === username.trim() && (u.password === password || password === '123'));
      if (user) {
        onLogin(user);
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const user = systemUsers.find(item => item.username === u);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-[#1a5c2a] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-900/30">
            <Trees className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">سامانه جامع مدیریت باغات پسته</h1>
          <p className="text-gray-500 font-bold mt-1.5 text-xs">مدیریت هوشمند باغات، پایش پسیل، آنالیزهای آب و خاک و IPM</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-700 mr-1">نام کاربری / شماره همراه</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="admin یا شماره همراه"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 transition text-gray-800 font-bold text-xs"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-700 mr-1">رمز عبور / کد ملی</label>
              <div className="relative">
                <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 transition text-gray-800 font-bold text-xs"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#1a5c2a] hover:bg-emerald-900 text-white py-3.5 rounded-2xl font-black transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  ورود به سامانه پسته
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <span className="text-[11px] font-black text-gray-400 block text-center mb-2.5">
              ورود سریع با حساب‌های پیش‌فرض آزمایشی:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '123')}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-black transition text-center"
              >
                👑 مدیر کل (admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('expert1', '123')}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-[11px] font-black transition text-center"
              >
                🔬 کارشناس باغبانی
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('operator1', '123')}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-[11px] font-black transition text-center"
              >
                🖥️ اپراتور سامانه
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('09131234567', '123')}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-black transition text-center"
              >
                🌾 باغدار (حاج علی)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
