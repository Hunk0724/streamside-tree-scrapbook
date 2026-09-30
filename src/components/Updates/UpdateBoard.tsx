import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UpdateItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { UpdateCard } from './UpdateCard';
import { AddUpdateModal } from './AddUpdateModal';

export const UpdateBoard: React.FC = () => {
  const { showToast } = useAuth();
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'updates'),
      (snapshot) => {
        const list: UpdateItem[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as UpdateItem);
        });

        // 照建立時間降序排序
        list.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : (a.date ? new Date(a.date).getTime() : 0);
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : (b.date ? new Date(b.date).getTime() : 0);
          return tB - tA;
        });

        setUpdates(list);
        setLoading(false);
      },
      (err) => {
        console.error('即時同步日常動態失敗:', err);
        showToast('⚠️ 動態同步中斷，請確認網路連線');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  const handleDeleteUpdate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'updates', id));
      showToast('🗑️ 動態已成功刪除！');
    } catch (err: any) {
      console.error('刪除動態失敗:', err);
      alert('刪除失敗：' + (err.message || '權限不足'));
    }
  };

  return (
    <section className="block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <i className="fa-solid fa-paper-plane text-ink"></i> 日常小碎片
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">生活點滴、代禱事項與工作近況交流</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-ink hover:bg-gray-800 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm text-sm flex items-center gap-1.5 w-full sm:w-auto justify-center"
        >
          <i className="fa-solid fa-pen-nib"></i> 發佈動態
        </button>
      </div>

      {loading ? (
        <div className="max-w-2xl mx-auto space-y-4 py-8">
          <div className="bg-white/60 rounded-2xl p-6 h-36 animate-pulse"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-36 animate-pulse"></div>
        </div>
      ) : updates.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white/70 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center my-4">
          <i className="fa-regular fa-comment-dots text-gray-400 text-4xl mb-3"></i>
          <h3 className="text-lg font-bold text-ink">還沒有人發佈日常動態</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">今天遇到什麼有趣的事情嗎？寫下來分享給小組吧！</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-ink hover:bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-pen-nib"></i>
            <span>寫下第一篇日常</span>
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {updates.map((upd) => (
            <UpdateCard
              key={upd.id}
              update={upd}
              onDelete={handleDeleteUpdate}
            />
          ))}
        </div>
      )}

      <AddUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
