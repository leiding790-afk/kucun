import { Bell, LogOut, ShieldAlert, Award } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  tab: string;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export default function Header({ tab, currentUser, onLogout }: HeaderProps) {
  // Map page headers nicely
  const getHeaderName = () => {
    switch (tab) {
      case 'dashboard':
        return '工作台核心';
      case 'inbound':
        return '智能入库登记';
      case 'outbound':
        return '智能出库申请';
      case 'inventory':
        return '物资总库存账';
      default:
        return '智能物料系统';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 flex justify-between items-center px-4 h-14 w-full">
      <div className="flex items-center gap-2.5 min-w-0">
        {currentUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0 select-none">
              {currentUser.name.trim().charAt(0) || '理'}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="font-bold text-xs text-gray-800 truncate leading-tight flex items-center gap-1">
                {currentUser.name}
                {currentUser.role === 'admin' && (
                  <Award className="w-3 h-3 text-red-500 shrink-0" title="库房主管" />
                )}
              </span>
              <span className="text-[9px] text-gray-400 truncate leading-none">
                {currentUser.dept || '理货层级'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-gray-400">系统就绪</span>
          </div>
        )}
        <div className="w-px h-5 bg-gray-200/80 mx-1 shrink-0"></div>
        <h1 className="font-bold text-sm text-[#005bbf] tracking-wide truncate">
          {getHeaderName()}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button className="relative p-2 hover:bg-gray-50 active:scale-95 transition-all rounded-full text-gray-400">
          <Bell className="w-4.5 h-4.5 text-[#005bbf]" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#e65100] rounded-full ring-2 ring-white"></span>
        </button>

        {currentUser && (
          <button
            onClick={onLogout}
            title="安全注销并登出账号"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-full active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </header>
  );
}
