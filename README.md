# 地鼠快打 Mole Rush

一款針對手機設計的 60 秒打地鼠遊戲。地鼠出現位置完全隨機，節奏會隨時間逐步加快，並有連擊加分、稀有金色地鼠、本機最佳紀錄與 A+～F 六級評分。

## 遊戲規則

- 每局 60 秒，共 9 個洞；前段熱身，後段每波最多同時出現 4 隻。
- 一般地鼠 100 分起，維持連擊可獲得額外分數。
- 金色地鼠每隻 250 分。
- 漏掉地鼠或點到空洞會中斷連擊。
- 最終依總分獲得 A+、A、B、C、D 或 F 評級。

評級門檻：A+ 為 10,400 分、A 為 8,300 分、B 為 6,200 分、C 為 4,400 分、D 為 2,800 分；未滿 2,800 分為 F。

## 本機執行

需要 Node.js 22.13.0 以上版本。

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000` 即可遊玩。

## 驗證與建置

```bash
npm run build
npm test
```

## 放上 GitHub

```bash
git add .
git commit -m "feat: add mobile mole rush game"
git remote add origin https://github.com/你的帳號/你的專案.git
git push -u origin main
```

## 技術

React、TypeScript、vinext、CSS。遊戲不需要資料庫或外部 API，最佳分數只保存在玩家自己的瀏覽器。
