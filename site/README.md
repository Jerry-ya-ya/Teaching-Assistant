# Angular 課程網站

網站使用 Angular 模板呈現課程目錄與閱讀頁，使用 Marked 將動態載入的 Markdown 轉成 HTML，再經 DOMPurify 清理。GitHub 提示區塊、Mermaid、程式碼上色與複製按鈕由共用渲染器處理。

## 本地執行

在儲存庫根目錄使用 Node.js 24.15 以上的 24.x 版本，或符合根目錄 `package.json` 的 Node.js 版本：

```bash
npm ci
npm start
```

開啟終端機顯示的 `http://127.0.0.1:4200/`。修改已載入的教材後請重新整理；新增課程或圖片後請重新執行 `npm start`，重新產生教材資產。

## 更新教材

1. 直接修改儲存庫原本的 Markdown；不必改寫成 HTML。
2. 新增教材時，在[主 README](../Readme.md)「課程地圖」的編號清單加入 Markdown 連結，編號保持連續。
3. `npm run content` 自動依該清單產生目錄並複製教材與 `img/`。生成內容位於 `site/public/content/`，已加入 Git 忽略清單。
4. GitHub Pages 工作流程會在每次推送 `main` 時重新產生資產並部署。

「待補充」狀態同樣讀取自 README 清單，完成教材後移除對應的 `（待補充）`。一般新增課程不需要修改 Angular 模板或手動維護 JSON。

## Markdown 支援

- GitHub GFM 表格、刪除線、任務清單與一般 Markdown。
- `NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION` 提示區塊，含內部的 Markdown。
- Mermaid 圖表在需要時才載入，圖表失敗時仍保留原始碼與複製功能。
- 程式碼保留縮排、HTML 標籤與 PowerShell 反引號。複製來源是 Markdown 程式碼文字，而非畫面中的 HTML 或按鈕。
- 教材中的圖片依來源 Markdown 的路徑解析；儲存庫根路徑會加上 Pages 子目錄。教材 Markdown 連結轉成站內課程路由。
- 採用 hash 路由，直接開啟課程網址或重新整理不依賴 GitHub Pages 的伺服器轉址。

## 驗證

```bash
npm run check
npm run build:pages
npx playwright install chromium
npm run test:e2e
```

瀏覽器測試會使用真正的 `/Teaching-Assistant/` 子路徑，檢查全部課程、所有程式碼複製按鈕、圖表、圖片、手機目錄與錯誤狀態。

## GitHub Pages 部署

1. 將這次修改提交並推送到 `main`。
2. 在 GitHub 儲存庫的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
3. 執行 [Pages workflow](../.github/workflows/pages.yml)，或等待推送觸發。
4. 部署完成後，使用 GitHub 回傳的 Pages URL。此儲存庫預期網址為 `https://jerry-ya-ya.github.io/Teaching-Assistant/`。

工作流程從 `configure-pages` 取得 `base_path`，因此部署時不會把圖片與程式檔錯誤地指向網域根目錄。`npm run build:pages` 則提供目前儲存庫名稱的本地驗證建置。

如需預覽正式建置：

```bash
npm run build:pages
node scripts/preview.mjs
```

開啟 `http://127.0.0.1:4173/Teaching-Assistant/`。
