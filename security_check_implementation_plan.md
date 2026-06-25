# 🔒 Kế hoạch Kiểm tra Bảo mật & Cải thiện An toàn — Zalo Mini App (Tùng Thiện)

> **Phiên bản:** v2 — Cập nhật sau review lần 1 (22/06/2026)
> **Trạng thái dự án:** Đang phát triển, chưa deploy production
> **Kiến trúc deploy:** Cùng domain, chia subdomain cho admin page và API URL

Báo cáo đánh giá toàn diện bảo mật dự án Zalo Mini App backend (Express + Prisma + PostgreSQL), frontend (React + Vite) và admin panel.

---

## Tổng quan Kiến trúc

| Thành phần | Công nghệ | Vị trí |
|---|---|---|
| Frontend (Mini App) | React 18, Vite, ZMP SDK | `src/` |
| Admin Panel | React 18, Vite, TipTap | `admin/` |
| Backend API | Express 4, Prisma 5, PostgreSQL | `backend/` |
| Reverse Proxy | Nginx + SSL (Let's Encrypt) | `backend/nginx-config` |
| Cloud Storage | Cloudinary | Upload service |
| Messaging | Zalo OA API, ZNS | Notification services |

---

## 🚨 Phần 1: Lỗ hổng NGHIÊM TRỌNG (Critical)

### 1.1. JWT_SECRET quá yếu — cần tạo chuỗi mạnh

> [!CAUTION]
> `JWT_SECRET = "thay_bang_chuoi_random_bao_mat_cua_ban"` trong [backend/.env](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/.env#L11) — đây là giá trị placeholder, **quá yếu** và dễ đoán.

**Bối cảnh:** Dự án chưa deploy nên không cần rotate secrets khẩn cấp. Tuy nhiên, nên tạo JWT_SECRET mạnh ngay từ bây giờ để tránh quên khi deploy.

**Cải thiện:**
- [ ] Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên ≥ 64 ký tự (`openssl rand -base64 64` hoặc `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`)
- [ ] Kiểm tra `git log --all --diff-filter=A -- .env backend/.env` để xác nhận `.env` chưa bị commit vào git history
- [ ] Đảm bảo `.env.example` **không chứa giá trị thật** (hiện tại ✅ đã đúng)

> [!NOTE]
> Các secrets khác (ZALO_APP_SECRET, CLOUDINARY_API_SECRET, database password) sẽ được xử lý ở checklist trước deploy (Phần 6).

---

### ~~1.2. Webhook Signature Verification bị tắt~~ → 🔵 Hoãn

> [!NOTE]
> **Theo phản hồi:** `ZALO_OA_SECRET_KEY` đang rỗng, tạm thời để như vậy.
> Webhook signature verification sẽ luôn fail khi `secretKey` undefined nên code bypass hiện tại là phù hợp cho giai đoạn dev.
>
> ⚠️ Mục này được chuyển vào **Checklist trước Deploy** (Phần 6).

---

### ~~1.3. Dev Auth endpoint mở~~ → 🔵 Hoãn

> [!NOTE]
> **Theo phản hồi:** Đang trong giai đoạn phát triển, sẽ tự chỉnh sửa khi deploy.
>
> ⚠️ Mục này được chuyển vào **Checklist trước Deploy** (Phần 6).

---

## ⚠️ Phần 2: Các Vấn đề QUAN TRỌNG (High — Cần sửa sớm)

### 2.1. Thiếu Zod validation cho một số routes

| Route | File | Vấn đề |
|---|---|---|
| `GET /api/admin/bookings` | [adminBooking.routes.ts](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/routes/adminBooking.routes.ts) | Query params không validate |
| `PATCH /api/admin/bookings/:id` | Same | Body không validate |
| `GET /api/admin/feedbacks` | [adminFeedback.routes.ts](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/routes/adminFeedback.routes.ts) | Query params không validate |
| `PATCH /api/admin/feedbacks/:id` | Same | Body không validate |

**Cải thiện:**
- [ ] Thêm Zod schema cho query params (sử dụng custom middleware `validateQuery`)
- [ ] Validate `req.params.id` là UUID hợp lệ cho tất cả route có `:id`
- [ ] Validate body cho admin booking/feedback update routes

---

### 2.2. Thiếu kiểm tra quyền sở hữu (IDOR Risk)

**Files:**
- [feedback.controller.ts:L33-L46](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/controllers/feedback.controller.ts#L33-L46)
- [booking.controller.ts:L31-L47](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/controllers/booking.controller.ts#L31-L47)

**Vấn đề:**
- `getFeedbackDetails` truyền `userId` vào service nhưng cần đảm bảo service thực sự kiểm tra `userId` khớp
- `cancelBooking` tương tự — cần verify rằng booking thuộc về user hiện tại
- Nếu không kiểm tra đúng, user A có thể xem/hủy feedback/booking của user B bằng cách đoán UUID

**Cải thiện:**
- [ ] Audit tất cả service functions đảm bảo filter by `userId` trước khi trả data
- [ ] Thêm unit test cho IDOR scenarios (thử truy cập resource của user khác)

---

### 2.3. File upload thiếu kiểm tra nội dung (content validation)

**File:** [upload.service.ts:L25](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/services/upload.service.ts#L25)

```typescript
if (!file.mimetype.startsWith('image/')) { ... }
```

**Vấn đề:**
- Chỉ kiểm tra `mimetype` header — attacker có thể forge mimetype để upload file malicious
- Không kiểm tra magic bytes (file signature) thực tế
- `image/svg+xml` được chấp nhận → có thể chứa XSS/script injection

**Cải thiện:**
- [ ] Kiểm tra file magic bytes (sử dụng thư viện `file-type`)
- [ ] Chặn SVG uploads (hoặc sanitize SVG content)
- [ ] Thêm allowlist cho mime types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- [ ] Scan file content trước khi upload lên Cloudinary

---

### 2.4. Cấu hình Helmet CSP và Security Headers chi tiết

**File:** [app.ts:L40](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/app.ts#L40)

Hiện tại chỉ dùng `helmet()` với cấu hình mặc định. Nginx config đã có `X-Frame-Options` và `X-Content-Type-Options` nhưng thiếu nhiều headers quan trọng.

**Cải thiện:**
- [ ] Cấu hình Content-Security-Policy (CSP) cho Helmet phù hợp với Zalo Mini App + Cloudinary images
- [ ] Thêm `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Thêm `Permissions-Policy` để giới hạn browser features (camera, geolocation, microphone)
- [ ] Thêm HSTS header trong Nginx (chi tiết ở mục 5.2)

---

### 2.5. CORS hardening — đặt default an toàn hơn

**File:** [app.ts:L48-L52](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/app.ts#L48-L52)

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? true  // ← Cho phép MỌI origin trong dev
    : (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
  credentials: true
}));
```

**Rủi ro:** Nếu `NODE_ENV` không được set đúng khi deploy, CORS sẽ mở toàn bộ.

**Cải thiện:**
- [ ] Đặt `NODE_ENV=production` là default nếu không được chỉ định (ví dụ: `const isDev = process.env.NODE_ENV === 'development'` thay vì ngược lại)
- [ ] Log warning khi CORS đang ở chế độ "open"
- [ ] Thêm `ADMIN_APP_URL` vào `allowedOrigins` rõ ràng (cho subdomain admin)

---

### 2.6. Admin Session Cookie — cần cấu hình domain cho subdomain

**File:** [adminAuth.ts:L40-L48](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/utils/adminAuth.ts#L40-L48)

```typescript
res.cookie(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: getCookieMaxAge()
});
```

**Bối cảnh:** Admin page và API URL dùng cùng domain nhưng chia subdomain → cần cấu hình `domain` cho cookie cross-subdomain.

**Cải thiện:**
- [ ] Thêm `domain` option dạng `.tungtthien-phuong.gov.vn` (có dấu chấm đầu) để cookie hoạt động giữa các subdomain
- [ ] Cân nhắc đổi `sameSite` thành `strict` cho admin panel vì admin không cần cross-site requests
- [ ] Thêm env var `COOKIE_DOMAIN` để linh hoạt giữa dev/production

---

### 2.7. Rate Limiting cần cải thiện

**File:** [rateLimit.middleware.ts](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/middleware/rateLimit.middleware.ts#L13-L26)

**Vấn đề:**
- Không có rate limit riêng cho `/api/feedbacks`, `/api/bookings`, `/api/ratings` (user-facing creation endpoints)
- Sử dụng in-memory store → reset khi restart server, không chia sẻ giữa instances

**Cải thiện:**
- [ ] Thêm rate limiter riêng cho feedback/booking/rating creation (ví dụ: 10 requests/15 phút)
- [ ] Thêm IP-only rate limiter ngoài cùng trước mọi JWT-based limiter

---

### 2.8. JWT Token không có cơ chế revoke cho user

**Vấn đề:**
- Admin session dùng `sessionVersion` ✅ Tốt — cho phép invalidate
- User JWT (Bearer token) **không có cơ chế revoke** — token sống 7 ngày (`JWT_EXPIRES_IN=7d`)
- Nếu token bị đánh cắp, attacker có 7 ngày sử dụng

**Cải thiện:**
- [ ] Giảm `JWT_EXPIRES_IN` xuống 1-2 giờ + implement refresh token flow cho user
- [ ] Hoặc thêm `sessionVersion` check cho user tokens tương tự admin (đơn giản hơn)

---

## 🔍 Phần 3: Các Vấn đề MỨC TRUNG BÌNH (Medium)

### 3.1. Sequence number generation có race condition

**File:** [generateCode.ts](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/utils/generateCode.ts#L4-L30)

`getNextSequence()` đếm records hiện có rồi +1 → nếu 2 requests đồng thời sẽ tạo cùng code → lỗi `UNIQUE constraint`.

**Cải thiện:**
- [ ] Sử dụng database sequence (`@default(autoincrement())`) hoặc `SERIAL` column
- [ ] Hoặc dùng `UNIQUE` constraint + retry logic khi gặp conflict

---

### 3.2. Logging có thể leak sensitive data

**File:** [logger.ts](file:///d:/2025/src/zalo_mini_app_test/my-app-test-1/backend/src/utils/logger.ts)

- Request logging trong `app.ts` log toàn bộ `req.originalUrl` — có thể chứa query params nhạy cảm
- Error handler log `err.message` và `err.stack` — có thể chứa database connection strings
- File log có thể grow vô hạn (không có rotation)

**Cải thiện:**
- [ ] Thêm log rotation policy (ví dụ: `maxsize: '10m'`, `maxFiles: 5` trong winston config)
- [ ] Sanitize URL trước khi log (loại bỏ sensitive query params)
- [ ] Cân nhắc sử dụng structured logging (JSON format) cho production

---

## 📋 Phần 4: Các Điểm ĐÃ LÀM TỐT ✅

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| Password Hashing | ✅ Tốt | bcrypt với salt rounds = 12 |
| Password Policy | ✅ Tốt | ≥12 ký tự, hoa/thường/số/đặc biệt |
| Input Validation | ✅ Khá | Dùng Zod cho hầu hết routes |
| Helmet | ✅ Cơ bản | Đã tích hợp (cần tune config) |
| CORS | ✅ Khá | Whitelist origins trong production |
| Admin RBAC | ✅ Tốt | ADMIN / SUPER_ADMIN phân quyền rõ |
| Admin Audit Log | ✅ Tốt | Log đầy đủ mutations + actor/IP/UA |
| Session Invalidation | ✅ Tốt | `sessionVersion` increment khi đổi MK/role |
| CSRF Protection | ✅ Khá | Origin verification cho admin mutations |
| SSL/HTTPS | ✅ Tốt | Let's Encrypt + HTTP→HTTPS redirect |
| Webhook Signature Code | ✅ Code đúng | `timingSafeEqual` chống timing attack |
| DOMPurify | ✅ Frontend | Có sử dụng ở frontend |
| sanitize-html | ✅ Backend | Dependency đã cài (cần verify usage) |
| Body Size Limit | ✅ Tốt | `10mb` limit cho JSON body |
| File Size Limit | ✅ Tốt | 5MB per file, max 10 files |
| Self-demotion guard | ✅ Tốt | Không cho admin tự khóa/hạ quyền mình |
| Graceful Shutdown | ✅ Tốt | `SIGTERM`/`SIGINT` → disconnect DB |

---

## 🔧 Phần 5: Các Cải thiện bổ sung (Low Priority)

### 5.1. Infrastructure & DevOps
- [ ] Thêm `npm audit` vào CI/CD pipeline
- [ ] Thêm SAST scan (ví dụ: Snyk, SonarQube, hoặc GitLab SAST)
- [ ] Setup log aggregation (ELK, Loki, hoặc cloud logging)
- [ ] Thêm health check endpoint chi tiết hơn (database connectivity, OA token status)

### 5.2. Nginx Hardening (trước deploy)
- [ ] Thêm `ssl_protocols TLSv1.2 TLSv1.3;` (chặn TLS 1.0/1.1)
- [ ] Thêm `ssl_ciphers` với cipher suite mạnh
- [ ] Thêm `ssl_stapling` và `ssl_stapling_verify`
- [ ] Thêm `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";`
- [ ] Giới hạn HTTP methods cho từng location
- [ ] Thêm `limit_req` rate limiting ở Nginx level

### 5.3. Monitoring & Alerting
- [ ] Monitor OA token refresh failures
- [ ] Alert khi rate limit bị hit nhiều lần từ cùng IP
- [ ] Uptime monitoring cho API endpoint

---

## 📊 Phần 6: Ma trận Ưu tiên Thực hiện

### Thực hiện ngay (giai đoạn phát triển)

| # | Hạng mục | Mức độ | Nỗ lực | Ưu tiên |
|---|---|---|---|---|
| 1.1 | Tạo JWT_SECRET mạnh | 🔴 Critical | 15min | **P1 — Sửa ngay** |
| 2.1 | Thêm Zod validation thiếu | 🟠 High | 2-3h | **P1 — Sửa ngay** |
| 2.2 | IDOR audit (kiểm tra quyền sở hữu) | 🟠 High | 2-3h | **P1 — Sửa ngay** |
| 2.3 | File upload content validation | 🟠 High | 2h | **P1 — Sửa ngay** |
| 2.4 | Cấu hình Helmet CSP + security headers | 🟠 High | 1-2h | **P2 — Tuần này** |
| 2.5 | CORS default strictness | 🟠 High | 30min | **P2 — Tuần này** |
| 2.6 | Admin cookie domain cho subdomain | 🟠 High | 1h | **P2 — Tuần này** |
| 2.7 | Cải thiện rate limiting | 🟠 High | 2-3h | **P2 — Tuần này** |
| 2.8 | JWT token lifecycle cho user | 🟡 Medium | 4-6h | **P2 — Tuần này** |
| 3.1 | Sequence race condition | 🟡 Medium | 1-2h | **P3 — Trước deploy** |
| 3.2 | Log sanitization + rotation | 🟡 Medium | 1-2h | **P3 — Trước deploy** |
| 5.2 | Nginx hardening | 🟢 Low | 1-2h | **P3 — Trước deploy** |
| 5.1 | CI/CD security scanning | 🟢 Low | 2-3h | **P3 — Trước deploy** |

**Tổng effort ước tính:** ~20-28 giờ

---

### 🚀 Checklist trước Deploy (các mục đã hoãn)

> [!WARNING]
> Các mục dưới đây đã được hoãn theo quyết định review. **BẮT BUỘC** hoàn thành trước khi deploy production.

| # | Hạng mục | Nỗ lực | Ghi chú |
|---|---|---|---|
| D1 | Bật webhook signature enforcement | 15min | Bỏ comment `return res.status(401)` + set `ZALO_OA_SECRET_KEY` |
| D2 | Tắt dev-login endpoint | 30min | Dùng conditional route registration hoặc set `ENABLE_DEV_AUTH=false` |
| D3 | Set `NODE_ENV=production` | 5min | Trong ecosystem.config.js (✅ đã có) + xác nhận trên server |
| D4 | Rotate tất cả secrets | 1-2h | JWT_SECRET, DB password (`abc`), ZALO_APP_SECRET, CLOUDINARY keys |
| D5 | Đổi database password | 30min | `abc` → password mạnh ≥ 16 ký tự |
| D6 | Sử dụng secrets management | 1-2h | GitLab CI/CD variables hoặc env trên server, **không** commit `.env` |
| D7 | Error handler chỉ trả message generic | 5min | Đảm bảo `NODE_ENV=production` → `err.message` không leak |
| D8 | Cấu hình cookie domain production | 15min | Set `COOKIE_DOMAIN=.tungtthien-phuong.gov.vn` |

---

## Verification Plan

### Automated Tests
```bash
# Kiểm tra git history cho .env files
git log --all --diff-filter=A -- .env backend/.env

# Kiểm tra npm vulnerabilities
cd backend && npm audit
cd ../admin && npm audit
cd .. && npm audit
```

### Manual Verification
- [ ] Review tất cả service functions cho IDOR vulnerabilities
- [ ] Test CORS bằng cách gửi request từ origin không nằm trong whitelist
- [ ] Verify Helmet response headers bằng browser DevTools hoặc `curl -I`
- [ ] Test file upload với file giả mimetype (đổi extension .js → .jpg)
- [ ] Test tạo booking/feedback đồng thời để kiểm tra race condition

---

## Tóm tắt Thay đổi so với v1

| Mục | Thay đổi | Lý do |
|---|---|---|
| 1.2 Webhook signature | Hoãn → Checklist deploy | `ZALO_OA_SECRET_KEY` chưa setup, bypass phù hợp cho dev |
| 1.3 Dev Auth | Hoãn → Checklist deploy | Đang phát triển, sẽ tự chỉnh khi deploy |
| 3.2 Error Handler leak | Hoãn → Checklist deploy | Chỉ cần đảm bảo NODE_ENV=production khi deploy |
| 3.4 Account Lockout | ❌ Loại bỏ | Không cần thiết (rate limit 30 req/15min đủ) |
| 5.4 Frontend Security | ❌ Loại bỏ | Chưa cần chỉnh sửa |
| 2.6 Cookie domain | Cập nhật | Thêm context subdomain architecture |
| Priority matrix | Tái cấu trúc | Tách riêng P1-P3 (dev) và Checklist deploy |
