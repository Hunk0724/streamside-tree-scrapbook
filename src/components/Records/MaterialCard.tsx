import React from 'react';
import { RecordItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MaterialCardProps {
  record: RecordItem;
  rotation: number;
  onDelete: (id: string) => Promise<void>;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ record, rotation, onDelete }) => {
  const { currentUser, isUserAdmin } = useAuth();
  const canManage = isUserAdmin || (currentUser && record.authorUid === currentUser.uid);

  return (
    <div className="masonry-item">
      <div className="relative group">
        <a
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-milktea text-white p-5 rounded-xl card-shadow border-2 border-dashed border-white transform transition hover:scale-[1.02]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-paperclip text-2xl shrink-0"></i>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-base line-clamp-1">{record.text}</h4>
              <p className="text-xs opacity-90 mt-1">點擊開啟外部連結 · {record.author || '管理員'}</p>
            </div>
          </div>
        </a>
        {canManage && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('確定要刪除這筆共用素材紀錄嗎？')) {
                onDelete(record.id);
              }
            }}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-500 hover:text-red-500 w-7 h-7 rounded-full flex items-center justify-center shadow-sm text-xs transition-colors"
            title="刪除素材"
          >
            <i className="fa-regular fa-trash-can"></i>
          </button>
        )}
      </div>
    </div>
  );
};
