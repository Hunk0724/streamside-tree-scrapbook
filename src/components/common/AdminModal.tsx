import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../services/firebase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { allMembers, approveMember, rejectMember, removeMember } = useAuth();

  if (!isOpen) return null;

  const pendingList = allMembers.filter((m) => m.status === 'pending');
  const approvedList = allMembers.filter((m) => m.status === 'approved');

  return (
    <div className="fixed inset-0 z-[110] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl card-shadow relative max-h-[85vh] flex flex-col animate-scale-up">
        <div className="washi-tape tape-1"></div>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-morandi"></i> 小組成員審核管理
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink text-sm p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          只有超級管理員 (<b className="text-ink">{ADMIN_EMAIL}</b>) 能看見此審核面板。核可後該成員即可即時瀏覽與協作手帳。
        </p>

        {/* 審核列表容器 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* 待審核區塊 */}
          <div>
            <h4 className="text-xs font-bold text-morandi-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-clock"></i> 待審核申請 ({pendingList.length})
            </h4>
            <div className="space-y-2">
              {pendingList.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">目前沒有等待審核的申請 🙌</p>
              ) : (
                pendingList.map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center justify-between p-3 rounded-2xl bg-yellow-50/80 border border-yellow-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.photoURL || 'https://placehold.co/100x100/d4b59e/ffffff?text=U'}
                        className="w-8 h-8 rounded-full object-cover border border-milktea"
                        alt={m.displayName}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-ink truncate">{m.displayName || '未具名'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 ml-2 shrink-0">
                      <button
                        onClick={() => approveMember(m.uid)}
                        className="bg-morandi hover:bg-morandi-dark text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        核可
                      </button>
                      <button
                        onClick={() => rejectMember(m.uid)}
                        className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                      >
                        拒絕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 已核可名單區塊 */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-green-500"></i> 已核可的成員名單 ({approvedList.length})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {approvedList.map((m) => (
                <div
                  key={m.uid}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={m.photoURL || 'https://placehold.co/100x100/d4b59e/ffffff?text=U'}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                      alt={m.displayName}
                    />
                    <span className="font-medium text-ink truncate">{m.displayName || '成員'}</span>
                    <span className="text-gray-400 text-[11px] truncate hidden sm:inline">({m.email})</span>
                    {m.role === 'admin' && (
                      <span className="bg-morandi/20 text-morandi-dark text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        管理員
                      </span>
                    )}
                  </div>
                  {m.role !== 'admin' && (
                    <button
                      onClick={() => removeMember(m.uid)}
                      title="移除授權"
                      className="text-gray-400 hover:text-red-500 transition-colors px-1"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-medium transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
