import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA58jhPhUAc4zoaVrAAzvJIEOS6T8B1Jek",
  authDomain: "streamside-tree-backend.firebaseapp.com",
  projectId: "streamside-tree-backend",
  storageBucket: "streamside-tree-backend.firebasestorage.app",
  messagingSenderId: "768444307185",
  appId: "1:768444307185:web:1dfa39c5508e13f4297b50",
  measurementId: "G-ES86JTRZ83"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchWishes() {
  try {
    const wishesRef = collection(db, 'wishes');
    const q = query(wishesRef);
    const snapshot = await getDocs(q);

    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });

    if (list.length === 0) {
      console.log('📌 目前許願池中尚無任何願望記錄。');
      process.exit(0);
    }

    // 依集氣人數降序排序
    list.sort((a, b) => {
      const likesA = Array.isArray(a.likes) ? a.likes.length : 0;
      const likesB = Array.isArray(b.likes) ? b.likes.length : 0;
      return likesB - likesA;
    });

    console.log(`\n==================================================`);
    console.log(`✨ 小組手帳功能許願池最新清單（共 ${list.length} 項）`);
    console.log(`==================================================\n`);

    list.forEach((item, index) => {
      const likesCount = Array.isArray(item.likes) ? item.likes.length : 0;
      const statusMap = {
        pending: '💡 許願中 (待評估)',
        in_progress: '🛠️ 實現中 (開發中)',
        completed: '🎉 已實現 (已上線)'
      };
      const statusText = statusMap[item.status] || item.status || '未知狀態';

      console.log(`[#${index + 1}] ${item.title}`);
      console.log(`   狀態: ${statusText} | 集氣數: ❤️ ${likesCount} 票`);
      console.log(`   提案人: ${item.author || '匿名'} (${item.date || '無日期'})`);
      if (item.desc) {
        console.log(`   說明: ${item.desc}`);
      }
      if (item.adminNote) {
        console.log(`   管理員筆記: 📢 ${item.adminNote}`);
      }
      console.log(`   ID: ${item.id}`);
      console.log(`--------------------------------------------------`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ 讀取許願池失敗:', err.message);
    if (err.message.includes('permission')) {
      console.error('👉 請確認 Firebase Console 的 Firestore Rules 是否已將 wishes 設定為 allow read: if true;');
    }
    process.exit(1);
  }
}

fetchWishes();
