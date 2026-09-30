import React, { useState, useEffect } from 'react';
import { Proposal } from '../../types';
import { useAuth } from '../../context/AuthContext';

// 1. 新增提案彈窗
interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, desc: string) => Promise<void>;
}

export const AddProposalModal: React.FC<AddProposalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫提案標題！');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(title.trim(), desc.trim());
      setTitle('');
      setDesc('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow relative animate-scale-up">
        <div className="washi-tape tape-1"></div>
        <h3 className="text-lg font-bold mb-4 mt-2 text-ink flex items-center gap-2">
          <span>提出新點子</span> 💡
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聚會標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-morandi outline-none py-2 bg-transparent text-ink placeholder-gray-400"
              placeholder="例如：10月：秋季野餐大會"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動想法 / 內容說明</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg focus:border-morandi outline-none p-3 resize-none text-ink placeholder-gray-400 text-sm"
              placeholder="想去哪裡？預計做什麼呢？"
            ></textarea>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <i className="fa-solid fa-circle-user text-morandi text-base"></i>
            <span>提案人：<b className="text-ink">{currentUser?.displayName || '小組成員'}</b></span>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-500 hover:text-ink text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>送出貼上</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. 編輯提案彈窗
interface EditProposalModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title: string; desc: string; owner: string; isFinal: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditProposalModal: React.FC<EditProposalModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { currentUser, isUserAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [owner, setOwner] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canDelete = isUserAdmin || (currentUser && proposal && (
    proposal.authorUid === currentUser.uid ||
    (!proposal.authorUid && proposal.author === currentUser.displayName)
  ));

  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title || '');
      setDesc(proposal.desc || '');
      setOwner(proposal.owner || '');
      setIsFinal(!!proposal.isFinal);
    }
  }, [proposal]);

  if (!isOpen || !proposal) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫提案標題！');
      return;
    }
    try {
      setIsSaving(true);
      await onSave(proposal.id, {
        title: title.trim(),
        desc: desc.trim(),
        owner: owner.trim(),
        isFinal
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`確定要刪除提案「${proposal.title}」嗎？此動作無法復原！`)) return;
    try {
      setIsSaving(true);
      await onDelete(proposal.id);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow relative animate-scale-up">
        <div className="washi-tape tape-2"></div>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-morandi"></i> 編輯提案內容
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">聚會標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-morandi outline-none py-2 bg-transparent text-ink placeholder-gray-400 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動想法 / 內容說明</label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg focus:border-morandi outline-none p-3 resize-none text-ink placeholder-gray-400 text-sm"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">負責人 / 主責人 (選填)</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-milktea outline-none py-2 bg-transparent text-ink placeholder-gray-400"
              placeholder="例如：未指定 或 小智"
            />
          </div>
          <div className="flex items-center gap-2 pt-1 bg-yellow-50/60 p-2.5 rounded-xl border border-yellow-100">
            <input
              type="checkbox"
              id="edit-isFinal"
              checked={isFinal}
              onChange={(e) => setIsFinal(e.target.checked)}
              className="w-4 h-4 text-milktea rounded border-gray-300 focus:ring-milktea cursor-pointer"
            />
            <label htmlFor="edit-isFinal" className="text-xs text-yellow-900 cursor-pointer font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-crown text-yellow-500"></i> 設為本月最終決定方案
            </label>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
            {canDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <i className="fa-regular fa-trash-can"></i> 刪除此提案
              </button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-gray-500 hover:text-ink text-sm"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <i className="fa-solid fa-spinner fa-spin"></i>}
                <span>儲存修改</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. 設定最終方案彈窗
interface FinalizeProposalModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (id: string, owner: string) => Promise<void>;
}

export const FinalizeProposalModal: React.FC<FinalizeProposalModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onFinalize
}) => {
  const [owner, setOwner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !proposal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim()) {
      alert('請填寫負責人姓名！');
      return;
    }
    try {
      setIsSubmitting(true);
      await onFinalize(proposal.id, owner.trim());
      setOwner('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm card-shadow relative border-4 border-yellow-100 animate-scale-up">
        <div className="washi-tape tape-3"></div>
        <h3 className="text-lg font-bold mb-2 mt-2 text-ink">🎉 決定是這個了！</h3>
        <p className="text-sm text-gray-500 mb-4">請指定一位負責人來主導這次活動吧。</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">負責人姓名</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-milktea outline-none py-2 bg-transparent text-ink"
              placeholder="例如：小智"
              required
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-500 hover:text-ink text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-milktea hover:bg-milktea-dark text-white px-5 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>確認決定</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
