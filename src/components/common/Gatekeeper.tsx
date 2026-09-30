import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../services/firebase';

export const Gatekeeper: React.FC = () => {
  const {
    currentUser,
    memberRecord,
    loginWithGoogle,
    logout,
    applyForMembership,
    loading
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full card-shadow text-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-milktea-dark mb-4"></i>
          <p className="text-sm font-medium text-ink">手帳載入中，正在確認權限...</p>
        </div>
      </div>
    );
  }

  // 1. 未登入訪客 (Guest)
  if (!currentUser) {
    return (
      <section className="flex min-h-[90vh] items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full card-shadow relative border border-gray-100 text-center">
          <div className="washi-tape tape-1"></div>

          <div className="w-16 h-16 rounded-full bg-milktea/20 text-milktea-dark flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
            <i className="fa-solid fa-lock"></i>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">
            我們的手帳 <span className="text-milktea font-handwriting text-3xl">Scrapbook</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            這是成青小組的私人手帳空間。<br />
            為防止未授權存取與攻擊，請先使用 Google 帳號登入。
          </p>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-ink border-2 border-gray-200 hover:border-morandi hover:bg-gray-50 py-3 px-5 rounded-2xl font-semibold shadow-sm transition-all text-sm"
          >
            <i className="fa-brands fa-google text-red-500 text-lg"></i>
            <span>使用 Google 帳號登入</span>
          </button>

          <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
            管理員：<span className="text-ink font-medium">{ADMIN_EMAIL}</span>
          </div>
        </div>
      </section>
    );
  }

  // 使用者資訊預覽區塊
  const userBox = (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6 text-left">
      <img
        src={currentUser.photoURL || 'https://placehold.co/100x100/d4b59e/ffffff?text=U'}
        className="w-10 h-10 rounded-full border border-milktea object-cover"
        alt="avatar"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-ink truncate">{currentUser.displayName || 'Google 使用者'}</p>
        <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
      </div>
    </div>
  );

  // 2. 登入但尚未提交申請 (未留有 memberRecord)
  if (!memberRecord) {
    return (
      <section className="flex min-h-[90vh] items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full card-shadow relative border border-gray-100 text-center">
          <div className="washi-tape tape-1"></div>

          <div className="w-16 h-16 rounded-full bg-milktea/20 text-milktea-dark flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
            <i className="fa-solid fa-envelope-open-text text-milktea-dark"></i>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">申請加入小組手帳 📝</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 leading-relaxed">
            您好！您的 Google 帳號尚未在小組手帳名單中。<br />
            點擊下方按鈕即可向管理員送出加入申請。
          </p>

          {userBox}

          <div className="space-y-3">
            <button
              onClick={applyForMembership}
              className="w-full bg-morandi hover:bg-morandi-dark text-white py-3 px-5 rounded-2xl font-semibold shadow-sm transition-all text-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>送出加入申請</span>
            </button>
            <button
              onClick={logout}
              className="w-full text-xs text-gray-400 hover:text-red-500 py-2 transition-colors"
            >
              切換其他 Google 帳號 / 登出
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
            管理員：<span className="text-ink font-medium">{ADMIN_EMAIL}</span>
          </div>
        </div>
      </section>
    );
  }

  // 3. 審核中 (Pending)
  if (memberRecord.status === 'pending') {
    return (
      <section className="flex min-h-[90vh] items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full card-shadow relative border border-gray-100 text-center">
          <div className="washi-tape tape-1"></div>

          <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">申請審核中 ⏳</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 leading-relaxed">
            您的加入申請已送出！<br />
            目前正在等待管理員 (<b className="text-ink">{ADMIN_EMAIL}</b>) 核可。<br />
            管理員核可後，頁面將自動即時解鎖進入！
          </p>

          {userBox}

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-milktea hover:bg-milktea-dark text-white py-3 px-5 rounded-2xl font-semibold shadow-sm transition-all text-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>重新整理檢查狀態</span>
            </button>
            <button
              onClick={logout}
              className="w-full text-xs text-gray-400 hover:text-red-500 py-2 transition-colors"
            >
              登出帳號
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
            管理員：<span className="text-ink font-medium">{ADMIN_EMAIL}</span>
          </div>
        </div>
      </section>
    );
  }

  // 4. 未通過審核 (Rejected)
  return (
    <section className="flex min-h-[90vh] items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full card-shadow relative border border-gray-100 text-center">
        <div className="washi-tape tape-1"></div>

        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
          <i className="fa-solid fa-ban"></i>
        </div>

        <h2 className="text-2xl font-bold text-ink mb-2">未通過審核 🚫</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 leading-relaxed">
          抱歉，您的加入申請未獲核准。<br />
          如有疑問請與小組管理員聯繫。
        </p>

        {userBox}

        <button
          onClick={logout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-ink py-2.5 px-5 rounded-2xl font-semibold transition-all text-xs"
        >
          登出帳號
        </button>

        <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400">
          管理員：<span className="text-ink font-medium">{ADMIN_EMAIL}</span>
        </div>
      </div>
    </section>
  );
};
