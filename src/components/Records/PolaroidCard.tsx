import React from 'react';
import { RecordItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PolaroidCardProps {
  record: RecordItem;
  rotation: number;
  onDelete: (id: string) => Promise<void>;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ record, rotation, onDelete }) => {
  const { currentUser, isUserAdmin } = useAuth();
  const canManage = isUserAdmin || (currentUser && record.authorUid === currentUser.uid);

  return (
    <div className="masonry-item">
      <div
        className="polaroid transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="washi-tape tape-1"></div>
        <img
          src={record.url}
          loading="lazy"
          className="w-full aspect-[4/3] object-cover bg-gray-100 rounded-sm"
          alt={record.text || '活動相片'}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300/f3f4f6/a3b19b?text=Image+Loaded+Failed';
          }}
        />
        <div className="mt-3 text-center">
          <p className="font-handwriting text-xl text-ink leading-tight">
            {record.text || '✨ 美好的時光'}
          </p>
          <div className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-center gap-1.5">
            <span>
              <i className="fa-regular fa-clock"></i> {record.date || ''} · 來自 {record.author || '小組成員'}
            </span>
            {canManage && (
              <button
                onClick={() => {
                  if (window.confirm('確定要刪除這張拍立得照片嗎？')) {
                    onDelete(record.id);
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="刪除此相片"
              >
                <i className="fa-regular fa-trash-can text-xs"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
