import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function LoginScreen({ onLoginSuccess, showToast }: LoginScreenProps) {
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Accounts database state loaded from localStorage
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('si_accounts');
    let list: UserAccount[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing accounts', e);
      }
    }
    if (!list || list.length === 0) {
      // Default system preset credentials
      list = [
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
    }

    // Ensure yuanli is ALWAYS present
    const hasYuanli = list.some(acc => acc.username.toLowerCase() === 'yuanli');
    if (!hasYuanli) {
      list.unshift({
        id: 'acc-yuanli',
        username: 'yuanli',
        name: '超级管理员',
        password: 'cq123456',
        role: 'super_admin',
        dept: '系统安全中心',
        createdAt: new Date().toISOString()
      });
    } else {
      list = list.map(acc => {
        if (acc.username.toLowerCase() === 'yuanli') {
          return {
            ...acc,
            password: 'cq123456',
            role: 'super_admin'
          };
        }
        return acc;
      });
    }

    return list;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('si_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Handle Sign In Authentication
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('请输入账号及对应的登录明文密码！', 'error');
      return;
    }

    // Reload latest accounts from local storage to handle newly created newcomer users
    let latestAccounts = accounts;
    const saved = localStorage.getItem('si_accounts');
    if (saved) {
      try {
        latestAccounts = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    const matched = latestAccounts.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!matched) {
      showToast('⚠️ 未找到此账户，请联系超级管理员 (yuanli) 为您建档！', 'error');
      return;
    }

    if (matched.password !== password) {
      showToast('密保口令校验未通过，请输入正确的密码！', 'error');
      return;
    }

    // Success login
    showToast(`🔑 欢迎重返工作台, ${matched.name} (${matched.dept || '无部门'})！`, 'success');
    onLoginSuccess(matched);
  };

  const selectQuickFill = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password || '');
    showToast(`已快捷填写: ${acc.name}`, 'info');
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
      {/* Visual Header Branding */}
      <div className="text-center space-y-1.5 pt-1.5 border-b border-gray-100 pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#005bbf] mb-1">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="font-extrabold text-[#005bbf] tracking-tight text-lg">智能库存数字化安全保障套件</h2>
        <p className="text-[11px] text-gray-400 font-medium">仓储物料货架建档及出入库数据联锁追溯系统</p>
      </div>

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
                placeholder="请输入您的建档账号 (如 zhangsan)"
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
                placeholder="请输入密码 (如 zhangsan123)"
                className="w-full h-11 pl-9 pr-10 border border-gray-200 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#005bbf] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-11 bg-[#005bbf] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          验证秘钥并进入数字仓储工作台
        </button>

      </form>
    </div>
  );
}
