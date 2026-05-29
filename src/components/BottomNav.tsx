import { LayoutDashboard, PlusCircle, MinusCircle, Package } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: '首页',
      icon: LayoutDashboard,
    },
    {
      id: 'inbound' as TabType,
      label: '入库',
      icon: PlusCircle,
    },
    {
      id: 'outbound' as TabType,
      label: '出库',
      icon: MinusCircle,
    },
    {
      id: 'inventory' as TabType,
      label: '库存',
      icon: Package,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-3 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-300 relative ${
              isActive
                ? 'bg-[#86f898] text-[#002108] font-semibold scale-105 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 active:scale-95'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[11px] mt-0.5 tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
