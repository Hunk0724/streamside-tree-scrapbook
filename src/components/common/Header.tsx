import React from 'react';
import { useAuth } from '../../context/AuthContext';

export type TabType = 'proposals' | 'records' | 'updates' | 'wishes';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAdminModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenAdminModal
}) => {
  const { currentUser, isUserAdmin, allMembers, logout } = useAuth();

  const pendingCount = allMembers.filter((m) => m.status === 'pending').length;
  const userPhoto = currentUser?.photoURL || 'https://placehold.co/100x100/d4b59e/ffffff?text=U';
  const userName = currentUser?.displayName || '小組成員';

  const navItems: { id: TabType; label: string; icon: string; color: string }[] = [
    { id: 'proposals', label: '每月提案', icon: 'fa-regular fa-calendar-check', color: 'text-morandi' },
    { id: 'records', label: '活動紀錄', icon: 'fa-solid fa-camera-retro', color: 'text-milktea' },
    { id: 'updates', label: '日常動態', icon: 'fa-regular fa-comment-dots', color: 'text-ink' },
    { id: 'wishes', label: '功能許願池', icon: 'fa-solid fa-wand-magic-sparkles', color: 'text-yellow-500' }
  ];

  return (
    <header className="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Logo 與手機版使用者區塊 */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('proposals')}>
            <i className="fa-solid fa-book-open text-morandi text-2xl"></i>
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              我們的手帳 <span className="text-milktea font-handwriting text-3xl">Scrapbook</span>
            </h1>
          </div>

          {/* 手機版登入與審核入口 */}
          <div className="flex items-center gap-2 md:hidden">
            {isUserAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="relative flex items-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300/80 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm"
              >
                <i className="fa-solid fa-user-shield text-xs"></i>
                <span>審核</span>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-white/90 border border-gray-200/80 rounded-full py-1 pl-1.5 pr-2.5 shadow-sm">
              <img src={userPhoto} className="w-6 h-6 rounded-full object-cover border border-morandi" alt={userName} />
              <button onClick={logout} title="登出" className="text-gray-400 hover:text-red-500 transition-colors p-0.5">
                <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 桌面版分頁導覽按鈕 */}
        <nav className="hidden md:flex space-x-1 w-auto overflow-x-auto justify-start pb-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`tab-btn px-4 py-2 whitespace-nowrap transition-colors flex items-center gap-1.5 select-none text-sm font-medium ${
                  isActive
                    ? 'active border-b-4 border-morandi text-ink font-bold'
                    : 'text-gray-500 hover:text-ink'
                }`}
              >
                <i className={`${item.icon} ${item.color}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 桌面版使用者狀態與管理員審核按鈕 */}
        <div className="hidden md:flex items-center gap-2">
          {isUserAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="relative flex items-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300/80 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              <i className="fa-solid fa-user-shield text-xs"></i>
              <span>成員審核</span>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 bg-white/90 border border-gray-200/80 rounded-full py-1 pl-1.5 pr-3 shadow-sm">
            <img src={userPhoto} className="w-7 h-7 rounded-full object-cover border border-morandi" alt={userName} />
            <span className="text-xs font-semibold text-ink max-w-[110px] truncate">{userName}</span>
            <button
              onClick={logout}
              title="登出帳號"
              className="text-gray-400 hover:text-red-500 transition-colors ml-1 p-0.5"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
