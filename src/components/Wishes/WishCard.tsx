import React from 'react';
import { WishItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface WishCardProps {
  wish: WishItem;
  onLike: (id: string) => void;
  onOpenAdminModal: (wish: WishItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export const WishCard: React.FC<WishCardProps> = ({
  wish,
  onLike,
  onOpenAdminModal,
  onDelete
}) => {
  const { currentUser, isUserAdmin } = useAuth();
  const likes = Array.isArray(wish.likes) ? wish.likes : [];
  const hasLiked = !!(currentUser && likes.includes(currentUser.uid));
  const likeCount = likes.length;

  const canDelete = isUserAdmin || (currentUser && wish.authorUid === currentUser.uid);

  let statusBadge = (
    <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
      <i className="fa-solid fa-lightbulb"></i> 許願中
    </span>
  );
  if (wish.status === 'completed') {
    statusBadge = (
      <span className="bg-green-100 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
        <i className="fa-solid fa-circle-check"></i> 已實現
      </span>
    );
  } else if (wish.status === 'in_progress') {
    statusBadge = (
      <span className="bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
        <i className="fa-solid fa-wrench"></i> 實現中
      </span>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 relative flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="washi-tape tape-3"></div>

      <div>
        <div className="flex justify-between items-start mt-2 mb-2 gap-2">
          <h3 className="text-base font-bold text-ink leading-snug flex-1">{wish.title}</h3>
          {statusBadge}
        </div>

        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
          <i className="fa-regular fa-user"></i> {wish.author || '匿名'} · {wish.date || ''}
        </p>

        {wish.desc && (
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{wish.desc}</p>
        )}

        {wish.adminNote && (
          <div className="mt-3 bg-yellow-50/80 border border-yellow-200/80 p-2.5 rounded-xl text-xs text-yellow-900 flex items-start gap-2">
            <i className="fa-solid fa-bullhorn text-yellow-600 mt-0.5 shrink-0"></i>
            <div>
              <span className="font-bold">管理員小筆記：</span>
              <span>{wish.adminNote}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUserAdmin && (
            <button
              onClick={() => onOpenAdminModal(wish)}
              className="text-xs text-morandi-dark hover:text-ink font-semibold flex items-center gap-1 hover:underline"
            >
              <i className="fa-solid fa-gear"></i> 管理狀態
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => {
                if (window.confirm(`確定要刪除願望「${wish.title}」嗎？`)) {
                  onDelete(wish.id);
                }
              }}
              className="text-gray-400 hover:text-red-500 text-xs p-1"
              title="刪除此願望"
            >
              <i className="fa-regular fa-trash-can"></i>
            </button>
          )}
        </div>

        <button
          onClick={() => onLike(wish.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
            hasLiked
              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-yellow-50'
          }`}
        >
          <i className={`fa-solid fa-wand-magic-sparkles ${hasLiked ? 'text-yellow-500' : 'text-gray-400'}`}></i>
          <span>+1 集氣 ({likeCount})</span>
        </button>
      </div>
    </div>
  );
};
