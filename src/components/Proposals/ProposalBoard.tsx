import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Proposal } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ProposalCard } from './ProposalCard';
import { AddProposalModal, EditProposalModal, FinalizeProposalModal } from './ProposalModals';

export const ProposalBoard: React.FC = () => {
  const { currentUser, showToast } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  // 彈窗控制狀態
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [finalizingProposal, setFinalizingProposal] = useState<Proposal | null>(null);

  // 即時監聽 proposals 集合
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'proposals'),
      (snapshot) => {
        const list: Proposal[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() } as Proposal);
        });

        // 排序規則：定案優先，其餘按建立時間降序
        list.sort((a, b) => {
          if (b.isFinal !== a.isFinal) return b.isFinal ? 1 : -1;
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : (a.date ? new Date(a.date).getTime() : 0);
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : (b.date ? new Date(b.date).getTime() : 0);
          return tB - tA;
        });

        setProposals(list);
        setLoading(false);
      },
      (err) => {
        console.error('即時同步提案錯誤:', err);
        showToast('⚠️ 提案同步中斷，請確認網路連線');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // 新增提案
  const handleAddProposal = async (title: string, desc: string) => {
    if (!currentUser) return;
    try {
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
      await addDoc(collection(db, 'proposals'), {
        title,
        desc,
        author: currentUser.displayName || '小組成員',
        authorPhoto: currentUser.photoURL || '',
        authorUid: currentUser.uid,
        votes: 0,
        voters: [],
        comments: [],
        isFinal: false,
        owner: '',
        date: dateStr,
        createdAt: serverTimestamp()
      });
      showToast('🎉 新提案已發佈！');
    } catch (err: any) {
      console.error('發佈提案失敗:', err);
      alert('發佈失敗：' + (err.message || '未知錯誤'));
    }
  };

  // 投票 / 取消投票
  const handleVote = async (id: string) => {
    if (!currentUser) return;
    const prop = proposals.find((p) => p.id === id);
    if (!prop) return;

    const voters = Array.isArray(prop.voters) ? [...prop.voters] : [];
    const idx = voters.indexOf(currentUser.uid);
    if (idx > -1) {
      voters.splice(idx, 1);
    } else {
      voters.push(currentUser.uid);
    }

    try {
      await updateDoc(doc(db, 'proposals', id), {
        voters,
        votes: voters.length
      });
    } catch (err: any) {
      console.error('投票失敗:', err);
      showToast('⚠️ 投票失敗：' + (err.message || '權限不足'));
    }
  };

  // 新增留言
  const handleAddComment = async (id: string, text: string) => {
    if (!currentUser) return;
    const prop = proposals.find((p) => p.id === id);
    if (!prop) return;

    const comments = Array.isArray(prop.comments) ? [...prop.comments] : [];
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    comments.push({
      author: currentUser.displayName || '小組成員',
      authorPhoto: currentUser.photoURL || '',
      authorUid: currentUser.uid,
      text,
      date: dateStr
    });

    try {
      await updateDoc(doc(db, 'proposals', id), { comments });
    } catch (err: any) {
      console.error('留言失敗:', err);
      showToast('⚠️ 留言失敗：' + (err.message || '權限不足'));
    }
  };

  // 編輯儲存提案
  const handleSaveEdit = async (
    id: string,
    updates: { title: string; desc: string; owner: string; isFinal: boolean }
  ) => {
    try {
      await updateDoc(doc(db, 'proposals', id), updates);
      showToast('✅ 提案修改已成功儲存！');
    } catch (err: any) {
      console.error('修改提案失敗:', err);
      alert('儲存失敗：' + (err.message || '權限不足'));
    }
  };

  // 刪除提案
  const handleDeleteProposal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'proposals', id));
      showToast('🗑️ 提案已刪除');
    } catch (err: any) {
      console.error('刪除提案失敗:', err);
      alert('刪除失敗：' + (err.message || '權限不足'));
    }
  };

  // 確認最終定案
  const handleFinalize = async (id: string, owner: string) => {
    try {
      await updateDoc(doc(db, 'proposals', id), {
        isFinal: true,
        owner
      });
      showToast('🎉 已成功設定本月最終決定！');
    } catch (err: any) {
      console.error('設定定案失敗:', err);
      alert('設定失敗：' + (err.message || '權限不足'));
    }
  };

  return (
    <section className="block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-ink">
            <i className="fa-solid fa-seedling text-morandi"></i> 聚會提案板
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">點擊愛心進行即時投票，點擊卡片留言交流！</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-milktea hover:bg-milktea-dark text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm flex items-center gap-1.5 text-sm"
        >
          <i className="fa-solid fa-plus"></i> 新增提案
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <div className="bg-white/60 rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
          <div className="bg-white/60 rounded-2xl p-6 h-48 animate-pulse border border-gray-100"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="w-full bg-white/85 border-2 border-dashed border-milktea rounded-3xl p-10 text-center my-6 shadow-sm">
          <i className="fa-regular fa-lightbulb text-milktea text-4xl mb-3"></i>
          <h3 className="text-lg font-bold text-ink">目前還沒有任何提案點子喔！</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">點擊上方「+ 新增提案」，提出大家一起聚會的點子吧！</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-morandi hover:bg-morandi-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-plus"></i>
            <span>馬上提出第一個點子</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((prop) => (
            <ProposalCard
              key={prop.id}
              proposal={prop}
              onVote={handleVote}
              onAddComment={handleAddComment}
              onEdit={(p) => setEditingProposal(p)}
              onDelete={handleDeleteProposal}
              onFinalize={(p) => setFinalizingProposal(p)}
            />
          ))}
        </div>
      )}

      {/* 彈窗集合 */}
      <AddProposalModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddProposal}
      />

      <EditProposalModal
        proposal={editingProposal}
        isOpen={!!editingProposal}
        onClose={() => setEditingProposal(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteProposal}
      />

      <FinalizeProposalModal
        proposal={finalizingProposal}
        isOpen={!!finalizingProposal}
        onClose={() => setFinalizingProposal(null)}
        onFinalize={handleFinalize}
      />
    </section>
  );
};
