# 美甲預約平台（Nail Salon Booking SaaS Template）

多品牌美甲沙龍線上預約系統範本。每位商家擁有自己的子網域（`{slug}.{平台網域}`），可自行設定分店、服務項目、美甲師與網站外觀；顧客則能透過固定的預約流程（分店 → 服務 → 美甲師 → 時段 → 確認）送出預約請求，由商家確認後完成預約。

## 技術棧

- **框架**：Next.js 16（App Router、Server Actions、Turbopack）
- **資料庫**：PostgreSQL，透過 Prisma ORM（Prisma 7，`prisma-client` generator + `@prisma/adapter-pg`）
- **本地開發資料庫**：`prisma dev`（Prisma 內建的本地 Postgres，無需自行安裝 Postgres 或 Docker）
- **UI**：Tailwind CSS v4 + shadcn/ui（底層為 Base UI，`asChild` 對應寫法為 `render` prop）
- **檔案上傳**：本地磁碟儲存於 `public/uploads/`（標誌、貼圖、字型、背景圖片）
- **貼圖拖曳/縮放編輯器**：react-rnd

## 前置需求

- Node.js 20+（建議使用 [nvm](https://github.com/nvm-sh/nvm) 安裝）
- 不需要另外安裝 PostgreSQL 或 Docker —— `prisma dev` 會啟動一個本地的 Postgres 執行個體

## 開始使用

```bash
# 安裝相依套件
npm install

# 啟動本地 Postgres（保持在背景執行，或另開一個終端機視窗）
npx prisma dev

# 另開一個終端機，套用資料庫結構
npx prisma migrate dev

# （選用）建立示範商家資料
npx prisma db seed

# 啟動開發伺服器
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

### 示範帳號（執行 `prisma db seed` 後）

- 商家後台：`http://localhost:3000/login` → `demo@nailbook.tw` / `demo12345`
- 示範商店前台：`http://localhost:3000/s/demo`
- 顧客會員（此商店）：`customer@example.com` / `customer1234`

示範資料包含 3 間分店，分別示範三種美甲師指定方式（顧客自選／系統隨機／依專長自動指派），以及待確認、已確認、已取消等不同狀態的預約紀錄。

## 多租戶網址規則

- **正式環境**：`{slug}.{平台網域}` 會由 `src/proxy.ts`（Next.js 的 middleware/proxy 慣例）改寫導向 `/s/{slug}/...`。平台網域透過環境變數 `NEXT_PUBLIC_PLATFORM_DOMAIN` 設定。
- **本地開發**：直接以路徑存取，例如 `http://localhost:3000/s/{slug}`，不需要修改 `/etc/hosts` 或設定萬用子網域。
- **商家後台**（`/admin/...`）與註冊/登入頁面固定在平台根網域，不含 slug。

## 專案結構重點

```
prisma/schema.prisma        資料模型
prisma/seed.ts               示範資料
src/proxy.ts                 子網域改寫（正式環境）
src/lib/booking/slots.ts     動態時段計算引擎
src/lib/booking/create-booking.ts   預約建立（交易內重新檢查可預約性、自動指派美甲師）
src/app/(auth)/...           商家註冊／登入／驗證信箱／忘記密碼
src/app/onboarding/...       商家開店流程（選網址代稱、店名）
src/app/admin/...            商家後台（分店／服務／美甲師／預約／商店設定／外觀設定）
src/app/s/[slug]/...         顧客前台（固定預約流程 + 會員專區）
```

## 環境變數

參考 `.env.example`。本地開發時 `.env` 已由 `prisma init` 自動產生並指向 `prisma dev` 的本地資料庫。

- `DATABASE_URL` / `SHADOW_DATABASE_URL`：資料庫連線字串
- `NEXT_PUBLIC_APP_URL`：寄送驗證信／重設密碼信時組合連結用
- `NEXT_PUBLIC_PLATFORM_DOMAIN`：正式環境的平台網域，用於子網域判斷與網址代稱預覽

## 電子郵件

本範本未串接真實寄信服務。驗證信與重設密碼信會印在伺服器主控台，並寫入 `.data/emails.log`（JSON Lines 格式），方便本地測試時直接複製連結使用。正式上線前請在 `src/lib/email.ts` 串接真實的寄信服務（如 Resend、SMTP）。

## 訂金 / 線上付款

`Shop.depositRequired` 為商家可開關的設定；開啟後，顧客送出預約前需勾選確認訂金說明。實際金流串接為預留擴充點（`src/app/s/[slug]/book/[branchId]/[serviceId]/confirm/`），本範本不含真實金流。

## 建置

```bash
npm run build
npm run start
```

## 資料庫指令

```bash
npx prisma studio       # 圖形化檢視/編輯資料
npx prisma migrate dev  # 建立/套用新的 migration
npx prisma db seed      # 重新執行示範資料（會先清除既有的示範商家）
npx prisma dev ls       # 查看本地 Postgres 執行狀態
```
