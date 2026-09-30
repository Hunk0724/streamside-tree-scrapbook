import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { WishItem, WishStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { WishCard } from './WishCard';
import { AddWishModal, AdminWishModal } from './WishModals';

export const WishBoard: React.FC = () => {
  const { currentUser, showToast } = useAuth();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | WishStatus>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWishForAdmin, setSelectedWishForAdmin] = useState<WishItem | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'wishes'),
      (snapshot) => {
        const list: WishItem[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as WishItem);
        });

        // 排序規則：集氣點讚數降序，再按建立時間降序
        list.sort((a, b) => {
          const likesA = Array.isArray(a.likes) ? a.likes.length : 0;
          const likesB = Array.isArray(b.likes) ? b.likes.length : 0;
          if (likesB !== likesA) return likesB - likesA;
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : (a.date ? new Date(a.date).getTime() : 0);
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : (b.date ? new Date(b.date).getTime() : 0);
          return tB - tA;
        });

        setWishes(list);
        setLoading(false);
      },
      (err) => {
        console.error('即時同步許願池錯誤:', err);
        showToast('⚠️ 許願池同步中斷，請確認網路連線');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  const handleLike = async (id: string) => {
    if (!currentUser) return;
    const wish = wishes.find((w) => w.id === id);
    if (!wish) return;

    const likes = Array.isArray(wish.likes) ? [...wish.likes] : [];
    const idx = likes.indexOf(currentUser.uid);
    if (idx > -1) {
      likes.splice(idx, 1);
    } else {
      likes.push(currentUser.uid);
    }

    try {
      await updateDoc(doc(db, 'wishes', id), { likes });
    } catch (err: any) {
      console.error('集氣失敗:', err);
      showToast('⚠️ 集氣失敗：' + (err.message || '權限不足'));
    }
  };

  const handleDeleteWish = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wishes', id));
      showToast('🗑️ 願望已成功刪除！');
    } catch (err: any) {
      console.error('刪除願望失敗:', err);
      alert('刪除失敗：' + (err.message || '權限不足'));
    }
  };

  const filteredWishes = filterStatus === 'all'
    ? wishes
    : wishes.filter((w) => w.status === filterStatus);

  return (
    <section className="block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <i className="fa-solid fa-wand-magic-sparkles text-yellow-500"></i> 功能許願池
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">想要手帳增加什麼酷酷的新功能嗎？來這裡許願吧！</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm text-sm flex items-center gap-1.5 w-full sm:w-auto justify-center"
        >
          <i className="fa-solid fa-plus"></i> 我要許願
        </button>
      </div>

      {/* 篩選按鈕列 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'all', label: '全部顯示' },
          { id: 'pending', label: '💡 許願中' },
          { id: 'in_progress', label: '🛠️ 實現中' },
          { id: 'completed', label: '🎉 已實現' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-morandi text-white font-semibold shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          <div className="bg-white/60 rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="w-full bg-white/80 border-2 border-dashed border-yellow-200 rounded-3xl p-10 text-center my-4 shadow-sm">
          <i className="fa-solid fa-wand-magic-sparkles text-yellow-400 text-4xl mb-3"></i>
          <h3 className="text-lg font-bold text-ink">目前沒有符合的許願項目</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">點擊上方「+ 我要許願」，成為第一個許下願望的人吧！</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            <span>寫下第一個願望</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              onLike={handleLike}
              onOpenAdminModal={(w) => setSelectedWishForAdmin(w)}
              onDelete={handleDeleteWish}
            />
          ))}
        </div>
      )}

      {/* 彈窗 */}
      <AddWishModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <AdminWishModal
        wish={selectedWishForAdmin}
        isOpen={!!selectedWishForAdmin}
        onClose={() => setSelectedWishForAdmin(null)}
      />
    </section>
  );
};
