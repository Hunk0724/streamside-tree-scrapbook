import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

interface AddUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUpdateModal: React.FC<AddUpdateModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) {
      alert('請寫點新鮮事或選取一張照片吧！');
      return;
    }
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      let imgUrl = '';

      if (selectedFile) {
        showToast('正在上傳動態附圖...', 0);
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileRef = ref(storage, `updates/${Date.now()}_${safeName}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        imgUrl = await getDownloadURL(snapshot.ref);
      }

      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

      await addDoc(collection(db, 'updates'), {
        text: text.trim(),
        imgUrl,
        author: currentUser.displayName || '小組成員',
        authorPhoto: currentUser.photoURL || '',
        authorUid: currentUser.uid,
        date: dateStr,
        createdAt: serverTimestamp()
      });

      showToast('📝 動態已成功發佈！', 3000);
      setText('');
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      console.error('發佈動態失敗:', err);
      alert('發佈動態失敗：' + (err.message || '權限不足'));
      showToast('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow relative animate-scale-up">
        <h3 className="text-lg font-bold mb-4 text-ink flex items-center gap-2">
          <span>今天有什麼新鮮事？</span> 📝
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg focus:border-ink outline-none p-3 resize-none text-ink placeholder-gray-400 text-sm"
              placeholder="跟大家分享近況、工作或是生活小感恩吧..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">附圖圖檔 (選填)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 file:cursor-pointer cursor-pointer border border-gray-200 rounded-lg p-2 bg-gray-50"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <i className="fa-solid fa-pen text-ink text-base"></i>
            <span>發文者：<b className="text-ink">{currentUser?.displayName || '小組成員'}</b></span>
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
              className="bg-ink hover:bg-gray-800 text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>發佈動態</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
