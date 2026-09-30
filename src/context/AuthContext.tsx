import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, ADMIN_EMAIL } from '../services/firebase';
import { Member } from '../types';
import { notifyAdminNewApplicant } from '../services/notification';

interface AuthContextType {
  currentUser: User | null;
  isUserAdmin: boolean;
  isUserApproved: boolean;
  memberRecord: Member | null;
  loading: boolean;
  allMembers: Member[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  applyForMembership: () => Promise<void>;
  approveMember: (uid: string) => Promise<void>;
  rejectMember: (uid: string) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string, duration?: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberRecord, setMemberRecord] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isUserAdmin = currentUser?.email === ADMIN_EMAIL;
  const isUserApproved = isUserAdmin || memberRecord?.status === 'approved';

  const showToast = (msg: string, duration = 3000) => {
    setToastMessage(msg);
    if (duration > 0) {
      setTimeout(() => setToastMessage(null), duration);
    }
  };

  // 監聽 Firebase Auth 登入狀態
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setMemberRecord(null);
        setLoading(false);
        return;
      }

      // 若為 Super Admin，自動寫入並確保核准
      if (user.email === ADMIN_EMAIL) {
        try {
          await setDoc(doc(db, 'members', user.uid), {
            email: user.email,
            displayName: user.displayName || '管理員',
            photoURL: user.photoURL || '',
            role: 'admin',
            status: 'approved',
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error('更新管理員狀態失敗:', e);
        }
      }

      // 監聽當前使用者的 member 審核文件
      const unsubscribeMemberDoc = onSnapshot(doc(db, 'members', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setMemberRecord({ uid: docSnap.id, ...docSnap.data() } as Member);
        } else {
          setMemberRecord(null);
        }
        setLoading(false);
      }, (err) => {
        console.error('監聽使用者審核狀態失敗:', err);
        setLoading(false);
      });

      return () => unsubscribeMemberDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  // 管理員監聽所有成員清單
  useEffect(() => {
    if (!isUserAdmin) {
      setAllMembers([]);
      return;
    }

    const unsubscribeAllMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach((snap) => {
        list.push({ uid: snap.id, ...snap.data() } as Member);
      });
      setAllMembers(list);
    }, (err) => {
      console.error('監聽成員清單失敗:', err);
    });

    return () => unsubscribeAllMembers();
  }, [isUserAdmin]);

  const loginWithGoogle = async () => {
    try {
      showToast('正在開啟 Google 登入...', 0);
      await signInWithPopup(auth, googleProvider);
      showToast('🎉 登入成功！', 2500);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('登入失敗：' + (err.message || err.code));
      }
      setToastMessage(null);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setMemberRecord(null);
      showToast('已安全登出', 2000);
    } catch (err: any) {
      console.error('登出失敗:', err);
    }
  };

  const applyForMembership = async () => {
    if (!currentUser) return;
    showToast('正在送出加入申請...', 0);
    try {
      await setDoc(doc(db, 'members', currentUser.uid), {
        email: currentUser.email,
        displayName: currentUser.displayName || '小組成員',
        photoURL: currentUser.photoURL || '',
        role: 'member',
        status: 'pending',
        appliedAt: serverTimestamp()
      });

      // 非同步觸發 GAS 郵件通知
      notifyAdminNewApplicant({
        applicantName: currentUser.displayName || '小組訪客',
        applicantEmail: currentUser.email || '未提供信箱',
        applyTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      });

      showToast('🎉 申請已送出！請等待管理員核可', 4000);
    } catch (err: any) {
      alert('送出申請失敗：' + err.message);
      setToastMessage(null);
    }
  };

  const approveMember = async (uid: string) => {
    try {
      showToast('核可中...', 0);
      await updateDoc(doc(db, 'members', uid), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });
      showToast('✅ 已成功核可該成員！', 3000);
    } catch (err: any) {
      alert('核可失敗：' + err.message);
      setToastMessage(null);
    }
  };

  const rejectMember = async (uid: string) => {
    if (!confirm('確定要拒絕此申請嗎？')) return;
    try {
      await updateDoc(doc(db, 'members', uid), {
        status: 'rejected'
      });
      showToast('已拒絕該申請', 2500);
    } catch (err: any) {
      alert('操作失敗：' + err.message);
    }
  };

  const removeMember = async (uid: string) => {
    if (!confirm('確定要撤銷此成員的存取權限嗎？該成員將無法再進入手帳。')) return;
    try {
      await deleteDoc(doc(db, 'members', uid));
      showToast('已移除該成員存取權限', 2500);
    } catch (err: any) {
      alert('移除失敗：' + err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isUserAdmin,
        isUserApproved,
        memberRecord,
        loading,
        allMembers,
        loginWithGoogle,
        logout,
        applyForMembership,
        approveMember,
        rejectMember,
        removeMember,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
