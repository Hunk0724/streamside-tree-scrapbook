import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, TabType } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Gatekeeper } from './components/common/Gatekeeper';
import { AdminModal } from './components/common/AdminModal';
import { StatusBar } from './components/common/StatusBar';
import { ProposalBoard } from './components/Proposals/ProposalBoard';
import { RecordBoard } from './components/Records/RecordBoard';
import { UpdateBoard } from './components/Updates/UpdateBoard';
import { WishBoard } from './components/Wishes/WishBoard';

const MainLayout: React.FC = () => {
  const { isUserApproved, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('proposals');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // 1. 若權限審核未通過或是訪客，顯示門禁畫面
  if (loading || !isUserApproved) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <StatusBar />
        <Gatekeeper />
      </div>
    );
  }

  // 2. 審核通過，顯示完整小組手帳主應用
  return (
    <div className="min-h-screen bg-paper text-ink pb-24 md:pb-12">
      <StatusBar />

      {/* 頂部導覽列 */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* 核心內容區 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {currentTab === 'proposals' && <ProposalBoard />}
        {currentTab === 'records' && <RecordBoard />}
        {currentTab === 'updates' && <UpdateBoard />}
        {currentTab === 'wishes' && <WishBoard />}
      </main>

      {/* 頁尾版本標籤與溫馨註腳 */}
      <footer className="mt-8 text-center text-xs text-gray-400 py-6 border-t border-gray-100 flex flex-col items-center gap-1">
        <p>🌿 成青小組的小手帳 · Cozy Scrapbook <span className="font-mono font-semibold text-morandi">v1.1.0</span></p>
        <p className="text-[11px] text-gray-400">持續傾聽組員許願 · 讓小組每一天都更美好 ✨</p>
      </footer>

      {/* 手機版固定底欄導覽列 */}
      <MobileBottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* 管理員審核彈窗 */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
