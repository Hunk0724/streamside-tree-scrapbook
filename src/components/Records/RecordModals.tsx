import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// 1. 新增相片彈窗
interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('請先選取一張照片圖檔！');
      return;
    }
    if (!currentUser) return;

    try {
      setIsUploading(true);
      showToast('正在上傳照片到 Firebase Cloud Storage...', 0);

      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = ref(storage, `photos/${Date.now()}_${safeName}`);
      const snapshot = await uploadBytes(fileRef, selectedFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

      await addDoc(collection(db, 'records'), {
        type: 'photo',
        url: downloadUrl,
        text: caption.trim() || '美好回憶 📸',
        author: currentUser.displayName || '小組成員',
        authorPhoto: currentUser.photoURL || '',
        authorUid: currentUser.uid,
        date: dateStr,
        createdAt: serverTimestamp()
      });

      showToast('📸 照片已成功上傳並貼上相片牆！', 3500);
      setSelectedFile(null);
      setPreviewUrl('');
      setCaption('');
      onClose();
    } catch (err: any) {
      console.error('上傳照片失敗:', err);
      alert('上傳失敗：' + (err.message || '權限不足'));
      showToast('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md card-shadow relative animate-scale-up">
        <div className="washi-tape tape-1"></div>
        <h3 className="text-lg font-bold mb-4 mt-2 text-ink flex items-center gap-2">
          <span>貼上活動相片</span> 📸
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選取照片圖檔 <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-morandi file:text-white hover:file:bg-morandi-dark file:cursor-pointer cursor-pointer border border-gray-200 rounded-xl p-2 bg-gray-50"
              required
            />
            <p className="text-xs text-gray-400 mt-1">支援 JPG, PNG, WEBP 等圖檔格式，將自動上傳至 Cloud Storage</p>
          </div>

          {previewUrl && (
            <div className="transition-all">
              <p className="text-xs text-gray-500 mb-1">拍立得預覽：</p>
              <div className="w-full max-w-[200px] mx-auto bg-white p-2.5 pb-6 border border-gray-200 shadow-md rotate-[-2deg]">
                <img src={previewUrl} className="w-full aspect-[4/3] object-cover bg-gray-100" alt="預覽" />
                <p className="text-center font-handwriting text-ink text-sm mt-2 truncate">
                  {caption || '✨ 預覽拍立得'}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">相片說明 (寫在拍立得底下)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border-b-2 border-gray-200 focus:border-morandi outline-none py-2 bg-transparent text-ink placeholder-gray-400"
              placeholder="例如：超開心的烤肉野餐！"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <i className="fa-solid fa-camera text-morandi text-base"></i>
            <span>上傳者：<b className="text-ink">{currentUser?.displayName || '小組成員'}</b></span>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-500 hover:text-ink text-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>上傳檔案中...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>上傳並貼上</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. 新增素材/連結彈窗
interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('請填寫素材標題與連結網址！');
      return;
    }
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

      await addDoc(collection(db, 'records'), {
        type: 'material',
        text: title.trim(),
        url: url.trim(),
        author: currentUser.displayName || '小組成員',
        authorPhoto: currentUser.photoURL || '',
        authorUid: currentUser.uid,
        date: dateStr,
        createdAt: serverTimestamp()
      });

      showToast('📎 素材已成功新增！', 3000);
      setTitle('');
      setUrl('');
      onClose();
    } catch (err: any) {
      console.error('新增素材失敗:', err);
      alert('新增失敗：' + (err.message || '權限不足'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4">
      <div className="bg-[#fbf9f4] rounded-2xl p-6 w-full max-w-md card-shadow border-2 border-dashed border-milktea relative animate-scale-up">
        <h3 className="text-lg font-bold mb-4 text-ink flex items-center gap-2">
          <span>新增共用素材 / 簡報</span> 📎
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">素材標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-milktea focus:border-ink outline-none py-2 bg-transparent text-ink placeholder-gray-400"
              placeholder="例如：成青小組十月份投影片.pdf"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">連結網址 (Google Drive / Notion 等)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border-b-2 border-milktea focus:border-ink outline-none py-2 bg-transparent text-ink placeholder-gray-400"
              placeholder="https://drive.google.com/..."
              required
            />
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
              className="bg-milktea hover:bg-milktea-dark text-white px-5 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>新增素材</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
