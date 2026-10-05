import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, UserPlus, KeyRound, Shield, Search, Check, X, ShieldAlert, UserCheck } from 'lucide-react';

interface UsersTabProps {
  users: User[];
  setUsers: (data: User[] | ((prev: User[]) => User[])) => void;
  currentUser: User | null;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  setUsers,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleType, setRoleType] = useState<'operator' | 'expert'>('operator');

  // Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nationalIdInput, setNationalIdInput] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleType === 'operator') {
      if (!usernameInput || !passwordInput || !nameInput) {
        alert('لطفاً همه فیلدهای الزامی اپراتور را وارد کنید.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: usernameInput,
        password: passwordInput,
        name: nameInput,
        role: 'operator',
        isFirstLogin: true
      };
      setUsers(prev => [...prev, newUser]);
    } else {
      // Expert
      if (!usernameInput || !nationalIdInput || !nameInput) {
        alert('لطفاً شماره همراه و کد ملی کارشناس را وارد کنید.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: usernameInput, // Mobile is username
        password: nationalIdInput, // National ID is initial password
        name: nameInput,
        role: 'expert',
        isFirstLogin: true
      };
      setUsers(prev => [...prev, newUser]);
    }

    setShowAddModal(false);
    setUsernameInput('');
    setPasswordInput('');
    setNameInput('');
    setNationalIdInput('');
    alert('حساب کاربری جدید با موفقیت ایجاد گردید.');
  };

  const handleResetPassword = (userId: string, username: string) => {
    if (confirm(`آیا از بازنشانی رمز عبور کاربر "${username}" به حالت اولیه اطمینان دارید؟`)) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: '123', isFirstLogin: true } : u));
      alert(`رمز عبور حساب کاربری ${username} به رمز پیش‌فرض (123) تغییر یافت.`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800">مدیریت کاربران و سطوح دسترسی</h2>
            <p className="text-xs text-gray-500 font-bold">تعریف اپراتور، کارشناس باغبانی، باغدار و بازنشانی گذرواژه</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="جستجو در کاربران..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {(currentUser?.role === 'admin' || currentUser?.role === 'operator') && (
            <button
              onClick={() => {
                setRoleType('operator');
                setShowAddModal(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition"
            >
              <UserPlus className="w-4 h-4" /> ایجاد کاربر جدید
            </button>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:border-emerald-200 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  u.role === 'expert' ? 'bg-emerald-100 text-emerald-800' :
                  u.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {u.role === 'admin' ? 'مدیر ارشد سامانه' :
                   u.role === 'expert' ? 'کارشناس گیاه‌پزشکی و باغبانی' :
                   u.role === 'operator' ? 'اپراتور سامانه' : 'باغدار / مالک'}
                </span>

                {currentUser?.role === 'admin' && u.role !== 'admin' && (
                  <button
                    onClick={() => handleResetPassword(u.id, u.username)}
                    className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    title="بازیابی رمز عبور به پیش‌فرض"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> ریست رمز
                  </button>
                )}
              </div>

              <h3 className="font-black text-gray-800 text-base mb-1">{u.name}</h3>
              <p className="text-xs text-gray-500 font-mono mb-4">نام کاربری: {u.username}</p>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl">
                وضعیت: {u.isFirstLogin ? 'ورود اولیه (نیاز به تغییر رمز)' : 'فعال و تایید شده'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-800">
                ایجاد حساب کاربری جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-black mb-4">
                <button
                  type="button"
                  onClick={() => setRoleType('operator')}
                  className={`flex-1 py-2 rounded-lg transition ${roleType === 'operator' ? 'bg-white text-emerald-900 shadow' : 'text-gray-500'}`}
                >
                  اپراتور سامانه
                </button>
                <button
                  type="button"
                  onClick={() => setRoleType('expert')}
                  className={`flex-1 py-2 rounded-lg transition ${roleType === 'expert' ? 'bg-white text-emerald-900 shadow' : 'text-gray-500'}`}
                >
                  کارشناس باغبانی
                </button>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 mb-1 block">نام و نام خانوادگی *</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: مهندس حسینی"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                />
              </div>

              {roleType === 'operator' ? (
                <>
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">نام کاربری *</label>
                    <input
                      required
                      type="text"
                      placeholder="operator_user"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کلمه عبور *</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">شماره همراه کارشناس (نام کاربری ورود) *</label>
                    <input
                      required
                      type="text"
                      maxLength={11}
                      placeholder="09131234567"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-700 mb-1 block">کد ملی کارشناس (رمز عبور اولیه) *</label>
                    <input
                      required
                      type="text"
                      maxLength={10}
                      placeholder="0921234567"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={nationalIdInput}
                      onChange={e => setNationalIdInput(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg transition text-xs"
                >
                  ایجاد حساب کاربری
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition text-xs"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersTab;
