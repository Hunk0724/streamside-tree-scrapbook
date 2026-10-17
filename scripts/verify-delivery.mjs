import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('\n==================================================');
console.log('🛡️  小組手帳交付驗證與防迴歸守衛 (Delivery Guard)');
console.log('==================================================\n');

let hasError = false;

// 1. 檢查 Git 狀態與改動檔案
console.log('📋 [1/3] 檢驗 Git 狀態與改動範圍 (Scope & Diff Check)...');
try {
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (!statusOutput) {
    console.log('   ℹ️ 工作區目前乾淨，無未提交的改動。');
  } else {
    const lines = statusOutput.split('\n');
    console.log(`   🔍 偵測到 ${lines.length} 個檔案改動：`);
    lines.forEach((line) => {
      console.log(`      ${line}`);
    });
  }
} catch (err) {
  console.warn('   ⚠️ 無法取得 Git 狀態:', err.message);
}

// 2. 執行建置與 TypeScript 型別檢查
console.log('\n🔨 [2/3] 執行 TypeScript 型別檢查與生產打包 (Build Check)...');
try {
  execSync('npm.cmd run build', { stdio: 'inherit' });
  console.log('   ✅ 建置成功，TypeScript 檢查 0 錯誤！');
} catch (err) {
  console.error('   ❌ 建置失敗！請修復型別或打包錯誤。');
  hasError = true;
}

// 3. 稽核關鍵打包常數與防迴歸合約
console.log('\n🔍 [3/3] 稽核核心合約與防迴歸邊界 (Contract Audit)...');
const distAssetsDir = path.resolve('dist', 'assets');
if (fs.existsSync(distAssetsDir)) {
  const files = fs.readdirSync(distAssetsDir);
  const jsFiles = files.filter((f) => f.endsWith('.js') && f.startsWith('index-'));
  
  if (jsFiles.length > 0) {
    const mainBundle = fs.readFileSync(path.join(distAssetsDir, jsFiles[0]), 'utf8');
    
    // 檢查管理員信箱是否有 fallback 避免空字串
    const hasAdminFallback = mainBundle.includes('hunk123321123@gmail.com');
    if (hasAdminFallback) {
      console.log('   ✅ 管理員信箱兜底保障 (Admin Fallback) 正常注入。');
    } else {
      console.warn('   ⚠️ 警告：打包產物中未找到預設管理員信箱，請確認環境變數配置！');
    }

    // 檢查敏感私鑰未誤包
    const hasPrivateKeyLeak = mainBundle.includes('private_key') || mainBundle.includes('BEGIN PRIVATE KEY');
    if (!hasPrivateKeyLeak) {
      console.log('   ✅ 未偵測到私鑰或後端憑證洩漏。');
    } else {
      console.error('   ❌ 嚴重警告：打包產物中疑似含有私鑰！');
      hasError = true;
    }
  } else {
    console.warn('   ⚠️ 未找到 index-*.js 主檔案。');
  }
} else {
  console.warn('   ⚠️ dist 目錄不存在，無法進行產物稽核。');
}

console.log('\n==================================================');
if (hasError) {
  console.log('❌ 交付驗證未通過，請修正上述問題後再行提交！');
  console.log('==================================================\n');
  process.exit(1);
} else {
  console.log('🎉 交付驗證全數通過！可向使用者彙報準備部署。');
  console.log('==================================================\n');
  process.exit(0);
}

