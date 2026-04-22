# PROMPT – PHÁT TRIỂN BACK-END ZALO MINI APP
## UBND Phường Tùng Thiện, Thành phố Hà Nội

---

> **Hướng dẫn sử dụng prompt này:**
> Tài liệu này là đặc tả back-end đầy đủ. Mỗi phần (Section) là một đơn vị công việc độc lập. Khi làm việc từng bước, copy đúng section cần làm và cung cấp cho AI cùng với code đang có. AI không được tự suy diễn thêm tính năng ngoài những gì được mô tả.

---

## PHẦN 0 – BỐI CẢNH VÀ QUY TẮC CHUNG

### 0.1. Mô tả hệ thống

Back-end phục vụ Zalo Mini App của UBND phường Tùng Thiện. Đây là hệ thống **monolith đơn giản**, chạy trên **1 VPS duy nhất** (Ubuntu 22.04 LTS, 2 vCPU, 4 GB RAM). Mục tiêu: tối giản – đủ dùng – dễ bảo trì bởi 1 người.

Hai luồng chính cần xử lý:
1. **REST API** → Phục vụ Mini App front-end (người dân)
2. **Zalo OA Webhook** → Nhận phản hồi từ cán bộ phường qua OA Manager

Cán bộ phường **không có admin panel riêng**. Mọi thao tác quản trị của cán bộ đều thực hiện qua **Zalo OA Manager** (oa.zalo.me). Back-end chỉ cần gửi thông báo đến OA Manager và nhận phản hồi về qua Webhook.

### 0.2. Tech stack bắt buộc

```
Runtime:     Node.js 20 LTS
Framework:   Express.js (KHÔNG dùng NestJS, Fastify, Hapi)
Ngôn ngữ:    TypeScript (strict mode)
ORM:         Prisma (KHÔNG dùng TypeORM, Sequelize, Knex)
Database:    PostgreSQL 16
Upload ảnh:  Cloudinary SDK (gói free tier)
Xác thực:    JWT (jsonwebtoken) + xác minh Zalo Access Token
Validation:  zod
Logging:     winston
Job scheduler: node-cron
HTTP security: helmet, express-rate-limit, cors
Process manager (production): PM2
Reverse proxy (production): Nginx
SSL: Let's Encrypt (certbot)
```

### 0.3. Cấu trúc thư mục chuẩn

```
backend/
├── src/
│   ├── app.ts                   # Khởi tạo Express app, gắn middleware, routes
│   ├── server.ts                # Entry point: listen port, kết nối DB
│   │
│   ├── routes/                  # Chỉ định nghĩa route + gọi controller
│   │   ├── auth.routes.ts
│   │   ├── feedback.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── rating.routes.ts
│   │   ├── news.routes.ts
│   │   ├── events.routes.ts
│   │   ├── heritage.routes.ts
│   │   ├── upload.routes.ts
│   │   └── webhook.routes.ts
│   │
│   ├── controllers/             # Nhận req/res, gọi service, trả response
│   │   ├── auth.controller.ts
│   │   ├── feedback.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── rating.controller.ts
│   │   ├── news.controller.ts
│   │   ├── events.controller.ts
│   │   ├── heritage.controller.ts
│   │   ├── upload.controller.ts
│   │   └── webhook.controller.ts
│   │
│   ├── services/                # Logic nghiệp vụ thuần, không biết req/res
│   │   ├── auth.service.ts
│   │   ├── feedback.service.ts
│   │   ├── booking.service.ts
│   │   ├── rating.service.ts
│   │   ├── news.service.ts      # Đọc từ Google Sheets
│   │   ├── events.service.ts    # Đọc từ Google Sheets
│   │   ├── heritage.service.ts  # Đọc từ Google Sheets
│   │   ├── zaloOA.service.ts    # Gửi tin nhắn vào OA Manager
│   │   ├── zns.service.ts       # Gửi ZNS đến người dân
│   │   └── googleSheets.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Xác minh JWT
│   │   ├── validate.middleware.ts  # Validate req body bằng zod schema
│   │   ├── rateLimit.middleware.ts
│   │   └── errorHandler.middleware.ts  # Global error handler
│   │
│   ├── jobs/                    # node-cron jobs
│   │   └── reminderJob.ts       # Nhắc lịch hẹn tự động
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces dùng chung
│   │
│   └── utils/
│       ├── logger.ts            # Winston logger instance
│       ├── generateCode.ts      # Tạo mã PA-XXXX, LH-XXXX
│       └── zaloSignature.ts     # Xác minh chữ ký Webhook Zalo
│
├── prisma/
│   └── schema.prisma            # Prisma schema (copy từ src/prisma)
├── .env
├── .env.example
├── ecosystem.config.js          # PM2 config
├── package.json
└── tsconfig.json
```

### 0.4. Quy tắc bắt buộc – AI PHẢI tuân thủ

1. **KHÔNG** tự thêm bất kỳ endpoint, model, hoặc tính năng nào ngoài những gì được mô tả trong prompt này.
2. **KHÔNG** dùng `any` trong TypeScript. Nếu không biết type, dùng `unknown` rồi narrow down.
3. **LUÔN** validate request body bằng `zod` trước khi xử lý logic nghiệp vụ.
4. **LUÔN** xác minh JWT trong mọi endpoint yêu cầu đăng nhập (trừ `/health`, `/webhook`).
5. **LUÔN** xử lý lỗi qua `next(error)` – không dùng `try/catch` trả response trực tiếp trong controller.
6. **KHÔNG** lưu `accessToken` của Zalo vào database. Token này là tạm thời, chỉ dùng để xác minh danh tính.
7. **KHÔNG** hard-code bất kỳ credential nào (OA Secret, App Secret, Cloudinary key). Tất cả lấy từ `process.env`.
8. **KHÔNG** tự build admin panel hay giao diện quản trị – cán bộ dùng OA Manager.
9. Mọi response thành công đều theo format: `{ success: true, data: <payload> }`.
10. Mọi response lỗi đều theo format: `{ success: false, error: { code: string, message: string } }`.
11. **KHÔNG** expose stack trace trong production (kiểm tra `NODE_ENV`).
12. Tất cả timestamp lưu và trả về theo **UTC ISO 8601** (`2026-05-20T08:00:00.000Z`).

### 0.5. Biến môi trường (.env.example)

```env
# Server
NODE_ENV=development
PORT=3000
APP_URL=https://api.tungtthien-phuong.gov.vn

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tungtthien_db

# JWT
JWT_SECRET=<random-256-bit-string>
JWT_EXPIRES_IN=7d

# Zalo App (lấy từ developers.zalo.me)
ZALO_APP_ID=<app_id>
ZALO_APP_SECRET=<app_secret>

# Zalo OA (lấy từ oa.zalo.me)
ZALO_OA_ID=<oa_id>
ZALO_OA_ACCESS_TOKEN=<oa_access_token>
ZALO_OA_SECRET_KEY=<oa_secret_key>    # Dùng để xác minh chữ ký Webhook

# ZNS
ZALO_ZNS_OA_TOKEN=<zns_access_token>
# Template IDs (đăng ký trước tại business.zalo.me)
ZNS_TEMPLATE_BOOKING_RECEIVED=<template_id>
ZNS_TEMPLATE_BOOKING_CONFIRMED=<template_id>
ZNS_TEMPLATE_BOOKING_REJECTED=<template_id>
ZNS_TEMPLATE_BOOKING_REMINDER=<template_id>
ZNS_TEMPLATE_FEEDBACK_RECEIVED=<template_id>
ZNS_TEMPLATE_FEEDBACK_UPDATED=<template_id>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Google Sheets (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service_account_email>
GOOGLE_PRIVATE_KEY=<private_key_multiline>
GOOGLE_SHEETS_NEWS_ID=<spreadsheet_id>
GOOGLE_SHEETS_EVENTS_ID=<spreadsheet_id>
GOOGLE_SHEETS_HERITAGE_ID=<spreadsheet_id>

# Cache TTL (giây)
CACHE_TTL_SHEETS=300   # 5 phút

# Rate limit
RATE_LIMIT_WINDOW_MS=900000   # 15 phút
RATE_LIMIT_MAX_REQUESTS=100
```

### 0.6. Format response chuẩn

```typescript
// types/index.ts

// ✅ Response thành công
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

// ✅ Response danh sách có phân trang
export interface ApiList<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ❌ Response lỗi
export interface ApiError {
  success: false;
  error: {
    code: string;    // VD: "UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR"
    message: string; // Message tiếng Việt cho user
  };
}
```

---

## PHẦN 1 – KHỞI TẠO DỰ ÁN VÀ CẤU HÌNH

### 1.1. package.json dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "axios": "^1.x",
    "bcryptjs": "^2.x",
    "cloudinary": "^2.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "express": "^4.x",
    "express-rate-limit": "^7.x",
    "googleapis": "^140.x",
    "helmet": "^7.x",
    "jsonwebtoken": "^9.x",
    "multer": "^1.x",
    "node-cron": "^3.x",
    "winston": "^3.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.x",
    "@types/cors": "^2.x",
    "@types/express": "^4.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/multer": "^1.x",
    "@types/node": "^20.x",
    "@types/node-cron": "^3.x",
    "prisma": "^5.x",
    "ts-node": "^10.x",
    "ts-node-dev": "^2.x",
    "typescript": "^5.x"
  },
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio"
  }
}
```

### 1.2. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3. src/utils/logger.ts

```typescript
// Tạo Winston logger với 2 transport:
// 1. Console: dùng trong development, format colorize + simple
// 2. File: dùng trong production
//    - logs/error.log: chỉ level error
//    - logs/combined.log: tất cả level
// Log format: JSON với timestamp ISO 8601
// Export: logger (default export)
// Sử dụng: logger.info('message', { meta }) | logger.error('message', { error })
```

### 1.4. src/app.ts

```typescript
// Tạo Express app với thứ tự middleware chính xác sau:
// 1. helmet() – bảo vệ HTTP headers
// 2. cors({ origin: process.env.APP_URL hoặc '*' trong dev })
// 3. express.json({ limit: '10mb' }) – parse JSON body
// 4. express.urlencoded({ extended: true })
// 5. Rate limiter (import từ middleware/rateLimit.middleware.ts)
// 6. Request logging: mỗi request log method + url + status + thời gian xử lý
// 7. Routes:
//    GET  /health          → trả { status: 'ok', timestamp: new Date().toISOString() }
//    POST /webhook/zalo    → webhook.routes.ts  (KHÔNG có auth middleware)
//    /api/auth             → auth.routes.ts
//    /api/feedbacks        → feedback.routes.ts (có auth middleware)
//    /api/bookings         → booking.routes.ts  (có auth middleware)
//    /api/ratings          → rating.routes.ts   (có auth middleware)
//    /api/news             → news.routes.ts     (KHÔNG có auth middleware – public)
//    /api/events           → events.routes.ts   (KHÔNG có auth middleware – public)
//    /api/heritage         → heritage.routes.ts (KHÔNG có auth middleware – public)
//    /api/upload           → upload.routes.ts   (có auth middleware)
// 8. 404 handler: trả ApiError với code "NOT_FOUND"
// 9. Global error handler: errorHandler.middleware.ts
```

### 1.5. src/server.ts

```typescript
// Entry point:
// 1. Load dotenv
// 2. Kết nối Prisma (prismaClient.$connect())
// 3. Khởi động node-cron jobs (import từ jobs/reminderJob.ts)
// 4. app.listen(PORT)
// 5. Xử lý SIGTERM / SIGINT gracefully: đóng Prisma + server trước khi thoát
// Log: "Server running on port X in Y environment"
```

---

## PHẦN 2 – PRISMA SCHEMA (DATABASE)

### Yêu cầu

Tạo file `prisma/schema.prisma` với đầy đủ các model sau. **KHÔNG thêm model ngoài danh sách này.**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================
// MODEL: User – người dân đã đăng nhập qua Zalo
// =============================================
model User {
  id          String   @id @default(cuid())
  zaloId      String   @unique           // userId từ Zalo platform
  displayName String                     // Tên Zalo của người dùng
  phoneToken  String?                    // Token dùng để lấy số ĐT (không lưu số ĐT trực tiếp)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  feedbacks   Feedback[]
  bookings    Booking[]
  ratings     Rating[]

  @@index([zaloId])
}

// =============================================
// MODEL: Feedback – Phản ánh hiện trường
// =============================================
model Feedback {
  id          String         @id @default(cuid())
  code        String         @unique           // VD: "PA-2026-0042"
  userId      String
  user        User           @relation(fields: [userId], references: [id])

  title       String
  category    FeedbackCategory
  description String         @db.Text
  imageUrls   String[]       // Mảng URL ảnh từ Cloudinary
  latitude    Float?
  longitude   Float?
  address     String?

  status      FeedbackStatus @default(PENDING)
  response    String?        @db.Text         // Phản hồi từ cán bộ
  respondedAt DateTime?

  // Thông tin tin nhắn OA đã gửi (dùng để mapping khi nhận Webhook reply)
  oaMessageId String?        // Message ID Zalo OA gán cho tin nhắn đã gửi vào OA Manager

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum FeedbackStatus {
  PENDING       // Đang tiếp nhận
  PROCESSING    // Đang xử lý
  TRANSFERRED   // Đã chuyển đơn vị
  RESOLVED      // Đã giải quyết
}

enum FeedbackCategory {
  HA_TANG       // Hạ tầng – Đường sá
  VE_SINH       // Vệ sinh môi trường
  TRAT_TU       // Trật tự đô thị
  AN_NINH       // An ninh – Trật tự
  KHAC          // Vấn đề khác
}

// =============================================
// MODEL: Booking – Đặt lịch tiếp dân
// =============================================
model Booking {
  id            String        @id @default(cuid())
  code          String        @unique           // VD: "LH-2026-0015"
  userId        String
  user          User          @relation(fields: [userId], references: [id])

  field         BookingField
  preferredDate DateTime                        // Ngày mong muốn (UTC)
  preferredTime String                          // "08:00" (chuỗi HH:mm)
  confirmedDate DateTime?                       // Ngày đã xác nhận chính xác
  confirmedTime String?                         // Giờ đã xác nhận chính xác
  description   String        @db.Text
  contactName   String                          // Họ tên người đến

  status        BookingStatus @default(PENDING)
  rejectionReason   String?   @db.Text
  rescheduledNote   String?   @db.Text

  // Tracking nhắc lịch
  reminder24hSent   Boolean   @default(false)
  reminder1hSent    Boolean   @default(false)

  // Mapping Webhook
  oaMessageId   String?       // Message ID tin nhắn đã gửi vào OA Manager

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@index([confirmedDate])
}

enum BookingStatus {
  PENDING       // Chờ xác nhận
  CONFIRMED     // Đã xác nhận
  REJECTED      // Từ chối
  RESCHEDULED   // Đã dời lịch
  COMPLETED     // Đã hoàn thành
  CANCELLED     // Người dân hủy
}

enum BookingField {
  HO_TICH       // Hộ tịch
  CU_TRU        // Cư trú
  CHUNG_THUC    // Chứng thực
  DAT_DAI       // Đất đai – Xây dựng
  XA_HOI        // Chính sách xã hội
  KHAC          // Vấn đề khác
}

// =============================================
// MODEL: Rating – Đánh giá dịch vụ công
// =============================================
model Rating {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  procedure       String                // Lĩnh vực thủ tục đã sử dụng
  attitudeScore   Int                   // 1–5: thái độ phục vụ
  timelinessScore Int                   // 1–5: thời gian giải quyết
  outcomeScore    Int                   // 1–5: kết quả
  averageScore    Float                 // Tính tự động: (attitude+timeliness+outcome)/3
  comment         String?  @db.Text

  // Flag: đã gửi cảnh báo vào OA Manager chưa (cho rating thấp)
  alertSent       Boolean  @default(false)

  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

### Migration

```bash
# Sau khi viết xong schema, chạy:
npx prisma migrate dev --name init
npx prisma generate
```

---

## PHẦN 3 – XÁC THỰC VÀ PHÂN QUYỀN

### 3.1. Luồng xác thực

```
1. Front-end (Zalo Mini App) lấy accessToken từ zmp-sdk.getAccessToken()
2. Front-end gửi POST /api/auth/login với body: { accessToken: string }
3. Back-end gọi Zalo API để xác minh accessToken và lấy thông tin user:
   GET https://graph.zalo.me/v2.0/me?fields=id,name,picture
   Headers: { access_token: <accessToken> }
4. Back-end upsert user vào PostgreSQL (tạo mới nếu chưa có, cập nhật tên nếu đã có)
5. Back-end phát hành JWT riêng (payload: { userId, zaloId })
6. Front-end lưu JWT trong Zustand store (KHÔNG dùng localStorage)
7. Mọi request tiếp theo gửi JWT trong header: Authorization: Bearer <jwt>
```

### 3.2. src/services/auth.service.ts

```typescript
// Hàm loginWithZalo(accessToken: string): Promise<{ user: User, token: string }>
//
// Bước 1: Gọi Zalo Graph API để lấy user info
//   URL: https://graph.zalo.me/v2.0/me?fields=id,name,picture
//   Header: { access_token: accessToken }
//   Nếu Zalo trả lỗi → throw Error('INVALID_ZALO_TOKEN')
//
// Bước 2: Upsert user trong DB
//   prisma.user.upsert({
//     where: { zaloId: zaloResponse.id },
//     update: { displayName: zaloResponse.name },
//     create: { zaloId: zaloResponse.id, displayName: zaloResponse.name }
//   })
//
// Bước 3: Ký JWT
//   payload: { userId: user.id, zaloId: user.zaloId }
//   secret: process.env.JWT_SECRET
//   expiresIn: process.env.JWT_EXPIRES_IN (mặc định '7d')
//
// Return: { user, token }
```

### 3.3. src/middleware/auth.middleware.ts

```typescript
// Middleware: authenticateToken
// 1. Lấy token từ header Authorization: Bearer <token>
// 2. Nếu không có token → trả 401 { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' }
// 3. Verify JWT: jwt.verify(token, process.env.JWT_SECRET)
// 4. Nếu verify lỗi (expired, invalid) → trả 401 { code: 'TOKEN_INVALID' }
// 5. Gắn decoded payload vào req.user = { userId, zaloId }
// 6. Gọi next()
//
// Khai báo type extension:
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { userId: string; zaloId: string }
//     }
//   }
// }
```

### 3.4. src/routes/auth.routes.ts + src/controllers/auth.controller.ts

```
Route:
  POST /api/auth/login
    Body: { accessToken: string }
    Validation (zod): accessToken phải là string, không được rỗng
    Controller: gọi auth.service.loginWithZalo()
    Response 200: { success: true, data: { token: string, user: { id, zaloId, displayName } } }

  GET /api/auth/me   (cần auth middleware)
    Controller: lấy user từ req.user.userId, query DB, trả thông tin user
    Response 200: { success: true, data: { id, zaloId, displayName, createdAt } }
```

---

## PHẦN 4 – PHẢN ÁNH HIỆN TRƯỜNG

### 4.1. Luồng nghiệp vụ đầy đủ

```
[A] Người dân tạo phản ánh:
    POST /api/feedbacks
    ↓
    Service: Tạo Feedback trong DB (status=PENDING, tạo code PA-YYYY-NNNN)
    ↓
    Service: Gọi zaloOA.service.sendFeedbackToOA(feedback, user)
             → Gửi tin nhắn vào hộp thư OA Manager
             → Lưu oaMessageId vào Feedback record
    ↓
    Service: Gọi zns.service.sendZNS(user.phoneToken, ZNS_TEMPLATE_FEEDBACK_RECEIVED, data)
    ↓
    Response 201: { success: true, data: Feedback }

[B] Cán bộ reply trong OA Manager:
    Zalo gửi POST /webhook/zalo (event type: "user_send_text" hoặc "oa_send_text")
    ↓
    Webhook controller: xác minh chữ ký OA Secret Key
    ↓
    Webhook service: Parse nội dung reply, tìm Feedback theo oaMessageId
    ↓
    Xử lý lệnh trong tin nhắn reply (xem 4.4)
    ↓
    Cập nhật Feedback status trong DB
    ↓
    Gửi ZNS thông báo tiến độ đến người dân

[C] Người dân xem danh sách / chi tiết:
    GET /api/feedbacks/me
    GET /api/feedbacks/:id
```

### 4.2. src/utils/generateCode.ts

```typescript
// generateFeedbackCode(year: number, sequence: number): string
// → "PA-2026-0042" (sequence pad 4 chữ số)

// generateBookingCode(year: number, sequence: number): string
// → "LH-2026-0015"

// getNextSequence(prisma, model: 'feedback'|'booking', year: number): Promise<number>
// → Đếm số record trong năm hiện tại + 1
//   Ví dụ: prisma.feedback.count({ where: { createdAt: { gte: startOfYear, lt: endOfYear } } }) + 1
```

### 4.3. src/services/feedback.service.ts

```typescript
// Hàm createFeedback(userId: string, data: CreateFeedbackInput): Promise<Feedback>
//   - Validate: imageUrls max 3 items
//   - Gọi getNextSequence để tạo code
//   - prisma.feedback.create(...)
//   - Sau khi tạo xong: gọi zaloOA.service.sendFeedbackToOA() và zns.service.sendFeedbackReceived()
//   - Return feedback record đầy đủ

// Hàm getFeedbacksByUser(userId: string, filters: { status?, page, limit }): Promise<PaginatedResult<Feedback>>
//   - Query với where: { userId, status (nếu có) }
//   - Order: createdAt DESC
//   - Phân trang: skip = (page-1)*limit, take = limit
//   - Return { data, pagination }

// Hàm getFeedbackById(id: string, userId: string): Promise<Feedback | null>
//   - Query với where: { id, userId } (user chỉ xem feedback của mình)
//   - Return null nếu không tìm thấy

// Hàm updateFeedbackFromWebhook(oaMessageId: string, newStatus: FeedbackStatus, response: string): Promise<void>
//   - Tìm feedback theo oaMessageId
//   - Nếu không tìm thấy → log warning, return (không throw)
//   - Update status + response + respondedAt
//   - Gọi zns.service.sendFeedbackUpdated() để thông báo cho người dân

interface CreateFeedbackInput {
  title: string;
  category: FeedbackCategory;
  description: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}
```

### 4.4. src/routes/feedback.routes.ts + controllers

```
Tất cả routes đều cần auth middleware.

GET  /api/feedbacks/me
  Query params: status (optional), page (default:1), limit (default:10, max:20)
  Controller: gọi feedback.service.getFeedbacksByUser()
  Response: ApiList<Feedback>

GET  /api/feedbacks/:id
  Controller: gọi feedback.service.getFeedbackById()
  Nếu null → 404 { code: 'NOT_FOUND' }
  Response: ApiSuccess<Feedback>

POST /api/feedbacks
  Body validation (zod):
    title: string min(10) max(100)
    category: enum FeedbackCategory
    description: string min(20) max(1000)
    imageUrls: string array, max 3 items, mỗi item là URL hợp lệ
    latitude: number optional
    longitude: number optional
    address: string optional max(200)
  Controller: gọi feedback.service.createFeedback()
  Response 201: ApiSuccess<Feedback>
```

---

## PHẦN 5 – ĐẶT LỊCH TIẾP DÂN

### 5.1. Luồng nghiệp vụ đầy đủ

```
[A] Người dân tạo yêu cầu đặt lịch:
    POST /api/bookings
    ↓
    Validate: preferredDate phải là ngày tương lai, không phải thứ 7/chủ nhật
    ↓
    Service: Tạo Booking trong DB (status=PENDING, tạo code LH-YYYY-NNNN)
    ↓
    Service: Gọi zaloOA.service.sendBookingToOA(booking, user)
             → Gửi tin nhắn vào OA Manager với đầy đủ thông tin
             → Lưu oaMessageId
    ↓
    Service: Gọi zns.service.sendBookingReceived(user.phoneToken, booking)
    ↓
    Response 201: { success: true, data: Booking }

[B] Cán bộ reply trong OA Manager:
    POST /webhook/zalo
    ↓
    Webhook service: Parse reply, tìm Booking theo oaMessageId
    ↓
    Phân loại hành động từ nội dung reply (xem 5.2 – Webhook parsing)
    ↓
    Cập nhật Booking trong DB
    ↓
    Gửi ZNS kết quả đến người dân

[C] Cron job nhắc lịch:
    Chạy mỗi 30 phút
    Tìm booking status=CONFIRMED, reminder24hSent=false, confirmedDate trong 24h tới
    Gửi ZNS nhắc lịch + cập nhật reminder24hSent=true
    Tương tự cho reminder1hSent

[D] Người dân hủy lịch:
    DELETE /api/bookings/:id
    Chỉ cho phép hủy khi status IN (PENDING, CONFIRMED)
    Và confirmedDate > now() + 2 giờ (nếu đã confirmed)
    Cập nhật status=CANCELLED
```

### 5.2. Webhook parsing cho Booking (convention cán bộ reply)

```
Khi cán bộ muốn xác nhận lịch, họ reply vào tin nhắn gốc với format:
  "XAC_NHAN [ngày] [giờ]"
  VD: "XAC_NHAN 20/05/2026 09:00"

Khi từ chối:
  "TU_CHOI [lý do]"
  VD: "TU_CHOI Lịch đầy trong tuần này"

Khi dời lịch:
  "DOI_LICH [ngày] [giờ] [ghi chú]"
  VD: "DOI_LICH 22/05/2026 14:00 Do bận họp sáng"

Back-end parse nội dung reply theo prefix keyword trên.
Nếu reply không khớp bất kỳ format nào → bỏ qua (log INFO, không xử lý).
QUAN TRỌNG: Convention này phải được ghi rõ vào tài liệu hướng dẫn cho cán bộ.
```

### 5.3. src/services/booking.service.ts

```typescript
// Hàm createBooking(userId: string, data: CreateBookingInput): Promise<Booking>
//   - Validate business rules:
//     + preferredDate phải > now() (so sánh UTC)
//     + preferredDate không phải thứ 7 (6) hoặc chủ nhật (0) theo getDay()
//   - Tạo code LH-YYYY-NNNN
//   - prisma.booking.create(...)
//   - Gọi zaloOA.service.sendBookingToOA() và zns.service.sendBookingReceived()
//   - Return booking record

// Hàm getBookingsByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<Booking>>
//   - Order: createdAt DESC

// Hàm cancelBooking(id: string, userId: string): Promise<Booking>
//   - Tìm booking theo id + userId (phải là của chính họ)
//   - Validate: status phải IN (PENDING, CONFIRMED)
//   - Nếu CONFIRMED: kiểm tra confirmedDate > now() + 2h
//   - Update status=CANCELLED
//   - Return updated booking

// Hàm processWebhookReply(oaMessageId: string, replyText: string): Promise<void>
//   - Tìm booking theo oaMessageId
//   - Parse replyText theo convention (xem 5.2)
//   - Cập nhật DB tương ứng
//   - Gửi ZNS thông báo kết quả

interface CreateBookingInput {
  field: BookingField;
  preferredDate: string;  // ISO date string "YYYY-MM-DD"
  preferredTime: string;  // "HH:mm"
  description: string;
  contactName: string;
}
```

### 5.4. src/routes/booking.routes.ts + controllers

```
Tất cả routes đều cần auth middleware.

GET  /api/bookings/me
  Query: page (default:1), limit (default:10, max:20)
  Response: ApiList<Booking>

POST /api/bookings
  Body validation (zod):
    field: enum BookingField
    preferredDate: string regex /^\d{4}-\d{2}-\d{2}$/
    preferredTime: string regex /^\d{2}:\d{2}$/
    description: string min(10) max(500)
    contactName: string min(2) max(100)
  Response 201: ApiSuccess<Booking>

DELETE /api/bookings/:id
  Response 200: ApiSuccess<{ message: 'Đã hủy lịch hẹn thành công' }>
```

---

## PHẦN 6 – ĐÁNH GIÁ DỊCH VỤ CÔNG

### 6.1. Luồng nghiệp vụ

```
[A] Người dân gửi đánh giá:
    POST /api/ratings
    ↓
    Service: Tính averageScore = (attitudeScore + timelinessScore + outcomeScore) / 3
    ↓
    Service: prisma.rating.create(...)
    ↓
    Nếu averageScore <= 2: gọi zaloOA.service.sendLowRatingAlert(rating, user)
    ↓
    Response 201: { success: true, data: { id, averageScore } }

[B] Lấy tóm tắt thống kê công khai:
    GET /api/ratings/summary
    (KHÔNG cần auth – public endpoint)
    ↓
    Query: tổng số đánh giá, điểm trung bình, phân bổ theo sao
    ↓
    Cache trong bộ nhớ 10 phút (dùng biến module-level Map, không cần Redis)
```

### 6.2. src/services/rating.service.ts

```typescript
// Hàm createRating(userId: string, data: CreateRatingInput): Promise<Rating>
//   - Tính averageScore = (attitudeScore + timelinessScore + outcomeScore) / 3
//     Round 1 decimal: Math.round(avg * 10) / 10
//   - prisma.rating.create(...)
//   - Nếu averageScore <= 2:
//     + Gọi zaloOA.service.sendLowRatingAlert(rating, user)
//     + Update rating.alertSent = true
//   - Return rating

// Hàm getRatingSummary(): Promise<RatingSummary>
//   - Check in-memory cache (key: 'rating_summary', TTL: 10 phút)
//   - Nếu cache hit → return cached value
//   - Query DB:
//     + totalCount: prisma.rating.count()
//     + averageScore: prisma.rating.aggregate({ _avg: { averageScore: true } })
//     + distribution: GROUP BY ROUND(averageScore) (raw query hoặc prisma groupBy)
//       → [{ stars: 5, count: 78 }, { stars: 4, count: 32 }, ...]
//   - Lưu vào cache
//   - Return

interface CreateRatingInput {
  procedure: string;
  attitudeScore: number;    // 1-5
  timelinessScore: number;  // 1-5
  outcomeScore: number;     // 1-5
  comment?: string;
}

interface RatingSummary {
  averageScore: number;
  totalCount: number;
  distribution: { stars: number; count: number }[];
}
```

### 6.3. Routes

```
POST /api/ratings       (cần auth)
  Body validation (zod):
    procedure: string min(2) max(100)
    attitudeScore: number int min(1) max(5)
    timelinessScore: number int min(1) max(5)
    outcomeScore: number int min(1) max(5)
    comment: string optional max(500)
  Response 201: ApiSuccess<{ id: string, averageScore: number }>

GET /api/ratings/summary  (KHÔNG cần auth)
  Response 200: ApiSuccess<RatingSummary>
```

---

## PHẦN 7 – UPLOAD ẢNH (CLOUDINARY)

### 7.1. src/services/upload.service.ts (Cloudinary)

```typescript
// Khởi tạo Cloudinary:
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

// Hàm uploadImages(files: Express.Multer.File[]): Promise<string[]>
//   - Nhận mảng file (tối đa 3 files, mỗi file tối đa 5MB)
//   - Upload song song bằng Promise.all()
//   - Folder Cloudinary: "tung-thien/feedbacks"
//   - Transformation: { width: 1024, height: 1024, crop: 'limit', quality: 'auto' }
//   - Return mảng secure_url

// Hàm validateImageFiles(files: Express.Multer.File[]): void
//   - Throw Error nếu:
//     + files.length > 3
//     + Bất kỳ file nào size > 5MB (5 * 1024 * 1024 bytes)
//     + Bất kỳ file nào mimetype không bắt đầu bằng "image/"
```

### 7.2. Routes

```typescript
// Cấu hình multer:
//   storage: memoryStorage() (không lưu disk, pass thẳng lên Cloudinary)
//   limits: { fileSize: 5MB, files: 3 }
//   fileFilter: chỉ chấp nhận image/*

// POST /api/upload
//   Middleware: authenticateToken, multer({ ... }).array('files', 3)
//   Controller: gọi upload.service.uploadImages(req.files)
//   Response 200: ApiSuccess<{ urls: string[] }>
//   Lỗi file: 400 { code: 'INVALID_FILE', message: '...' }
```

---

## PHẦN 8 – NỘI DUNG TỪ GOOGLE SHEETS (NEWS, EVENTS, HERITAGE)

### 8.1. Chiến lược Google Sheets làm CMS

```
Cán bộ phường cập nhật nội dung trực tiếp vào 3 Google Sheets riêng biệt:
- Sheet Tin tức (GOOGLE_SHEETS_NEWS_ID)
- Sheet Sự kiện (GOOGLE_SHEETS_EVENTS_ID)
- Sheet Di tích (GOOGLE_SHEETS_HERITAGE_ID)

Back-end đọc data từ Sheets qua Google Sheets API v4, cache in-memory 5 phút.
KHÔNG dùng Redis. Cache bằng Map<string, { data, expiresAt }> trong module.
```

### 8.2. Cấu trúc Google Sheets (header hàng 1, data từ hàng 2)

**Sheet Tin tức – các cột theo thứ tự:**
```
A: id          (chuỗi unique, VD: "news-001")
B: title       (tiêu đề)
C: summary     (tóm tắt 1-2 câu)
D: content     (HTML hoặc Markdown – back-end không xử lý, trả nguyên)
E: thumbnailUrl (URL ảnh)
F: category    (tin-tuc | thong-bao | van-ban)
G: featured    (TRUE/FALSE – dùng cho banner trang chủ)
H: publishedAt (ISO datetime, VD: "2026-05-20T08:00:00.000Z")
I: isActive    (TRUE/FALSE – FALSE thì không trả về)
```

**Sheet Sự kiện:**
```
A: id
B: title
C: description (HTML)
D: thumbnailUrl
E: category    (van-hoa | the-thao | hanh-chinh | le-hoi)
F: location
G: startAt     (ISO datetime)
H: endAt       (ISO datetime)
I: organizer
J: contactInfo (optional)
K: isActive    (TRUE/FALSE)
```

**Sheet Di tích:**
```
A: id
B: name
C: type        (lich-su | kien-truc | van-hoa-phi-vat-the)
D: description (HTML)
E: imageUrls   (JSON array string: '["url1","url2"]')
F: address
G: rankingYear (số hoặc rỗng)
H: rankingLevel (cấp tỉnh | cấp quốc gia | rỗng)
I: conservationStatus (Tốt | Khá | Cần tu bổ)
J: openingHours (optional, VD: "7:00-17:00 hàng ngày")
K: contactInfo (optional)
L: isActive    (TRUE/FALSE)
```

### 8.3. src/services/googleSheets.service.ts

```typescript
// Khởi tạo Google Sheets API với Service Account:
//   const auth = new google.auth.GoogleAuth({
//     credentials: {
//       client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//       private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     },
//     scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
//   });
//   const sheets = google.sheets({ version: 'v4', auth });

// In-memory cache:
//   const cache = new Map<string, { data: unknown; expiresAt: number }>();

// Hàm getSheetData(sheetId: string, range: string): Promise<string[][]>
//   - Kiểm tra cache (key = sheetId + range)
//   - Nếu cache miss hoặc expired (> CACHE_TTL_SHEETS giây):
//     + sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range })
//     + Lưu vào cache với expiresAt = Date.now() + TTL * 1000
//   - Return values (bỏ hàng đầu tiên là header)

// Hàm parseNewsRow(row: string[]): NewsItem | null
// Hàm parseEventRow(row: string[]): EventItem | null
// Hàm parseHeritageRow(row: string[]): HeritageItem | null
//   - Parse từng cột theo cấu trúc Sheet
//   - Return null nếu isActive = "FALSE" hoặc thiếu field bắt buộc
//   - Bọc trong try/catch, nếu lỗi log warning và return null
```

### 8.4. src/services/news.service.ts

```typescript
// Hàm getAllNews(filters: { category?, featured?, page, limit }): Promise<PaginatedResult<NewsItem>>
//   - Gọi googleSheets.service.getSheetData() để lấy toàn bộ rows
//   - Parse từng row, lọc null
//   - Filter theo category nếu có
//   - Filter theo featured nếu có (featured = "TRUE")
//   - Sort: publishedAt DESC
//   - Phân trang thủ công (slice)
//   - Return { data, pagination }

// Hàm getNewsById(id: string): Promise<NewsItem | null>
//   - Lấy toàn bộ, tìm theo id
```

### 8.5. Routes – News, Events, Heritage

```
Tất cả routes dưới đây là PUBLIC (không cần auth middleware).

--- NEWS ---
GET /api/news
  Query: category (optional), featured (optional: "true"/"false"), page, limit
  Response: ApiList<NewsItem>

GET /api/news/:id
  Response: ApiSuccess<NewsItem> | 404

--- EVENTS ---
GET /api/events
  Query: status (optional: "upcoming"|"ongoing"|"past"), page, limit
  Logic status: 
    upcoming  = startAt > now()
    ongoing   = startAt <= now() AND endAt >= now()
    past      = endAt < now()
  Response: ApiList<EventItem>

GET /api/events/:id
  Response: ApiSuccess<EventItem> | 404

--- HERITAGE ---
GET /api/heritage
  Query: search (optional, tìm theo name), page, limit
  Logic search: case-insensitive includes trên field name
  Response: ApiList<HeritageItem>

GET /api/heritage/:id
  Response: ApiSuccess<HeritageItem> | 404
```

---

## PHẦN 9 – ZALO OA API (GỬI TIN NHẮN VÀO OA MANAGER)

### 9.1. Mô tả luồng

```
Back-end gọi Zalo OA API để gửi tin nhắn tư vấn vào hộp thư OA Manager khi:
1. Người dân tạo phản ánh mới
2. Người dân đặt lịch mới
3. Đánh giá thấp (1-2 sao)

Zalo OA API endpoint gửi tin nhắn:
POST https://openapi.zalo.me/v3.0/oa/message/cs

QUAN TRỌNG:
- Tin nhắn được gửi đến userId của người dân (để cán bộ thấy trong hộp thư OA).
- userId ở đây là Zalo userId (zaloId) của người dân, KHÔNG phải ID nội bộ.
- accessToken là ZALO_OA_ACCESS_TOKEN (của OA phường), KHÔNG phải accessToken của người dân.
- API này yêu cầu người dùng đã "quan tâm" OA phường.
  Nếu chưa quan tâm → API trả lỗi → log warning, KHÔNG throw, KHÔNG ảnh hưởng flow chính.
```

### 9.2. src/services/zaloOA.service.ts

```typescript
// Base headers cho mọi OA API call:
//   {
//     'Content-Type': 'application/json',
//     'access_token': process.env.ZALO_OA_ACCESS_TOKEN
//   }

// Hàm sendMessageToUser(recipientZaloId: string, message: object): Promise<string | null>
//   - POST https://openapi.zalo.me/v3.0/oa/message/cs
//   - Body: { recipient: { user_id: recipientZaloId }, message }
//   - Return: message_id từ response (dùng làm oaMessageId)
//   - Nếu lỗi → log warning, return null (KHÔNG throw)

// Hàm sendFeedbackToOA(feedback: Feedback, user: User): Promise<void>
//   - Tạo message content:
//     {
//       "attachment": {
//         "type": "template",
//         "payload": {
//           "template_type": "list",
//           "elements": [
//             {
//               "title": "🚨 PHẢN ÁNH MỚI",
//               "subtitle": "Mã: " + feedback.code,
//               "image_url": feedback.imageUrls[0] || ""
//             },
//             {
//               "title": "👤 Người gửi: " + user.displayName,
//               "subtitle": "Danh mục: " + getCategoryLabel(feedback.category)
//             },
//             {
//               "title": "📝 Nội dung:",
//               "subtitle": feedback.title + " – " + feedback.description.substring(0, 100) + "..."
//             },
//             {
//               "title": "📍 Địa điểm:",
//               "subtitle": feedback.address || "Tọa độ: " + feedback.latitude + ", " + feedback.longitude
//             }
//           ],
//           "buttons": [
//             {
//               "title": "✅ ĐANG XỬ LÝ",
//               "type": "oa.query.show",
//               "payload": "FEEDBACK_PROCESSING " + feedback.id
//             },
//             {
//               "title": "✔️ ĐÃ GIẢI QUYẾT",
//               "type": "oa.query.show",
//               "payload": "FEEDBACK_RESOLVED " + feedback.id
//             }
//           ]
//         }
//       }
//     }
//   - Gọi sendMessageToUser(user.zaloId, message)
//   - Nếu messageId trả về → update feedback.oaMessageId = messageId

// Hàm sendBookingToOA(booking: Booking, user: User): Promise<void>
//   - Tạo message dạng text + buttons:
//     Text nội dung:
//     "📅 YÊU CẦU ĐẶT LỊCH MỚI\n
//     Mã: {booking.code}\n
//     👤 Người đặt: {user.displayName}\n
//     🗂️ Lĩnh vực: {getFieldLabel(booking.field)}\n
//     📆 Ngày mong muốn: {format(booking.preferredDate, 'dd/MM/yyyy')}\n
//     ⏰ Giờ mong muốn: {booking.preferredTime}\n
//     📝 Nội dung: {booking.description}\n\n
//     ─────────────────────\n
//     Để XÁC NHẬN: Reply theo mẫu:\n
//     XAC_NHAN [ngày] [giờ]\n
//     VD: XAC_NHAN 20/05/2026 09:00\n\n
//     Để TỪ CHỐI: Reply:\n
//     TU_CHOI [lý do]\n\n
//     Để DỜI LỊCH: Reply:\n
//     DOI_LICH [ngày] [giờ] [ghi chú]"
//   - Gọi sendMessageToUser(user.zaloId, { text: textContent })
//   - Update booking.oaMessageId

// Hàm sendLowRatingAlert(rating: Rating, user: User): Promise<void>
//   - Text: "⚠️ ĐÁNH GIÁ THẤP\nMức độ hài lòng: {rating.averageScore}/5 ⭐\n
//            Thủ tục: {rating.procedure}\nNhận xét: {rating.comment || 'Không có'}"
//   - Gửi đến userId của LÃNH ĐẠO PHƯỜNG (lấy từ env: ZALO_LEADER_USER_ID)
//   - Thêm biến môi trường: ZALO_LEADER_USER_ID=<zaloId của lãnh đạo>
```

### 9.3. Helper functions trong zaloOA.service.ts

```typescript
// getCategoryLabel(category: FeedbackCategory): string
//   Map enum → tiếng Việt: HA_TANG → "Hạ tầng – Đường sá", v.v.

// getFieldLabel(field: BookingField): string
//   Map enum → tiếng Việt: HO_TICH → "Hộ tịch", v.v.
```

---

## PHẦN 10 – ZNS (ZALO NOTIFICATION SERVICE)

### 10.1. Mô tả

```
ZNS gửi tin nhắn thông báo trực tiếp đến số điện thoại Zalo của người dân.
Cần đăng ký Template trước tại business.zalo.me, sau khi được duyệt mới dùng được.

API endpoint: POST https://business.zalo.me/api/notification/template/send

QUAN TRỌNG:
- Cần phone token (từ zmp-sdk.getPhoneNumber()) để back-end lấy số điện thoại.
- Thực tế: front-end gửi phone token, back-end gọi Zalo API để lấy số điện thoại từ token.
- KHÔNG lưu số điện thoại thô vào DB – lưu phone token thay thế.

Zalo API lấy số điện thoại từ token:
  POST https://openapi.zalo.me/v2.0/oa/getinfobyphonenumbertoken
  Header: { access_token: ZALO_OA_ACCESS_TOKEN }
  Body: { phone_number_token: <token>, secret_key: ZALO_APP_SECRET }
  → Trả về { phone_number: "0901234567" }
```

### 10.2. src/services/zns.service.ts

```typescript
// Helper: getPhoneNumberFromToken(phoneToken: string): Promise<string>
//   - Gọi Zalo API như mô tả trên
//   - Return số điện thoại dạng chuỗi (VD: "0901234567")
//   - Nếu lỗi → throw Error (caller phải handle)

// Base gửi ZNS:
// Hàm sendZNS(params: SendZNSParams): Promise<boolean>
//   POST https://business.zalo.me/api/notification/template/send
//   Header: { access_token: process.env.ZALO_ZNS_OA_TOKEN }
//   Body: {
//     phone: params.phone,
//     template_id: params.templateId,
//     template_data: params.data,
//     tracking_id: params.trackingId
//   }
//   Nếu API trả error code ≠ 0 → log error, return false
//   Return true nếu thành công

// Hàm sendBookingReceived(phoneToken: string, booking: Booking): Promise<void>
//   - Lấy số điện thoại từ phoneToken
//   - Gọi sendZNS với:
//     templateId: ZNS_TEMPLATE_BOOKING_RECEIVED
//     data: {
//       booking_code: booking.code,
//       field: getFieldLabel(booking.field),
//       preferred_date: format(booking.preferredDate, 'dd/MM/yyyy'),
//       preferred_time: booking.preferredTime
//     }
//   - Wrap trong try/catch: nếu thất bại → log warning, KHÔNG throw

// Hàm sendBookingConfirmed(phoneToken: string, booking: Booking): Promise<void>
//   templateId: ZNS_TEMPLATE_BOOKING_CONFIRMED
//   data: {
//     booking_code: booking.code,
//     confirmed_date: format(booking.confirmedDate!, 'dd/MM/yyyy'),
//     confirmed_time: booking.confirmedTime!,
//     location: "Bộ phận Một cửa – UBND Phường Tùng Thiện"
//   }

// Hàm sendBookingRejected(phoneToken: string, booking: Booking): Promise<void>
//   templateId: ZNS_TEMPLATE_BOOKING_REJECTED
//   data: {
//     booking_code: booking.code,
//     rejection_reason: booking.rejectionReason || "Không xác định"
//   }

// Hàm sendBookingReminder(phoneToken: string, booking: Booking, reminderType: '24h'|'1h'): Promise<void>
//   templateId: ZNS_TEMPLATE_BOOKING_REMINDER
//   data: {
//     booking_code: booking.code,
//     confirmed_date: format(booking.confirmedDate!, 'dd/MM/yyyy'),
//     confirmed_time: booking.confirmedTime!,
//     reminder_type: reminderType === '24h' ? 'ngày mai' : '1 giờ nữa'
//   }

// Hàm sendFeedbackReceived(phoneToken: string, feedback: Feedback): Promise<void>
//   templateId: ZNS_TEMPLATE_FEEDBACK_RECEIVED
//   data: {
//     feedback_code: feedback.code,
//     category: getCategoryLabel(feedback.category)
//   }

// Hàm sendFeedbackUpdated(phoneToken: string, feedback: Feedback): Promise<void>
//   templateId: ZNS_TEMPLATE_FEEDBACK_UPDATED
//   data: {
//     feedback_code: feedback.code,
//     status: getStatusLabel(feedback.status),
//     response: feedback.response || 'Đang được xử lý'
//   }

// LƯU Ý: Vì người dùng có thể chưa grant quyền lấy số điện thoại,
// tất cả hàm gửi ZNS phải wrap trong try/catch,
// nếu phoneToken là null/undefined → log warning, skip (không throw).

interface SendZNSParams {
  phone: string;
  templateId: string;
  data: Record<string, string>;
  trackingId?: string;
}
```

---

## PHẦN 11 – ZALO OA WEBHOOK (NHẬN PHẢN HỒI CÁN BỘ)

### 11.1. Cơ chế Webhook

```
Khi cán bộ trả lời tin nhắn trong OA Manager, Zalo gửi POST request đến:
  POST /webhook/zalo

Back-end PHẢI xác minh chữ ký trước khi xử lý bất kỳ event nào.

Cấu trúc request từ Zalo:
{
  "app_id": "<app_id>",
  "user_id_by_app": "<user_zalo_id>",
  "event_name": "user_send_text",
  "timestamp": "1716220800000",
  "mac": "<hmac_sha256_signature>",
  "message": {
    "msg_id": "<message_id>",
    "text": "XAC_NHAN 20/05/2026 09:00",
    "quote_msg_id": "<id_of_original_message>"  // ID tin nhắn gốc từ OA
  }
}

Hoặc event "oa_send_text" khi OA gửi text message.
Hoặc event "user_send_button" khi cán bộ nhấn button trong template message.
```

### 11.2. src/utils/zaloSignature.ts

```typescript
// Hàm verifyZaloWebhookSignature(payload: string, mac: string): boolean
//   - Tính HMAC-SHA256 của payload (raw body string) với key = ZALO_OA_SECRET_KEY
//   - So sánh với mac trong request (constant-time comparison dùng crypto.timingSafeEqual)
//   - Return true nếu khớp, false nếu không khớp

// QUAN TRỌNG: Cần đọc raw body (Buffer), KHÔNG đọc parsed JSON.
// Cấu hình Express để preserve raw body:
//   app.use('/webhook/zalo', express.raw({ type: 'application/json' }))
//   Trong controller: const rawBody = req.body.toString('utf8')
//   const parsed = JSON.parse(rawBody)
```

### 11.3. src/controllers/webhook.controller.ts

```typescript
// handleZaloWebhook(req, res, next):
//
// 1. Đọc raw body và parse JSON
// 2. Gọi verifyZaloWebhookSignature(rawBody, body.mac)
//    Nếu không hợp lệ → res.status(401).json({ error: 'Invalid signature' })
//    (KHÔNG log thông tin nhạy cảm)
// 3. Trả res.status(200).json({ received: true }) NGAY LẬP TỨC
//    (Zalo cần nhận 200 trong vòng 5 giây, xử lý tiếp trong background)
// 4. Xử lý event bất đồng bộ (không await, dùng setImmediate hoặc Promise không await):
//    - Đọc event_name
//    - Nếu event_name === "user_send_text":
//        + Lấy text = body.message.text
//        + Lấy quoteMessageId = body.message.quote_msg_id (nếu có)
//        + Gọi webhookService.processTextReply(text, quoteMessageId)
//    - Nếu event_name === "user_send_button":
//        + Lấy payload = body.message.payload (VD: "FEEDBACK_PROCESSING <id>")
//        + Gọi webhookService.processButtonClick(payload)
//    - Các event khác → log INFO, bỏ qua

// LƯU Ý: Route /webhook/zalo phải đặt TRƯỚC middleware express.json()
// và dùng express.raw() riêng để preserve raw body.
```

### 11.4. src/services/webhook.service.ts

```typescript
// Hàm processTextReply(text: string, quoteMessageId: string | undefined): Promise<void>
//   - Nếu không có quoteMessageId → log INFO "No quote, skip", return
//   - Trim và uppercase text để parse
//   - Parse prefix:
//     + Bắt đầu bằng "XAC_NHAN" → xử lý booking confirm
//     + Bắt đầu bằng "TU_CHOI"  → xử lý booking reject
//     + Bắt đầu bằng "DOI_LICH" → xử lý booking reschedule
//     + Bắt đầu bằng "FEEDBACK_" → xử lý (nếu muốn hỗ trợ text ngoài button)
//     + Không khớp → log INFO "Unknown reply format, skip", return
//
//   Xử lý "XAC_NHAN [ngày dd/MM/yyyy] [giờ HH:mm]":
//     - Parse ngày và giờ từ text
//     - Nếu parse lỗi → log WARNING, return
//     - Gọi booking.service.processWebhookReply(quoteMessageId, 'CONFIRMED', { confirmedDate, confirmedTime })
//
//   Xử lý "TU_CHOI [lý do]":
//     - Lấy lý do (phần sau "TU_CHOI ")
//     - Gọi booking.service.processWebhookReply(quoteMessageId, 'REJECTED', { rejectionReason })
//
//   Xử lý "DOI_LICH [ngày] [giờ] [ghi chú]":
//     - Parse ngày, giờ, ghi chú
//     - Gọi booking.service.processWebhookReply(quoteMessageId, 'RESCHEDULED', { confirmedDate, confirmedTime, rescheduledNote })

// Hàm processButtonClick(payload: string): Promise<void>
//   - Parse payload: "FEEDBACK_PROCESSING <feedbackId>" hoặc "FEEDBACK_RESOLVED <feedbackId>"
//   - Tương ứng update feedback status
//   - Gọi zns.service.sendFeedbackUpdated()
```

---

## PHẦN 12 – CRON JOB NHẮC LỊCH HẸN

### 12.1. src/jobs/reminderJob.ts

```typescript
// Tạo 1 cron job duy nhất, chạy mỗi 30 phút: '*/30 * * * *'
//
// Logic mỗi lần chạy:
//
// [A] Nhắc lịch 24 giờ:
//   - Tìm bookings:
//     status = CONFIRMED
//     AND reminder24hSent = false
//     AND confirmedDate BETWEEN now() AND now() + 25h
//     (cho khoảng dư 25h để tránh miss nếu job chạy lệch 30 phút)
//   - Với mỗi booking: gọi zns.service.sendBookingReminder(user.phoneToken, booking, '24h')
//   - Update reminder24hSent = true
//
// [B] Nhắc lịch 1 giờ:
//   - Tìm bookings:
//     status = CONFIRMED
//     AND reminder1hSent = false
//     AND confirmedDate BETWEEN now() AND now() + 90min
//   - Gọi zns.service.sendBookingReminder(user.phoneToken, booking, '1h')
//   - Update reminder1hSent = true
//
// [C] Auto-complete:
//   - Tìm bookings: status = CONFIRMED AND confirmedDate < now() - 1h
//   - Update status = COMPLETED
//
// Error handling: wrap toàn bộ trong try/catch, log error, KHÔNG crash process
//
// Export: startReminderJob() – được gọi trong server.ts khi khởi động
```

---

## PHẦN 13 – MIDDLEWARE

### 13.1. src/middleware/validate.middleware.ts

```typescript
// Higher-order function tạo validation middleware từ zod schema:
//
// export const validate = (schema: z.ZodSchema) => (req, res, next) => {
//   const result = schema.safeParse(req.body);
//   if (!result.success) {
//     const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
//     return res.status(400).json({
//       success: false,
//       error: { code: 'VALIDATION_ERROR', message: errors }
//     });
//   }
//   req.body = result.data; // replace với data đã parse/sanitize
//   next();
// };
//
// Dùng trong routes: router.post('/feedbacks', authenticate, validate(createFeedbackSchema), controller)
```

### 13.2. src/middleware/errorHandler.middleware.ts

```typescript
// Global error handler (4 tham số: err, req, res, next):
//
// 1. Log error: logger.error(err.message, { stack: err.stack, url: req.url })
// 2. Nếu err.name === 'ZodError' → 400 VALIDATION_ERROR
// 3. Nếu err.message === 'INVALID_ZALO_TOKEN' → 401 UNAUTHORIZED
// 4. Nếu err.message === 'NOT_FOUND' → 404 NOT_FOUND
// 5. Default → 500
//    Trong production (NODE_ENV=production): message = "Đã xảy ra lỗi hệ thống."
//    Trong development: message = err.message (để debug)
```

### 13.3. src/middleware/rateLimit.middleware.ts

```typescript
// Import express-rate-limit
// Tạo limiter với:
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 phút
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
//   standardHeaders: true
//   legacyHeaders: false
//   message: { success: false, error: { code: 'RATE_LIMIT', message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' } }
// Export: rateLimiter (default export)
```

---

## PHẦN 14 – CẤU HÌNH TRIỂN KHAI (PRODUCTION)

### 14.1. ecosystem.config.js (PM2)

```javascript
module.exports = {
  apps: [{
    name: 'tung-thien-backend',
    script: 'dist/server.js',
    instances: 1,         // 1 instance (VPS 2 vCPU, không cần cluster)
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

### 14.2. Nginx config (/etc/nginx/sites-available/tung-thien)

```nginx
server {
    listen 80;
    server_name api.tungtthien-phuong.gov.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tungtthien-phuong.gov.vn;

    ssl_certificate /etc/letsencrypt/live/api.tungtthien-phuong.gov.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tungtthien-phuong.gov.vn/privkey.pem;

    # Security headers (helmet trong app đã xử lý, Nginx thêm lớp ngoài)
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Upload limit (cho ảnh phản ánh)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 14.3. Script backup tự động (crontab)

```bash
# File: /home/ubuntu/scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="tungtthien_db"
DB_USER="postgres"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Xóa backup cũ hơn 30 ngày
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload lên Google Drive hoặc object storage (tùy chọn thêm)
echo "Backup completed: $BACKUP_FILE"

# Crontab entry (chạy lúc 2:00 AM hàng ngày):
# 0 2 * * * /home/ubuntu/scripts/backup.sh >> /home/ubuntu/logs/backup.log 2>&1
```

---

## PHẦN 15 – KIỂM THỬ API (DANH SÁCH ENDPOINT ĐỂ TEST)

### Danh sách đầy đủ endpoints

```
PUBLIC (không cần auth):
  GET  /health
  GET  /api/news
  GET  /api/news/:id
  GET  /api/events
  GET  /api/events/:id
  GET  /api/heritage
  GET  /api/heritage/:id
  GET  /api/ratings/summary
  POST /api/auth/login

PROTECTED (cần Bearer JWT):
  GET  /api/auth/me
  POST /api/upload                (multipart/form-data, field: "files")
  GET  /api/feedbacks/me
  GET  /api/feedbacks/:id
  POST /api/feedbacks
  GET  /api/bookings/me
  POST /api/bookings
  DELETE /api/bookings/:id

WEBHOOK (không auth, nhưng verify signature):
  POST /webhook/zalo
```

### Checklist kiểm thử ưu tiên

```
✅ Luồng đầy đủ Đặt lịch:
   1. POST /api/auth/login → nhận JWT
   2. POST /api/bookings → booking tạo + OA nhận tin nhắn
   3. Cán bộ reply "XAC_NHAN 25/05/2026 09:00" trong OA Manager
   4. Webhook xử lý → booking status = CONFIRMED
   5. Người dân GET /api/bookings/me → thấy status CONFIRMED

✅ Luồng đầy đủ Phản ánh:
   1. POST /api/upload → nhận URLs ảnh
   2. POST /api/feedbacks → OA nhận tin + ZNS gửi đến người dân
   3. Cán bộ nhấn button "ĐÃ GIẢI QUYẾT" trong OA Manager
   4. Webhook xử lý → feedback status = RESOLVED

✅ Kiểm thử ZNS (dùng mock nếu chưa có template):
   - Tạo booking → ZNS BOOKING_RECEIVED gửi thành công
   - Cron job nhắc lịch chạy → ZNS BOOKING_REMINDER gửi đúng đối tượng

✅ Kiểm thử bảo mật:
   - Request không có JWT → 401
   - JWT giả mạo → 401
   - Request đến /webhook/zalo với mac sai → 401
   - Upload file > 5MB → 400
   - Upload file không phải ảnh → 400
   - Rate limit: gửi 101 request trong 15 phút → 429
```

---

## PHỤ LỤC – THỨ TỰ XÂY DỰNG KHUYẾN NGHỊ

```
Bước 1:  Phần 0  – Setup project, cài packages, tsconfig, biến môi trường
Bước 2:  Phần 2  – Viết Prisma schema + chạy migration
Bước 3:  Phần 1  – Tạo logger, app.ts, server.ts (chưa có routes)
Bước 4:  Phần 13 – Tạo middleware (auth, validate, errorHandler, rateLimit)
Bước 5:  Phần 3  – Auth service + route + controller (test login trước)
Bước 6:  Phần 7  – Upload service (test upload ảnh)
Bước 7:  Phần 9  – ZaloOA service (stub – chưa test thật, mock response)
Bước 8:  Phần 10 – ZNS service (stub – mock, điền template ID sau)
Bước 9:  Phần 4  – Feedback service + route + controller
Bước 10: Phần 5  – Booking service + route + controller
Bước 11: Phần 6  – Rating service + route + controller
Bước 12: Phần 11 – Webhook controller + service
         (Bước này kết nối Bước 9 + 10 thành luồng hoàn chỉnh)
Bước 13: Phần 12 – Cron job nhắc lịch
Bước 14: Phần 8  – Google Sheets service + News/Events/Heritage routes
Bước 15: Phần 14 – Deploy: build, PM2, Nginx, SSL, backup script
Bước 16: Phần 15 – Kiểm thử toàn bộ theo checklist
```
