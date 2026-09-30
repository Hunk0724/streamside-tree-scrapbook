import React from 'react';
import { TabType } from './Header';

interface MobileBottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'proposals', label: '提案', icon: 'fa-regular fa-calendar-check' },
    { id: 'records', label: '紀錄', icon: 'fa-solid fa-camera-retro' },
    { id: 'updates', label: '動態', icon: 'fa-regular fa-comment-dots' },
    { id: 'wishes', label: '許願池', icon: 'fa-solid fa-wand-magic-sparkles' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 shadow-lg">
      <nav className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 text-[11px] transition-colors focus:outline-none ${
                isActive ? 'text-ink font-bold border-b-2 border-morandi' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`${tab.icon} text-lg mb-0.5 ${isActive ? 'text-morandi scale-110' : ''}`}></i>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
