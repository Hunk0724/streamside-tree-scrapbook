import React, { useState } from 'react';
import { WishItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface WishCardProps {
  wish: WishItem;
  onLike: (id: string) => void;
  onOpenAdminModal: (wish: WishItem) => void;
  onDelete: (id: string) => Promise<void>;
  onAddComment: (wishId: string, text: string) => Promise<void>;
}

export const WishCard: React.FC<WishCardProps> = ({
  wish,
  onLike,
  onOpenAdminModal,
  onDelete,
  onAddComment
}) => {
  const { currentUser, isUserAdmin } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setIsSending(true);
      await onAddComment(wish.id, commentText.trim());
      setCommentText('');
    } finally {
      setIsSending(false);
    }
  };

  const comments = Array.isArray(wish.comments) ? wish.comments : [];

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

        {/* 管理員留言小筆記 */}
        {wish.adminNote && (
          <div className="mt-3 bg-yellow-50/80 border border-yellow-200/80 p-2.5 rounded-xl text-xs text-yellow-900 flex items-start gap-2">
            <i className="fa-solid fa-bullhorn text-yellow-600 mt-0.5 shrink-0"></i>
            <div>
              <span className="font-bold">開發者備註：</span>
              <span>{wish.adminNote}</span>
            </div>
          </div>
        )}

        {/* 🌟 具體改動與擴充功能摘要便條 (Release Notes) */}
        {wish.status === 'completed' && wish.changeSummary && (
          <div className="mt-3 bg-emerald-50/90 border border-emerald-200/80 p-3 rounded-xl text-xs text-emerald-950">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <i className="fa-solid fa-gift text-emerald-600"></i> 功能上線改動摘要
              </span>
              {wish.versionTag && (
                <span className="bg-emerald-200/70 text-emerald-900 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {wish.versionTag}
                </span>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">
              {wish.changeSummary}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
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

        {/* 🌟 願望使用回饋與討論區 */}
        <div className="pt-2 border-t border-dashed border-gray-100">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-gray-500 hover:text-ink font-medium flex items-center justify-between w-full py-1"
          >
            <span className="flex items-center gap-1.5">
              <i className="fa-regular fa-comments text-morandi"></i>
              <span>體驗回饋與討論 ({comments.length})</span>
            </span>
            <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform ${showComments ? 'rotate-180' : ''}`}></i>
          </button>

          {showComments && (
            <div className="mt-2 space-y-2">
              <div className="max-h-28 overflow-y-auto pr-1 space-y-1.5">
                {comments.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic py-1">還沒有反饋，試用後留個言告訴大家感覺如何吧！</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-xs flex items-start gap-2">
                      {c.authorPhoto ? (
                        <img
                          src={c.authorPhoto}
                          className="w-5 h-5 rounded-full object-cover mt-0.5 shrink-0"
                          alt={c.author}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className="fa-solid fa-circle-user text-gray-400 mt-0.5 shrink-0"></i>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-ink">{c.author}:</span>
                        <span className="text-gray-700 ml-1 break-words">{c.text}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-morandi text-ink"
                  placeholder="留個言回饋體驗..."
                />
                <button
                  type="submit"
                  disabled={isSending || !commentText.trim()}
                  className="bg-morandi hover:bg-morandi-dark text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  送出
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
