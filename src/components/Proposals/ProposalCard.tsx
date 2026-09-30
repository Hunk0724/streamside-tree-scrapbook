import React, { useState } from 'react';
import { Proposal } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (id: string) => void;
  onAddComment: (id: string, text: string) => Promise<void>;
  onEdit: (proposal: Proposal) => void;
  onDelete: (id: string) => Promise<void>;
  onFinalize: (proposal: Proposal) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onVote,
  onAddComment,
  onEdit,
  onDelete,
  onFinalize
}) => {
  const { currentUser, isUserAdmin } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  const voters = Array.isArray(proposal.voters) ? proposal.voters : [];
  const hasVoted = !!(currentUser && voters.includes(currentUser.uid));
  const voteCount = typeof proposal.votes === 'number' ? proposal.votes : voters.length;

  const canManage = isUserAdmin || (currentUser && (
    proposal.authorUid === currentUser.uid ||
    (!proposal.authorUid && proposal.author === currentUser.displayName)
  ));

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setIsSendingComment(true);
      await onAddComment(proposal.id, commentText.trim());
      setCommentText('');
    } finally {
      setIsSendingComment(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 card-shadow relative flex flex-col justify-between ${
        proposal.isFinal ? 'border-4 border-yellow-200' : 'border border-gray-100'
      }`}
    >
      {proposal.isFinal ? (
        <div className="washi-tape tape-2"></div>
      ) : (
        <div className="washi-tape tape-1"></div>
      )}

      {proposal.isFinal && (
        <div className="absolute -top-3 -right-3 bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow transform rotate-12 z-20">
          <i className="fa-solid fa-crown mr-1"></i> 本月決定
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mt-2">
          <div className="flex-1 pr-2">
            <h3 className="text-xl font-bold text-ink mb-1.5 leading-snug">{proposal.title}</h3>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <i className="fa-regular fa-user"></i> {proposal.author || '匿名'} · {proposal.date || ''}
            </p>
          </div>
          <button
            onClick={() => onVote(proposal.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all border min-w-[62px] ${
              hasVoted ? 'bg-red-50 border-red-200' : 'bg-gray-50 hover:bg-red-50 border-gray-100'
            }`}
            title={hasVoted ? '取消投票' : '投我一票'}
          >
            <i
              className={`fa-solid fa-heart mb-0.5 text-lg transition-transform ${
                hasVoted ? 'text-red-500 scale-110' : 'text-gray-300'
              }`}
            ></i>
            <span className={`font-bold text-xs ${hasVoted ? 'text-red-500' : 'text-ink'}`}>
              {voteCount} 票
            </span>
          </button>
        </div>

        {proposal.desc && (
          <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">{proposal.desc}</p>
        )}

        {proposal.isFinal ? (
          <div className="mt-3 bg-yellow-50/90 border border-yellow-200 p-2.5 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
            <i className="fa-solid fa-user-check text-yellow-600"></i>
            <span>
              負責人：<b>{proposal.owner || '未指定'}</b>
            </span>
          </div>
        ) : (
          <button
            onClick={() => onFinalize(proposal)}
            className="mt-3 text-xs text-morandi hover:text-morandi-dark underline flex items-center gap-1 font-medium"
          >
            <i className="fa-solid fa-check"></i> 設為最終決定
          </button>
        )}

        {canManage && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onEdit(proposal)}
              className="text-xs text-gray-600 hover:text-morandi-dark hover:bg-morandi/15 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium border border-gray-200 bg-white"
              title="編輯此提案內容"
            >
              <i className="fa-regular fa-pen-to-square"></i> 編輯
            </button>
            <button
              onClick={() => {
                if (window.confirm(`確定要刪除提案「${proposal.title}」嗎？`)) {
                  onDelete(proposal.id);
                }
              }}
              className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              title="刪除此提案"
            >
              <i className="fa-regular fa-trash-can"></i> 刪除
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <hr className="my-3 border-dashed border-gray-200" />
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <i className="fa-regular fa-comments"></i> 討論區 ({(proposal.comments || []).length})
          </h4>
          <div className="max-h-28 overflow-y-auto pr-1 space-y-1.5">
            {(!proposal.comments || proposal.comments.length === 0) ? (
              <p className="text-xs text-gray-400 italic py-1">還沒有人留言，來當第一個吧～</p>
            ) : (
              proposal.comments.map((c, i) => (
                <div key={i} className="bg-gray-50/90 border border-gray-100 p-2 rounded-lg text-xs flex items-start gap-2">
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
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-morandi text-ink"
              placeholder="發表討論想法..."
            />
            <button
              type="submit"
              disabled={isSendingComment || !commentText.trim()}
              className="bg-gray-200 hover:bg-morandi hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              送出
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
