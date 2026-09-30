import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const StatusBar: React.FC = () => {
  const { toastMessage, showToast } = useAuth();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-[200] max-w-lg w-[90%] transition-all animate-bounce-short">
      <div className="bg-white/95 backdrop-blur border border-milktea text-ink text-sm px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <i className="fa-solid fa-bell text-milktea-dark"></i>
          <span dangerouslySetInnerHTML={{ __html: toastMessage }}></span>
        </span>
        <button
          onClick={() => showToast('')}
          className="text-xs text-gray-400 hover:text-ink ml-2 p-1"
          aria-label="關閉提示"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};
