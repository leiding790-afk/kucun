import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  UserPlus, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Trash2, 
  Building2, 
  KeyRound, 
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function LoginScreen({ onLoginSuccess, showToast }: LoginScreenProps) {
  // Tabs: 'signin' | 'signup' | 'manage_accounts'
  const [activeMode, setActiveMode] = useState<'signin' | 'signup' | 'accounts_list'>('signin');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'operator' | 'guest'>('operator');
  const [department, setDepartment] = useState('一号总库');

  // Accounts database state
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('si_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default system preset credentials
    return [
      {
        id: 'acc-admin',
        username: 'admin',
        name: '王小明',
        password: 'admin',
        role: 'admin',
        dept: '系统后勤处',
        createdAt: new Date('2026-01-01').toISOString()
      },
      {
        id: 'acc-op1',
        username: 'operator',
        name: '张三 (操作员)',
        password: '123',
        role: 'operator',
        dept: '1仓储运部',
        createdAt: new Date('2026-05-15').toISOString()
      },
      {
        id: 'acc-op2',
        username: 'operator2',
        name: '李四 (理货员)',
        password: '123',
        role: 'operator',
        dept: '2仓分拣部',
        createdAt: new Date('2026-05-20').toISOString()
      }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('si_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('请输入账号及对应的登录明文密码！', 'error');
      return;
    }

    const matched = accounts.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!matched) {
      showToast('⚠️ 未找到此账户，您可以切换到 “注册” 选项自助新建建档！', 'error');
      return;
    }

    if (matched.password !== password) {
      showToast('密保口令校验未通过，请输入正确的密码！', 'error');
      return;
    }

    // Success login
    showToast(`🔑 欢迎重返工作台, ${matched.name} (${matched.dept})！`, 'success');
    onLoginSuccess(matched);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      showToast('建档失败，请完整填写账户、密码、及使用者姓名！', 'error');
      return;
    }

    const cleanedUsername = username.trim().toLowerCase();
    const isConflict = accounts.some((acc) => acc.username.toLowerCase() === cleanedUsername);
    if (isConflict) {
      showToast(`⚠️ 账号 "${username}" 已存在，请更换其他登录名称！`, 'error');
      return;
    }

    const newUser: UserAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      username: cleanedUsername,
      name: fullName.trim(),
      password: password,
      role: role,
      dept: department.trim() || '通用库区',
      createdAt: new Date().toISOString()
    };

    setAccounts((prev) => [...prev, newUser]);
    showToast(`🎉 成功自主建档新账户! 请直接登录。`, 'success');
    
    // Auto populate back to signin field
    setUsername(newUser.username);
    setPassword(newUser.password || '');
    setActiveMode('signin');
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (id === 'acc-admin') {
      showToast('安全保护锁：默认总管理员 admin 无法删除！', 'error');
      return;
    }
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    showToast(`🗑️ 已注销并销档删除账户: ${name}`, 'success');
  };

  const selectQuickFill = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password || '');
    showToast(`已快捷填写: ${acc.name}`, 'info');
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
      {/* Visual Header Branding */}
      <div className="text-center space-y-1.5 pt-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#005bbf] mb-1">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="font-bold text-lg text-gray-800 tracking-tight">智能库存数字化安全保障套件</h2>
        <p className="text-[11px] text-gray-400 font-medium">仓储物料货架建档及出入库数据联锁追溯系统</p>
      </div>

      {/* Primary tab triggers */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveMode('signin')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeMode === 'signin'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          🔑 账号密码登录
        </button>
        <button
          onClick={() => setActiveMode('signup')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeMode === 'signup'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          ➕ 新人自主建档
        </button>
        <button
          onClick={() => setActiveMode('accounts_list')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeMode === 'accounts_list'
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          👥 已存账号本 ({accounts.length})
        </button>
      </div>

      {/* Tab: SIGN IN */}
      {activeMode === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4 animate-fadeIn">
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block font-mono">USER ACCOUNT / 登录账户</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的建档账号 (如 admin / operator)"
                  className="w-full h-11 pl-9 pr-3 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block font-mono">PASSWORD / 密保明文密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码 (如 admin / 123)"
                  className="w-full h-11 pl-9 pr-10 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            验证秘钥并进入数字仓储工作台
          </button>

          {/* Preset Helper Panel */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-gray-400 block font-mono">✨ 快捷测试账号预设（点击自动免密填写）:</span>
            <div className="grid grid-cols-1 gap-1.5 text-[11px]">
              {accounts.slice(0, 3).map((acc) => (
                <button
                  type="button"
                  key={acc.id}
                  onClick={() => selectQuickFill(acc)}
                  className="w-full h-8 px-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-all flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-gray-700">{acc.username}</span>
                    <span className="text-gray-400">({acc.name})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-gray-400 shrink-0 text-[10px]">
                    <span>密码:</span>
                    <span className="bg-blue-50 text-blue-600 px-1 py-0.2 rounded font-bold">{acc.password}</span>
                    <span className="bg-gray-100 text-gray-600 px-1 py-0.2 rounded">{acc.role === 'admin' ? '主管' : '库员'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Tab: SIGN UP */}
      {activeMode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4 animate-fadeIn">
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">NEW USERNAME / 账号名</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="如 testuser"
                    className="w-full h-10 pl-8 pr-2.5 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">PASSWORD / 明密保密令</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="设置密码"
                    className="w-full h-10 pl-8 pr-2.5 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">OPERATOR NAME / 真实姓名</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="例如: 楚特派"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">DEPARTMENT / 库区部门</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="如 仓管物流课"
                    className="w-full h-10 pl-8 pr-2.5 border border-gray-200 rounded-lg text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block font-mono">ASSIGN ROLE / 分配角色权限</label>
              <div className="flex gap-2">
                {(['operator', 'admin'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 h-9.5 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === r
                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {r === 'admin' ? '主管/管理员 (拥有注销删除权)' : '普通理货/操作员'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            创建档案账户并完成保存
          </button>
        </form>
      )}

      {/* Tab: LIST OF ACCOUNTS */}
      {activeMode === 'accounts_list' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold font-mono">
            <span>🗄️ 系统已录入操作员档案 (共 {accounts.length} 人)</span>
            <span>本地持久化保存已开启</span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{acc.name}</span>
                    <span className="text-[10px] px-1.5 bg-blue-100 text-[#005bbf] font-bold rounded">
                      {acc.username}
                    </span>
                    {acc.role === 'admin' && (
                      <span className="text-[10px] px-1.5 bg-red-100 text-red-600 font-bold rounded">
                        主管
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-medium font-mono">
                    <span>所属部区: {acc.dept || '无所属'}</span>
                    <span>・</span>
                    <span>口令密文: {acc.password ? '●●●●' : '空'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectQuickFill(acc)}
                    className="p-1 px-2 border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold cursor-pointer"
                  >
                    载入填写
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(acc.id, acc.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                    title="删除建档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-gray-400 leading-normal bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
            ℹ️ **理货账号建档说明**: 使用自主建档可以直接设立自定义管理员和理货员账号。新产品登记入库、出库等操作将永久追溯记录当前登录理货员身份！
          </div>
        </div>
      )}
    </div>
  );
}
