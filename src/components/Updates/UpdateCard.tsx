import React from 'react';
import { UpdateItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface UpdateCardProps {
  update: UpdateItem;
  onDelete: (id: string) => Promise<void>;
}

export const UpdateCard: React.FC<UpdateCardProps> = ({ update, onDelete }) => {
  const { currentUser, isUserAdmin } = useAuth();
  const canManage = isUserAdmin || (currentUser && update.authorUid === currentUser.uid);

  const authorInitial = update.author ? update.author.charAt(0) : '友';

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow border-l-4 border-ink relative transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {update.authorPhoto ? (
            <img
              src={update.authorPhoto}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
              alt={update.author}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-milktea text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {authorInitial}
            </div>
          )}
          <div>
            <h4 className="font-bold text-ink text-sm">{update.author || '小組成員'}</h4>
            <p className="text-[11px] text-gray-400">{update.date || ''}</p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => {
              if (window.confirm('確定要刪除這筆日常動態嗎？')) {
                onDelete(update.id);
              }
            }}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="刪除此動態"
          >
            <i className="fa-regular fa-trash-can text-xs"></i>
          </button>
        )}
      </div>

      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{update.text}</p>

      {update.imgUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 max-h-80 bg-gray-50">
          <img src={update.imgUrl} loading="lazy" className="w-full h-full object-cover" alt="動態附圖" />
        </div>
      )}
    </div>
  );
};
