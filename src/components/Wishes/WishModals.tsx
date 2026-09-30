import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { WishItem, WishStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

// 1. 新增許願彈窗
interface AddWishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWishModal: React.FC<AddWishModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('請填寫願望標題！');
      return;
    }
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

      await addDoc(collection(db, 'wishes'), {
        title: title.trim(),
        desc: desc.trim(),
        author: currentUser.displayName || '小組成員',
        authorPhoto: currentUser.photoURL || '',
        authorUid: currentUser.uid,
        status: 'pending',
        likes: [currentUser.uid],
        adminNote: '',
        date: dateStr,
        createdAt: serverTimestamp()
      });

      showToast('✨ 願望已送入許願池！', 3000);
      setTitle('');
      setDesc('');
      onClose();
    } catch (err: any) {
      console.error('送出願望失敗:', err);
      alert('送出失敗：' + (err.message || '權限不足'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow relative animate-scale-up">
        <div className="washi-tape tape-3"></div>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-yellow-500"></i> 許下新的手帳願望
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              願望標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-morandi outline-none py-2 bg-transparent text-ink placeholder-gray-400 font-medium"
              placeholder="例如：希望照片可以點開看全螢幕大圖"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">詳細說明 / 使用情境</label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg focus:border-morandi outline-none p-3 resize-none text-ink placeholder-gray-400 text-sm"
              placeholder="描述你期望的功能或是改善體驗，大家也可以一起討論！"
            ></textarea>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <i className="fa-solid fa-circle-user text-morandi text-base"></i>
            <span>許願人：<b className="text-ink">{currentUser?.displayName || '小組成員'}</b></span>
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
              <span>送出許願</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. 管理員更新願望進度彈窗
interface AdminWishModalProps {
  wish: WishItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminWishModal: React.FC<AdminWishModalProps> = ({ wish, isOpen, onClose }) => {
  const { showToast } = useAuth();
  const [status, setStatus] = useState<WishStatus>('pending');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (wish) {
      setStatus(wish.status || 'pending');
      setAdminNote(wish.adminNote || '');
    }
  }, [wish]);

  if (!isOpen || !wish) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, 'wishes', wish.id), {
        status,
        adminNote: adminNote.trim(),
        updatedAt: serverTimestamp()
      });
      showToast('✨ 願望進度已成功更新！', 3000);
      onClose();
    } catch (err: any) {
      console.error('更新願望狀態失敗:', err);
      alert('更新失敗：' + (err.message || '權限不足'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm card-shadow relative animate-scale-up">
        <div className="washi-tape tape-2"></div>
        <div className="flex justify-between items-center mb-3 mt-1">
          <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
            <i className="fa-solid fa-gear text-morandi"></i> 更新願望進度
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">當前進度狀態</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WishStatus)}
              className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-xs text-ink bg-white outline-none focus:border-morandi"
            >
              <option value="pending">💡 許願中 (等待集氣/評估)</option>
              <option value="in_progress">🛠️ 實現中 (已排入開發)</option>
              <option value="completed">🎉 已實現 (功能已上線)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">管理員開發者備註 (選填)</label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-2.5 resize-none text-xs text-ink outline-none focus:border-morandi placeholder-gray-400"
              placeholder="例如：預計下週上線！或：已部署於手帳～"
            ></textarea>
          </div>
          <div className="mt-5 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-gray-500 hover:text-ink text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-morandi hover:bg-morandi-dark text-white px-4 py-1.5 rounded-xl transition-colors text-xs font-medium shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>儲存進度</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
