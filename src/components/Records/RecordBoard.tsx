import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { RecordItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PolaroidCard } from './PolaroidCard';
import { MaterialCard } from './MaterialCard';
import { AddPhotoModal, AddMaterialModal } from './RecordModals';

export const RecordBoard: React.FC = () => {
  const { showToast } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'material'>('all');
  const [loading, setLoading] = useState(true);

  // 彈窗狀態
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // 即時監聽 records 集合
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'records'),
      (snapshot) => {
        const list: RecordItem[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as RecordItem);
        });

        // 照建立時間降序排序
        list.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : (a.date ? new Date(a.date).getTime() : 0);
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : (b.date ? new Date(b.date).getTime() : 0);
          return tB - tA;
        });

        setRecords(list);
        setLoading(false);
      },
      (err) => {
        console.error('即時同步紀錄失敗:', err);
        showToast('⚠️ 紀錄同步中斷，請確認網路連線');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'records', id));
      showToast('🗑️ 紀錄已成功刪除！');
    } catch (err: any) {
      console.error('刪除紀錄失敗:', err);
      alert('刪除失敗：' + (err.message || '權限不足'));
    }
  };

  const displayedRecords = filterType === 'all'
    ? records
    : records.filter((r) => r.type === filterType);

  return (
    <section className="block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <i className="fa-solid fa-images text-milktea"></i> 相片與素材牆
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">上傳小組聚會拍立得或重要簡報共用連結</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsMaterialModalOpen(true)}
            className="bg-white border-2 border-morandi text-morandi hover:bg-morandi hover:text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm text-sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-link"></i> + 素材/連結
          </button>
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="bg-morandi hover:bg-morandi-dark text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm text-sm flex items-center gap-1.5"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> + 貼照片 (檔案上傳)
          </button>
        </div>
      </div>

      {/* 篩選標籤 */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'all', label: '全部顯示' },
          { id: 'photo', label: '📸 拍立得照片' },
          { id: 'material', label: '📎 共用素材' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-morandi text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          <div className="bg-white/60 rounded-2xl p-6 h-64 animate-pulse"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-64 animate-pulse"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-64 animate-pulse"></div>
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="w-full bg-white/85 border-2 border-dashed border-morandi rounded-3xl p-10 text-center my-6 shadow-sm">
          <i className="fa-solid fa-camera-retro text-morandi text-4xl mb-3"></i>
          <h3 className="text-lg font-bold text-ink">目前沒有符合的紀錄唷！</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">點擊上方「+ 貼照片」，挑選照片貼上吧！</p>
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span>馬上貼第一張照片</span>
          </button>
        </div>
      ) : (
        <div className="masonry">
          {displayedRecords.map((rec, index) => {
            const rotation = (index % 2 === 0) ? ((index % 3) * 1.5 - 1.5) : (-1 * (index % 3) * 1.5 + 1);
            if (rec.type === 'photo') {
              return (
                <PolaroidCard
                  key={rec.id}
                  record={rec}
                  rotation={rotation}
                  onDelete={handleDeleteRecord}
                />
              );
            }
            return (
              <MaterialCard
                key={rec.id}
                record={rec}
                rotation={rotation / 2}
                onDelete={handleDeleteRecord}
              />
            );
          })}
        </div>
      )}

      {/* 彈窗 */}
      <AddPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
      <AddMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
      />
    </section>
  );
};
