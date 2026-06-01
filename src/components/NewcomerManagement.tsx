import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Building2, 
  Lock, 
  User, 
  Users, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Info,
  CheckCircle,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';

interface NewcomerManagementProps {
  currentUser: UserAccount;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onDirectLogin?: (account: UserAccount) => void;
}

export default function NewcomerManagement({ currentUser, onLogout, showToast, onDirectLogin }: NewcomerManagementProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'operator' | 'guest'>('operator');
  const [department, setDepartment] = useState('仓库一号分部');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('si_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure super admin and defaults exist
        const hasYuanli = parsed.some((acc: any) => acc.username.toLowerCase() === 'yuanli');
        if (!hasYuanli) {
          parsed.unshift({
            id: 'acc-yuanli',
            username: 'yuanli',
            name: '超级管理员',
            password: 'cq123456',
            role: 'super_admin' as any,
            dept: '管理决策中心',
            createdAt: new Date().toISOString()
          });
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'acc-yuanli',
        username: 'yuanli',
        name: '超级管理员',
        password: 'cq123456',
        role: 'super_admin' as any,
        dept: '管理决策中心',
        createdAt: new Date().toISOString()
      },
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

  useEffect(() => {
    localStorage.setItem('si_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleCreateNewcomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      showToast('建档失败，请完整填写新人账号、口令及使用者姓名！', 'error');
      return;
    }

    const cleanedUsername = username.trim().toLowerCase();
    
    // Check if duplicate
    const isConflict = accounts.some(acc => acc.username.toLowerCase() === cleanedUsername);
    if (isConflict) {
      showToast(`⚠️ 建档失败：账号名 "${username}" 已被占用，请更换。`, 'error');
      return;
    }

    const newAcc: UserAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: cleanedUsername,
      name: fullName.trim(),
      password: password.trim(),
      role: role,
      dept: department.trim() || '通用库区',
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newAcc]);
    showToast(`🎉 成功为新人 [${newAcc.name}] 办妥了独立账号建档！`, 'success');

    // Reset inputs
    setUsername('');
    setPassword('');
    setFullName('');
    setDepartment('仓库一号分部');
  };

  const handleDeleteAccount = (id: string, name: string, usernameStr: string) => {
    if (usernameStr.toLowerCase() === 'yuanli') {
      showToast('安全警告：超级管理员自身账号受密码系统联锁保护，不可删除！', 'error');
      return;
    }
    if (usernameStr.toLowerCase() === 'admin') {
      showToast('安全警告：默认核心管理员账号不可销毁！', 'error');
      return;
    }

    setAccounts(prev => prev.filter(acc => acc.id !== id));
    showToast(`🗑️ 已永久清除理货员 [${name}] 的系统登录凭证档案。`, 'success');
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    showToast('已复制账号密码，可发送交付给新人理货员！', 'success');
  };

  return (
    <div className="w-full space-y-6 max-w-lg mx-auto py-2">
      {/* Super Admin Top Badge & Header */}
      <div className="bg-gradient-to-r from-blue-900 to-[#005bbf] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 blur-sm pointer-events-none">
          <ShieldAlert className="w-48 h-48" />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 bg-amber-500/25 border border-amber-400/45 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 tracking-wide">
              👑 SYSTEM SUPER ADMIN / 超级安全管理员
            </span>
            <h1 className="text-xl font-extrabold tracking-tight font-sans">
              新人自主建档与密保分发中心
            </h1>
            <p className="text-[11px] text-blue-105 font-medium max-w-xs leading-normal">
              当前授权会话账号：<span className="underline font-mono text-white font-bold">{currentUser.username}</span> ({currentUser.name})
            </p>
          </div>

          <button
            onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 text-white rounded-2xl px-3 py-2 flex items-center gap-1.5 text-xs font-bold transition-all border border-white/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            退出
          </button>
        </div>
      </div>

      {/* Main Panel Content Box */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Panel 1: Setting up Newcomer Account Form */}
        <section className="bg-white rounded-3xl p-5 border border-gray-150/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-7 h-7 bg-blue-50 text-[#005bbf] rounded-full flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">1. 新人自主建档设账</h3>
              <p className="text-[10px] text-gray-400">设立理货员/仓管员新入职人员独立密保登录凭证</p>
            </div>
          </div>

          <form onSubmit={handleCreateNewcomer} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">NEW USERNAME / 登录账号</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例如: weihua"
                    className="w-full h-10 pl-8 pr-2 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">PASSWORD / 设登录主口令</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入新人登录密码"
                    className="w-full h-10 pl-8 pr-2 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">FULL NAME / 理货员姓名</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="新人真实姓名 (如 李卫华)"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 block font-mono">DEPARTMENT / 对应部室</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="库房分组或部门"
                    className="w-full h-10 pl-8 pr-2 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block font-mono">USER ROLE / 分配角色</label>
              <div className="flex gap-2">
                {([
                  { key: 'operator', name: '理货员 (只读与出库写权)' },
                  { key: 'admin', name: '系统主管 (编辑并管理物料)' }
                ] as const).map((r) => (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === r.key
                        ? 'bg-blue-50 border-blue-400 text-blue-600 font-extrabold shadow-sm'
                        : 'bg-white border-gray-200 text-gray-400 hover:text-gray-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${role === r.key ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.15)] active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-100" />
              写入安全芯片：确认账户建档保存
            </button>

            <button
              type="button"
              onClick={() => {
                const adminAcc = accounts.find(acc => acc.username === 'admin') || {
                  id: 'acc-admin',
                  username: 'admin',
                  name: '王小明',
                  password: 'admin',
                  role: 'admin',
                  dept: '系统后勤处',
                  createdAt: new Date('2026-01-01').toISOString()
                };
                if (onDirectLogin) {
                  onDirectLogin(adminAcc);
                  showToast(`🚀 免密直通成功：已以系统主管 [${adminAcc.name}] 身份直接登入工作台！`, 'success');
                }
              }}
              className="w-full h-11 bg-[#005bbf] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(0,91,191,0.15)] active:scale-[0.99] cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-blue-100" />
              免密直进：直接登录至数字化仓储工作台
            </button>
          </form>
        </section>

        {/* Panel 2: Newcomer Accounts database overview */}
        <section className="bg-white rounded-3xl p-5 border border-gray-150/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3.5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">2. 新入理货员账号名册</h3>
                <p className="text-[10px] text-gray-400">管理、复制分发或抹除理货员的进入许可</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              共计 {accounts.length - 1} 名下属
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
            {accounts.map((acc) => {
              const isYuanli = acc.username.toLowerCase() === 'yuanli';
              return (
                <div
                  key={acc.id}
                  className={`p-3 rounded-2xl border flex justify-between items-center text-xs transition-all ${
                    isYuanli 
                      ? 'bg-blue-50/50 border-blue-200/60 shadow-sm' 
                      : 'bg-gray-50/70 border-gray-200/40 hover:bg-gray-100/50'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-gray-850">{acc.name}</span>
                      <span className="text-[9px] px-1.5 bg-blue-100 text-[#005bbf] font-bold rounded-lg leading-loose">
                        {acc.username}
                      </span>
                      {acc.role === 'super_admin' ? (
                        <span className="text-[9px] px-1.5 bg-yellow-100 text-yellow-800 font-extrabold rounded-lg border border-yellow-200">
                          安全极权
                        </span>
                      ) : acc.role === 'admin' ? (
                        <span className="text-[9px] px-1.5 bg-teal-150 text-teal-700 font-bold rounded-lg border border-teal-200">
                          部门主管
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 bg-gray-200/80 text-gray-600 font-bold rounded-lg">
                          操作理货员
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-[9px] text-gray-450 font-mono">
                      <span>所属: {acc.dept || '全局'}</span>
                      <span>・</span>
                      <span>口令: <strong className="text-gray-800 font-extrabold bg-white px-1 py-0.2 rounded border border-gray-100">{acc.password}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(`姓名: ${acc.name}, 账号: ${acc.username}, 密码: ${acc.password}`, acc.id)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        copiedId === acc.id 
                          ? 'bg-green-50 border-green-200 text-green-600' 
                          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="复制登录凭据交给新人"
                    >
                      {copiedId === acc.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {!isYuanli && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc.id, acc.name, acc.username)}
                        className="p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-lg transition-all cursor-pointer"
                        title="注销删除账号"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50/50 border border-amber-200/50 p-3 rounded-2xl flex gap-2.5 items-start text-[10px] text-amber-900 leading-normal">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold">超级管理员账号安全提示:</strong>
              <p>这里注册的新人可直接在系统前台完成身份辨识和数据合流。所有的出入库交易记录在安全验证之后均会刻在仓储区块链账本上并署名理货员姓名！</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
