# A. 快速診斷：這個 harness 的前三大失血點

> 這份是「為什麼要有這套制度」的證據檔。其他制度檔（model-dispatch / judgment / templates）都會回頭引用這裡的問題編號。
> 觀察對象：Bobibo_tattoo 專案 + Claude Code harness。寫於 2026-07-04，由 Opus 4.8 session 建立。
> 讀者：未來較弱模型（Sonnet / Haiku 等）。看到問題就照「修法」做，不用重新診斷。

---

## 判準：什麼叫「失血」
- **漏 token**：把 token 花在不推進任務的地方（重複探索、讀巨檔、主線塞長輸出）。
- **失焦**：模型走錯方向、做多餘的事、或忘記使用者真正要的。
- **出錯**：改壞既有行為、踩到這個 repo 特有的陷阱。

同一個根因常同時造成三種失血，下面按「最痛的那一種」歸類，但會標出它還連帶影響哪些。

---

## 🩸 最漏 token — 第 1 名：主對話當「下場指揮官」，親自掃 repo / 讀巨檔

**症狀**：主模型自己 `grep -r`、自己一個個 `Read` 檔案、自己讀 `package-lock.json`(190KB) 或 `tsconfig.tsbuildinfo`(264KB) 這種產生檔。這些內容全部灌進主對話 context，之後每一輪都要重新載入付費。

**證據**：這個 repo 裡 `package-lock.json` 190KB、`tsconfig.tsbuildinfo` 264KB、`local.db` 36KB — 只要不小心 `Read` 或 `cat` 一次，主線就腫一大塊。

**修法（可直接執行）**：
1. 大量讀取 / 全庫搜尋 → 一律派 `Explore` 或 `general-purpose` subagent，主線只收「結論 + 檔案:行號」。判準見 [model-dispatch.md](model-dispatch.md) 的「指揮官不下場」。
2. 永遠不要 `Read` / `cat` 這些檔：`package-lock.json`、`*.tsbuildinfo`、`local.db`、`node_modules/**`、`.next/**`。要看依賴版本就 `Read` `package.json`；要查某套件是否安裝用 `grep '"套件名"' package.json`。
3. 讀單一檔案時，若已知只要某段，用 `Read` 的 `offset`/`limit`，不要整檔吞。
- **連帶**：也影響失焦（context 被雜訊淹沒）。

---

## 🩸 最漏 token — 第 2 名（並列根因）：沒有 CLAUDE.md，每個 session 冷啟動重新發現同樣的事實

**症狀**：在這個 session 之前，repo 根目錄**沒有** `CLAUDE.md`。代表每一個新 session 都要重新問「這是什麼 stack？怎麼跑？部署在哪？有沒有測試？」，重新讀 package.json、翻目錄、猜慣例 — 每次都燒同一批 token，還每次結論可能不一樣。

**修法**：本 session 已建立 [/CLAUDE.md](../../CLAUDE.md)（精簡路由）＋ [project-facts.md](project-facts.md)（專案事實）。未來模型**先讀這兩個**再動手，不要重新探索已寫下的事實。要新增穩定事實時寫進 project-facts.md，別讓它只留在某個 session 的記憶裡。
- **連帶**：失焦、出錯（見下面的部署陷阱）。

---

## 🧭 最容易失焦 — 第 1 名：雙部署目標陷阱（Cloudflare edge 現況 vs Vercel 殘留）

> ⚠️ 這一段本身就是「照舊記憶動手會出錯」的活教材。寫這份診斷時，我一開始照 auto-memory 寫成「正式站在 Vercel、用 Node runtime、不要改 edge」。實際核對程式碼後發現**完全相反**：有一個 commit `9aa2034 遷移至 Cloudflare Pages：edge runtime + 遠端 Turso + R2`，現在**所有** route/layout 都是 `export const runtime = 'edge'`，`lib/db.ts` 用的是 `@libsql/client/web`（edge 版）。記憶已經過期，我差點把「不要用 edge」寫成硬規則 —— 那會反過來害人。

**現況（已用程式碼核對，2026-07-04）**：
- 程式碼是**全 edge runtime**（`grep -rn "runtime = 'edge'" app` 到處都是）。
- DB 用 `@libsql/client/web`（edge 相容）+ 遠端 Turso；本機 dev 仍可用 `file:local.db`。
- Cloudflare 路線就緒：`wrangler.toml`（`pages_build_output_dir = ".vercel/output/static"`）、`package.json` 的 `pages:build`/`preview`/`deploy`、`@cloudflare/next-on-pages` 依賴。
- **但** `.vercel/project.json` 也還在（Vercel 專案 `bobibo-ink`，nodeVersion 24.x）。所以 repo 裡 Cloudflare 與 Vercel 的痕跡**同時存在**。

**誠實標註（harness 極限）**：光看靜態檔案**無法 100% 確定現在的正式站到底掛在 Cloudflare 還是 Vercel** —— 兩邊的 config 都在。最新的架構決定（commit 9aa2034）是「遷移到 Cloudflare Pages」，程式碼也全面 edge 化，指向 Cloudflare；但 Vercel 專案檔沒刪。這種事**不能用猜的**。

**修法（硬規則）**：
1. **不要**把任何 route 從 `runtime = 'edge'` 改回 Node runtime，也不要引入只在 Node 跑的 API（如 `fs`、Node 版 `@aws-sdk` 用法）—— 現行架構是 edge，改回去會壞。要動資料層先 `Read` `lib/db.ts`。
2. 要「部署 / 上線」前，**先問使用者現在的正式站是 Cloudflare Pages 還是 Vercel**，不要自己跑 `npm run deploy`（Cloudflare 路線）也不要假設 push main 就會自動部署到某處。判準見 [judgment.md](judgment.md)「何時該停下來問」。
3. 這是「會變且靠猜會出大錯」的事實 —— 一旦使用者確認了現況，把答案寫進 [project-facts.md](project-facts.md) 的「部署」欄，未來就不用再問。
- **連帶**：出錯（改壞正式行為）、漏 token（每次重新調查）。

---

## 🧭 最容易失焦 — 第 2 名：多步驟任務沒有清單，做到一半漂走

**症狀**：使用者一次給一串需求（像這個 session 的 A–G），模型做著做著漏掉其中幾項，或反覆改同一處。

**修法**：
1. 任務有 3 個以上可交付項時，開場先列清單（TaskCreate 或回覆裡的 checklist），每完成一項立刻標記。
2. 「隨做隨寫」：每完成一個產出**立刻落檔**，不要囤在腦裡等最後一起交 — session 隨時可能中斷，落了檔的才算數。
3. 判準見 [judgment.md](judgment.md)「何時算真的完成」。

---

## ⚠️ 最容易出錯 — 第 1 名：記憶會過期，照著舊事實動手

**症狀**：auto-memory 裡寫「Next.js 14」，實際 `package.json` 是 **Next 15**（`next@^15.5.9`）。記憶也說 stack 用 Turso，但本機 dev 其實是 libSQL **檔案 DB**（`file:local.db`）。模型若把記憶當現況直接動手，會基於錯的版本 / 錯的執行環境做決定。

**修法**：
1. 記憶（含 `<system-reminder>` 裡回放的記憶）是「當時的觀察」，不是現況。**凡是要據以動手的具體事實**（版本、檔名、指令、環境）先用 `Read` / `grep` 對現有程式碼**核對一次**再用。
2. 版本、指令、部署設定這類「會變」的事實，以 repo 現況為準，記憶只當線索。
3. 核對成本很低（一次 grep），踩錯成本很高，一律核對。判準見 [judgment.md](judgment.md)「方向錯了的訊號」。

---

## ⚠️ 最容易出錯 — 第 2 名：DB 雙模式與 seed fallback 很脆弱

**症狀**：資料層有三種狀態 — 本機檔案 DB、遠端 Turso、以及 `hasDb=false` 時 fallback 到打包的 `lib/seed-data.json`（正式站唯讀就是靠這個）。改動 `lib/db.ts` 或資料存取碼時，容易破壞 fallback，讓正式站白畫面。

**修法**：
1. 改 `lib/db.ts` / 資料存取相關碼前，先 `Read` 該檔看清楚 `hasDb` 分支與延遲初始化邏輯，別假設「一定有 DB」。
2. 改完**一定**跑驗收關卡：`npm run typecheck` → `npm run build` → preview 實看。關卡定義見 [judgment.md](judgment.md)「品質底線」。
3. 不確定 fallback 是否還完整 → 停下來問，別猜。

---

## ⚠️ 最容易出錯 — 第 3 名：機密外洩 / 誤 commit

**症狀**：`.env.local` 有真實值（`ADMIN_PASSWORD` 等），記憶裡也寫著開發密碼。風險：把密碼打進聊天/commit message、或 `git add .` 把不該進版控的東西送上去。

**修法**：
1. 不要在回覆或 commit message 裡覆述任何密碼 / token / secret 值。
2. commit 前用 `git status` 看清楚要加什麼，別用 `git add -A` 掃全部；確認 `.env*.local`、`local.db`、`public/uploads` 都在 `.gitignore`（目前是）。
3. 只有使用者明確要求才 commit / push（見 [judgment.md](judgment.md)）。

---

## 誠實標註：這份診斷補得了什麼、補不了什麼
- **補得了**（靠制度）：重複探索、讀巨檔、部署走錯、忘記步驟、照舊記憶動手 — 這些是流程問題，有明確判準就能擋。
- **補不了**（要升級模型或問人）：這個 repo 是刺青師個人網站，很多是**視覺品味**判斷（版面美感、動效節奏、文案語氣）。這類沒有 rubric 能完全取代人眼。遇到時的做法見 [judgment.md](judgment.md)「品味題怎麼辦」：先做可驗證的部分，品味部分用 preview 截圖給使用者選，不要假裝自己判得準。
