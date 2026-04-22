# PROMPT – PHÁT TRIỂN FRONT-END ZALO MINI APP
## UBND Phường Tùng Thiện, Thành phố Hà Nội

---

> **Hướng dẫn sử dụng prompt này:**
> Đây là tài liệu đặc tả front-end đầy đủ cho Zalo Mini App phường Tùng Thiện. Mỗi mục được trình bày với đủ context để AI có thể thực thi trực tiếp mà không cần hỏi thêm. Khi làm việc theo từng phần, hãy copy đúng section tương ứng và cung cấp cho AI cùng với code hiện có.

Zalo OA id: 466824362060768554
Zalo Mini App id: 'your_id'

---

## PHẦN 0 – BỐI CẢNH VÀ QUY TẮC CHUNG

### 0.1. Mô tả dự án

Đây là Zalo Mini App chính thức của UBND phường Tùng Thiện (Thành phố Hà Nội), phục vụ người dân tương tác với chính quyền địa phương. Ứng dụng chạy hoàn toàn bên trong nền tảng Zalo, không yêu cầu cài đặt riêng. Đối tượng người dùng đa dạng lứa tuổi, đặc biệt ưu tiên trải nghiệm thân thiện với người cao tuổi.

### 0.2. Tech stack bắt buộc

```
- Runtime: React 18 + TypeScript
- UI Component: zmp-ui (ZaUI) – thư viện chính thức của Zalo
- SDK: zmp-sdk – giao tiếp với Zalo platform
- State management: Zustand
- Build tool: Vite (qua Zalo CLI)
- CSS: SCSS + CSS Variables của ZaUI (KHÔNG dùng Tailwind, KHÔNG import thư viện CSS ngoài)
- HTTP client: fetch API hoặc axios
- Router: ZMPRouter từ zmp-ui
```

### 0.3. Cấu trúc thư mục chuẩn của dự án

```
src/
├── pages/              # Mỗi màn hình là 1 file .tsx riêng
│   ├── index/          # Trang chủ
│   ├── news/           # Thông tin phường
│   ├── services/       # Dịch vụ công
│   ├── feedback/       # Phản ánh hiện trường
│   ├── booking/        # Đặt lịch tiếp dân
│   ├── rating/         # Đánh giá dịch vụ
│   ├── events/         # Sự kiện – Lễ hội
│   ├── heritage/       # Di tích lịch sử
│   ├── ihanoi/         # iHanoi (WebView)
│   ├── dvc/            # Dịch vụ công (WebView)
│   ├── vneid/          # VNeID (WebView)
│   ├── coming-soon/    # Placeholder "Đang phát triển"
│   └── profile/        # Thông tin cá nhân / lịch sử
├── components/         # Component dùng chung
│   ├── BottomNav.tsx
│   ├── PageHeader.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorState.tsx
│   └── ComingSoon.tsx
├── store/              # Zustand stores
│   ├── userStore.ts
│   ├── feedbackStore.ts
│   └── bookingStore.ts
├── services/           # Gọi API back-end
│   ├── api.ts          # Base axios/fetch config
│   ├── feedbackService.ts
│   ├── bookingService.ts
│   ├── newsService.ts
│   └── ratingService.ts
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Helpers
│   └── zaloHelper.ts   # Wrapper cho zmp-sdk
├── app.tsx             # Root component + Router config
└── app-config.json     # Zalo Mini App config
```

### 0.4. Quy tắc bắt buộc – AI PHẢI tuân thủ

1. **KHÔNG** import hoặc sử dụng bất kỳ thư viện UI nào ngoài `zmp-ui`. Không dùng MUI, Ant Design, shadcn, Chakra UI.
2. **KHÔNG** dùng `react-router-dom`. Chỉ dùng `ZMPRouter`, `Route`, `useNavigate` từ `zmp-ui`.
3. **KHÔNG** dùng `localStorage` hoặc `sessionStorage`. Zalo Mini App không hỗ trợ. Dùng Zustand store.
4. **KHÔNG** gọi trực tiếp `window.zmp.*`. Chỉ dùng các hàm được import từ `zmp-sdk`.
5. **LUÔN** wrap màn hình bằng component `<Page>` từ `zmp-ui`.
6. **LUÔN** xử lý trạng thái loading và error cho mọi API call. Không để màn hình trắng.
7. **LUÔN** dùng TypeScript – không dùng `any` trừ khi thực sự không tránh được.
8. Cỡ chữ tối thiểu: `14px`. Font weight body: `400`. Font weight tiêu đề: `600`.
9. Màu chủ đạo: `#0068FF` (xanh Zalo). Màu nền: `#F5F5F5`. Màu text chính: `#1A1A1A`.
10. Mọi màn hình đều phải responsive tốt trên màn hình 360px width (Android cũ).

### 0.5. Cách gọi Zalo SDK

```typescript
// utils/zaloHelper.ts
import { getUserInfo, getAccessToken, getPhoneNumber, openWebview } from 'zmp-sdk/apis';

export async function getZaloUserInfo() {
  const { userInfo } = await getUserInfo({ autoLogin: true });
  return userInfo; // { id, name, avatar }
}

export async function getZaloAccessToken(): Promise<string> {
  const { accessToken } = await getAccessToken();
  return accessToken;
}

export async function requestPhoneNumber(): Promise<string | null> {
  try {
    const { token } = await getPhoneNumber({ success: () => {}, fail: () => {} });
    return token; // Gửi token này lên back-end để back-end lấy số điện thoại
  } catch {
    return null;
  }
}

export function openExternalUrl(url: string, title: string) {
  openWebview({ url, title });
}
```

### 0.6. Base API config

```typescript
// services/api.ts
import { getAccessToken } from 'zmp-sdk/apis';

const BASE_URL = import.meta.env.VITE_API_URL; // VD: https://api.tungtthien.gov.vn

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = await getAccessToken();
  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
```

---

## PHẦN 1 – CẤU TRÚC ỨNG DỤNG VÀ ĐIỀU HƯỚNG

### Yêu cầu

Xây dựng khung ứng dụng với Bottom Navigation 4 tab và router cho toàn bộ màn hình.

### 1.1. app-config.json

```json
{
  "app": {
    "title": "Phường Tùng Thiện",
    "statusBarColor": "#0068FF",
    "actionBarColor": "#0068FF",
    "textColor": "#FFFFFF",
    "hideActionBar": false
  },
  "pages": [
    "pages/index/index",
    "pages/news/index",
    "pages/news/detail",
    "pages/services/index",
    "pages/feedback/index",
    "pages/feedback/create",
    "pages/feedback/detail",
    "pages/booking/index",
    "pages/booking/create",
    "pages/booking/history",
    "pages/rating/index",
    "pages/events/index",
    "pages/events/detail",
    "pages/heritage/index",
    "pages/heritage/detail",
    "pages/ihanoi/index",
    "pages/dvc/index",
    "pages/vneid/index",
    "pages/coming-soon/index",
    "pages/profile/index"
  ]
}
```

### 1.2. app.tsx – Root component

```
Tạo file app.tsx với các yêu cầu sau:
- Import App, ZMPRouter, Route từ 'zmp-ui'
- Bọc toàn bộ trong <App> (required bởi ZaUI)
- Khai báo tất cả <Route> tương ứng với pages trong app-config.json
- Route mặc định (path="/") dẫn đến pages/index/index
- Khởi tạo Zalo user info khi app mount: gọi getUserInfo() và lưu vào Zustand userStore
```

### 1.3. BottomNav.tsx

```
Tạo Bottom Navigation với 4 tab dùng component TabBar từ zmp-ui:

Tab 1 – Trang chủ:
  - Icon: home (dùng icon từ zmp-ui hoặc SVG inline)
  - Label: "Trang chủ"
  - Route: /

Tab 2 – Thông tin phường:
  - Icon: newspaper / document
  - Label: "Tin tức"
  - Route: /news

Tab 3 – Dịch vụ:
  - Icon: grid / apps
  - Label: "Dịch vụ"
  - Route: /services

Tab 4 – Cá nhân:
  - Icon: person / user
  - Label: "Cá nhân"
  - Route: /profile

Quy tắc:
- Active tab: màu #0068FF
- Inactive tab: màu #888888
- Nền TabBar: #FFFFFF
- Font size label: 11px
```

### 1.4. Component ComingSoon.tsx

```
Tạo component dùng chung hiển thị khi tính năng chưa phát triển.

Giao diện:
- Nền: #F5F5F5
- Icon minh hoạ (có thể dùng emoji 🚧 hoặc SVG đơn giản)
- Tiêu đề: "Đang phát triển"
- Mô tả: "Tính năng này đang được xây dựng và sẽ sớm ra mắt. Cảm ơn sự kiên nhẫn của bạn!"
- Nút "Quay lại" dùng Button từ zmp-ui, gọi navigate(-1)

Props: { title?: string } – cho phép override tiêu đề tính năng cụ thể
```

---

## PHẦN 2 – TRANG CHỦ (Home Screen)

### Yêu cầu

Xây dựng màn hình Home là điểm vào chính của ứng dụng. Hiển thị greeting người dùng, lưới phím tắt 12 tính năng, và banner tin tức nổi bật.

### 2.1. Bố cục tổng thể (từ trên xuống dưới)

```
1. Header bar: logo phường + tên "UBND Phường Tùng Thiện" (không dùng nút back)
2. Greeting card: "Xin chào, [Tên Zalo]!" + avatar tròn
3. Banner Swiper: 3 ảnh banner tin tức mới nhất (fetch từ API /news?featured=true&limit=3)
4. Section "Dịch vụ nổi bật": lưới 2 cột × 3 hàng = 6 ô icon (xem mục 2.2)
5. Section "Dịch vụ khác": lưới 2 cột × 3 hàng = 6 ô icon (xem mục 2.3)
6. Section "Tin tức mới nhất": list 3 card tin tức + nút "Xem thêm" → /news
```

### 2.2. Lưới "Dịch vụ nổi bật" – 6 ô

```
Mỗi ô gồm: icon SVG (48×48px) + label text bên dưới (12px, căn giữa)
Khoảng cách giữa các ô: 12px
Border-radius ô: 12px, nền #FFFFFF, shadow nhẹ

Ô 1 – Phản ánh hiện trường:
  Icon: 📣 (hoặc SVG loa phóng thanh)
  Label: "Phản ánh"
  Action: navigate('/feedback')

Ô 2 – Đặt lịch tiếp dân:
  Icon: 📅 (hoặc SVG lịch)
  Label: "Đặt lịch"
  Action: navigate('/booking')

Ô 3 – Dịch vụ công:
  Icon: 📋 (hoặc SVG hồ sơ)
  Label: "Dịch vụ công"
  Action: navigate('/dvc')  [→ WebView]

Ô 4 – Đánh giá dịch vụ:
  Icon: ⭐ (hoặc SVG ngôi sao)
  Label: "Đánh giá"
  Action: navigate('/rating')

Ô 5 – iHanoi:
  Icon: 🏙️ (hoặc logo iHanoi dạng SVG đơn giản)
  Label: "iHanoi"
  Action: navigate('/ihanoi')  [→ WebView]

Ô 6 – VNeID:
  Icon: 🪪 (hoặc SVG thẻ căn cước)
  Label: "VNeID"
  Action: navigate('/vneid')  [→ WebView]
```

### 2.3. Lưới "Dịch vụ khác" – 6 ô

```
Ô 1 – Tin tức phường:
  Icon: 📰
  Label: "Tin tức"
  Action: navigate('/news')

Ô 2 – Sự kiện – Lễ hội:
  Icon: 🎉
  Label: "Sự kiện"
  Action: navigate('/events')

Ô 3 – Di tích lịch sử:
  Icon: 🏛️
  Label: "Di tích"
  Action: navigate('/heritage')

Ô 4 – Giáo dục:
  Icon: 🎓
  Label: "Giáo dục"
  Action: navigate('/coming-soon', { title: 'Giáo dục' })
  [Hiển thị ComingSoon]

Ô 5 – Tra cứu quy hoạch:
  Icon: 🗺️
  Label: "Quy hoạch"
  Action: navigate('/coming-soon', { title: 'Tra cứu quy hoạch' })
  [Hiển thị ComingSoon]

Ô 6 – Bản đồ ẩm thực:
  Icon: 🍜
  Label: "Ẩm thực"
  Action: navigate('/coming-soon', { title: 'Bản đồ ẩm thực' })
  [Hiển thị ComingSoon]
```

### 2.4. API cần gọi

```typescript
// Lấy banner và tin nổi bật
GET /api/news?featured=true&limit=3
Response: { data: NewsItem[] }

// Lấy tin tức mới nhất
GET /api/news?limit=3&sort=createdAt:desc
Response: { data: NewsItem[] }

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  category: string;
  publishedAt: string; // ISO date string
  slug: string;
}
```

### 2.5. Trạng thái xử lý

```
- Khi đang fetch: hiển thị Skeleton loader (dùng Skeleton từ zmp-ui nếu có, hoặc tự tạo div với animation pulse)
- Khi lỗi: hiển thị text "Không thể tải tin tức. Kéo xuống để thử lại."
- Pull-to-refresh: wrap content bằng ScrollView có onRefresh prop
```

---

## PHẦN 3 – TRANG THÔNG TIN PHƯỜNG (Tin tức)

### Yêu cầu

Màn hình danh sách tin tức và thông báo của UBND phường. Dữ liệu lấy từ API back-end (back-end đọc từ Google Sheets CMS).

### 3.1. pages/news/index.tsx – Danh sách tin tức

```
Header: "Tin tức – Thông báo" với nút back

Tab phân loại (dùng Tabs từ zmp-ui):
- Tab "Tất cả"
- Tab "Tin tức"
- Tab "Thông báo"
- Tab "Văn bản"

Mỗi item trong list gồm:
- Thumbnail (80×80px, object-fit: cover, border-radius: 8px)
- Tiêu đề (14px, font-weight: 600, tối đa 2 dòng, overflow: ellipsis)
- Ngày đăng (12px, màu #888888, format: "DD/MM/YYYY")
- Category badge (tag nhỏ màu nền #E8F0FE, text màu #0068FF)

Phân trang: Load more khi scroll đến cuối (không dùng pagination số)
Mỗi page: 10 items

Khi nhấn item: navigate('/news/detail', truyền state { id: item.id })
```

### 3.2. pages/news/detail.tsx – Chi tiết tin tức

```
Header: tiêu đề rút gọn + nút back

Nội dung:
- Thumbnail đầy đủ chiều rộng (aspect ratio 16:9)
- Tiêu đề (18px, font-weight: 700)
- Meta: ngày đăng + category (12px, màu #888888)
- Divider
- Nội dung HTML (render bằng dangerouslySetInnerHTML, KHÔNG nhúng thêm CSS ngoài)
- Nút "Chia sẻ" ở cuối trang (dùng shareAppMessage từ zmp-sdk)
```

### 3.3. API cần gọi

```typescript
// Danh sách tin tức
GET /api/news?category=<all|tin-tuc|thong-bao|van-ban>&page=1&limit=10
Response: {
  data: NewsItem[];
  pagination: { page: number; totalPages: number; total: number }
}

// Chi tiết tin tức
GET /api/news/:id
Response: {
  data: {
    id: string;
    title: string;
    content: string; // HTML string
    thumbnailUrl: string;
    category: string;
    publishedAt: string;
    author?: string;
  }
}
```

---

## PHẦN 4 – DỊCH VỤ CÔNG (WebView)

### Yêu cầu

Tính năng này KHÔNG tự xây dựng giao diện riêng mà mở WebView đến cổng Dịch vụ công. Lý do: chưa có API kết nối chính thức, cần chờ cấp phép từ cơ quan quản lý.

### 4.1. pages/dvc/index.tsx

```
Logic duy nhất của màn hình này:
1. Khi component mount, gọi ngay openWebview() từ zmp-sdk
2. Hiển thị màn hình loading trong 1–2 giây trong khi WebView load
3. Nếu openWebview() thất bại (catch error), hiển thị thông báo lỗi + nút thử lại

Cấu hình WebView:
- url: "https://dichvucong.gov.vn" (URL chính thức Cổng DVC Quốc gia)
- title: "Dịch vụ công"
- extraInfo: { source: "tung-thien-miniapp" }  // tracking

Code mẫu:
import { openWebview } from 'zmp-sdk/apis';

useEffect(() => {
  openWebview({
    url: 'https://dichvucong.gov.vn',
    title: 'Dịch vụ công Quốc gia',
  });
}, []);

QUAN TRỌNG: Không tự build giao diện thủ tục hành chính. Không fetch API thủ tục.
Toàn bộ nội dung DVC được hiển thị trong WebView của Zalo.
```

---

## PHẦN 5 – iHANOI (WebView)

### Yêu cầu

Tương tự DVC, mở WebView đến cổng iHanoi. Không xây dựng giao diện riêng.

### 5.1. pages/ihanoi/index.tsx

```
Logic:
1. Khi mount, gọi openWebview() đến URL iHanoi
2. Hiển thị loading screen trong khi WebView khởi động
3. Xử lý lỗi nếu WebView fail

Cấu hình WebView:
- url: "https://ihanoi.gov.vn" (URL chính thức iHanoi)
- title: "iHanoi"

Ngoài việc mở WebView, màn hình này có thể hiển thị thêm:
- Card giới thiệu ngắn (2–3 dòng): "iHanoi là nền tảng số của Thành phố Hà Nội, 
  cung cấp dịch vụ hành chính và tiện ích cho người dân và doanh nghiệp."
- Nút CTA "Mở iHanoi" (Button primary từ zmp-ui) → gọi openWebview()

QUAN TRỌNG: Không fetch API iHanoi. Không hiển thị dữ liệu từ iHanoi trong Mini App.
```

---

## PHẦN 6 – VNeID (WebView)

### Yêu cầu

Mở WebView đến cổng VNeID. Không tích hợp OAuth hay deeplink vì cần phê duyệt từ C06 – Bộ Công an.

### 6.1. pages/vneid/index.tsx

```
Logic:
1. Khi mount, gọi openWebview() đến URL VNeID web
2. Hiển thị loading + thông báo ngắn về VNeID

Cấu hình WebView:
- url: "https://vneid.gov.vn" (URL cổng thông tin VNeID)
- title: "VNeID – Định danh điện tử"

Màn hình cũng hiển thị:
- Card thông tin: "VNeID là ứng dụng định danh điện tử quốc gia do Bộ Công an phát hành.
  Bạn cần cài đặt ứng dụng VNeID trên thiết bị để sử dụng đầy đủ tính năng."
- Nút "Tìm hiểu VNeID" → openWebview()

QUAN TRỌNG: Không tự build form nhập CCCD. Không gọi API xác thực. 
Đây là WebView thuần – mọi xác thực được xử lý bởi hệ thống VNeID.
```

---

## PHẦN 7 – PHẢN ÁNH HIỆN TRƯỜNG

### Yêu cầu

Người dân tạo phản ánh (kèm ảnh, vị trí GPS). Khi submit, front-end gọi API back-end. Back-end sẽ tự động gửi tin nhắn vào OA Manager của phường – front-end KHÔNG cần xử lý việc đó.

### 7.1. pages/feedback/index.tsx – Danh sách phản ánh

```
Header: "Phản ánh hiện trường" + nút "+" (icon plus) ở góc phải → navigate('/feedback/create')

Tabs:
- "Của tôi": danh sách phản ánh do người dùng hiện tại tạo
- "Đã giải quyết": filter status = 'resolved'

Mỗi item trong list:
- Badge trạng thái (màu sắc theo status):
    "Đang tiếp nhận"  → màu #FFA500 (cam)
    "Đang xử lý"      → màu #0068FF (xanh)
    "Đã chuyển đơn vị"→ màu #8B5CF6 (tím)
    "Đã giải quyết"   → màu #22C55E (xanh lá)
- Tiêu đề phản ánh (14px, font-weight: 600)
- Mã phản ánh (12px, màu #888888): VD "PA-2026-0042"
- Ngày tạo (12px)
- Thumbnail ảnh nhỏ (nếu có)

Khi nhấn item: navigate('/feedback/detail', { state: { id } })

Trạng thái rỗng: Icon minh hoạ + "Bạn chưa có phản ánh nào. Nhấn + để tạo mới."
```

### 7.2. pages/feedback/create.tsx – Tạo phản ánh mới

```
Header: "Tạo phản ánh" + nút "Hủy" (text button) ở trái → navigate(-1)

Form (theo thứ tự từ trên xuống):

[1] Tiêu đề *
    - Input từ zmp-ui
    - Placeholder: "Mô tả ngắn gọn vấn đề cần phản ánh"
    - maxLength: 100
    - Validation: bắt buộc, tối thiểu 10 ký tự

[2] Danh mục *
    - Select từ zmp-ui
    - Các lựa chọn:
        { value: 'ha-tang', label: 'Hạ tầng – Đường sá' }
        { value: 've-sinh', label: 'Vệ sinh môi trường' }
        { value: 'trat-tu', label: 'Trật tự đô thị' }
        { value: 'an-ninh', label: 'An ninh – Trật tự' }
        { value: 'khac', label: 'Vấn đề khác' }
    - Validation: bắt buộc

[3] Mô tả chi tiết *
    - Textarea từ zmp-ui
    - Placeholder: "Mô tả đầy đủ vấn đề bạn muốn phản ánh..."
    - maxLength: 1000
    - Hiển thị đếm ký tự: "X/1000"
    - Validation: bắt buộc, tối thiểu 20 ký tự

[4] Ảnh đính kèm (tùy chọn)
    - Tối đa 3 ảnh
    - Dùng chooseImage từ zmp-sdk (KHÔNG dùng <input type="file">)
    - Hiển thị preview thumbnail sau khi chọn (80×80px, border-radius: 8px)
    - Nút xóa ảnh (icon × ở góc thumbnail)
    - Code lấy ảnh:
        import { chooseImage } from 'zmp-sdk/apis';
        const { filePaths } = await chooseImage({ count: 3, sourceType: ['album', 'camera'] });

[5] Vị trí
    - Nút "Lấy vị trí hiện tại" (Button outline)
    - Dùng getLocation từ zmp-sdk:
        import { getLocation } from 'zmp-sdk/apis';
        const { latitude, longitude } = await getLocation({ type: 'wgs84' });
    - Sau khi lấy được: hiển thị text "📍 Đã xác định vị trí (lat: X, lng: Y)"
    - Nếu user từ chối quyền: hiển thị "Không thể lấy vị trí. Vui lòng nhập địa chỉ thủ công."
    - Input địa chỉ thủ công (hiển thị khi không lấy được GPS):
        Placeholder: "Nhập địa chỉ cụ thể..."

[6] Nút submit
    - Text: "Gửi phản ánh"
    - Button primary, full-width
    - Disabled khi đang loading hoặc form chưa hợp lệ
    - Loading state: hiển thị Spinner bên trong nút

Submit logic (front-end):
1. Validate form (hiển thị lỗi inline dưới mỗi field)
2. Upload ảnh lên server (POST /api/upload với FormData, trả về array URL)
3. POST /api/feedbacks với payload (xem API spec)
4. Khi thành công:
    - Hiển thị Modal thành công: "Phản ánh đã được gửi! Mã phản ánh: PA-XXXX"
    - Nút "Xem phản ánh của tôi" → navigate('/feedback', replace: true)
5. Khi thất bại:
    - Hiển thị Snackbar lỗi: "Gửi phản ánh thất bại. Vui lòng thử lại."
```

### 7.3. pages/feedback/detail.tsx – Chi tiết phản ánh

```
Header: "Chi tiết phản ánh" + nút back

Nội dung:
- Badge trạng thái (màu theo status như định nghĩa ở mục 7.1)
- Mã phản ánh: "PA-2026-XXXX"
- Tiêu đề (16px, font-weight: 700)
- Danh mục + Ngày tạo
- Divider
- Mô tả đầy đủ
- Ảnh đính kèm (nếu có): hiển thị dạng row, nhấn để xem full bằng ImageViewer từ zmp-ui
- Vị trí: hiển thị địa chỉ text (không cần map)
- Divider
- Section "Phản hồi từ phường" (nếu có):
    - Nội dung phản hồi
    - Ngày phản hồi
    - Tên cán bộ phụ trách (nếu có)
- Nếu chưa có phản hồi: "Đang được xem xét và xử lý..."
```

### 7.4. TypeScript types

```typescript
// types/index.ts
export type FeedbackStatus =
  | 'pending'       // Đang tiếp nhận
  | 'processing'    // Đang xử lý
  | 'transferred'   // Đã chuyển đơn vị
  | 'resolved';     // Đã giải quyết

export interface Feedback {
  id: string;
  code: string;        // VD: "PA-2026-0042"
  title: string;
  category: string;
  description: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  status: FeedbackStatus;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface CreateFeedbackPayload {
  title: string;
  category: string;
  description: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}
```

### 7.5. API cần gọi

```typescript
// Danh sách phản ánh của người dùng hiện tại
GET /api/feedbacks/me?status=<all|pending|processing|resolved>&page=1&limit=10
Headers: { Authorization: 'Bearer <zaloAccessToken>' }
Response: { data: Feedback[]; pagination: {...} }

// Chi tiết phản ánh
GET /api/feedbacks/:id
Response: { data: Feedback }

// Upload ảnh (gọi trước khi tạo phản ánh)
POST /api/upload
Body: FormData { files: File[] }
Response: { urls: string[] }

// Tạo phản ánh mới
POST /api/feedbacks
Body: CreateFeedbackPayload
Response: { data: Feedback }
```

---

## PHẦN 8 – ĐẶT LỊCH TIẾP DÂN

### Yêu cầu

Người dân đặt lịch hẹn gặp cán bộ phường. Khi submit, back-end gửi thông báo vào OA Manager và gửi ZNS về cho người dân – front-end chỉ cần gọi API và hiển thị kết quả.

### 8.1. pages/booking/index.tsx – Màn hình chính đặt lịch

```
Header: "Đặt lịch tiếp dân"

Bố cục:
- Banner thông tin: giờ tiếp dân (VD: "Thứ 2 – Thứ 6: 8:00 – 11:30 và 13:30 – 17:00")
  Background màu #E8F4FF, border-left 4px solid #0068FF
- Nút "Đặt lịch mới" (Button primary, full-width) → navigate('/booking/create')
- Divider với text "Lịch hẹn của bạn"
- List lịch hẹn của người dùng (xem 8.2)
```

### 8.2. List lịch hẹn trên trang index

```
Mỗi item:
- Ngày giờ hẹn (16px, font-weight: 700): "Thứ 3, 20/05/2026 – 9:00"
- Lĩnh vực: "Hộ tịch – Đăng ký khai sinh"
- Mã hẹn: "LH-2026-0015" (12px, màu #888888)
- Badge trạng thái:
    "Chờ xác nhận"  → màu #FFA500
    "Đã xác nhận"   → màu #22C55E
    "Từ chối"       → màu #EF4444
    "Đã dời lịch"   → màu #8B5CF6
    "Đã hoàn thành" → màu #888888
- Nút "Hủy lịch" (Button outline danger, nhỏ) – chỉ hiển thị khi status là 'confirmed' hoặc 'pending'
  + Khi nhấn: hiển thị Modal xác nhận "Bạn có chắc muốn hủy lịch hẹn này?" với 2 nút "Hủy" / "Xác nhận hủy"

Trạng thái rỗng: "Bạn chưa có lịch hẹn nào." + nút "Đặt lịch ngay"
```

### 8.3. pages/booking/create.tsx – Form đặt lịch mới

```
Header: "Đặt lịch mới" + nút "Hủy" ở trái

Form (theo thứ tự):

[1] Lĩnh vực cần tư vấn *
    - Select từ zmp-ui
    - Các lựa chọn:
        { value: 'ho-tich', label: 'Hộ tịch (khai sinh, khai tử, kết hôn...)' }
        { value: 'cu-tru', label: 'Cư trú (đăng ký tạm trú, thường trú...)' }
        { value: 'chung-thuc', label: 'Chứng thực giấy tờ' }
        { value: 'dat-dai', label: 'Đất đai – Xây dựng' }
        { value: 'xa-hoi', label: 'Chính sách xã hội' }
        { value: 'khac', label: 'Vấn đề khác' }
    - Validation: bắt buộc

[2] Ngày hẹn *
    - DatePicker từ zmp-ui
    - Chỉ cho chọn từ ngày mai trở đi (không chọn ngày hôm nay hoặc quá khứ)
    - Chỉ cho chọn thứ 2 – thứ 6 (disable thứ 7, chủ nhật)
    - Validation: bắt buộc

[3] Khung giờ mong muốn *
    - Select từ zmp-ui
    - Các lựa chọn:
        { value: '08:00', label: '8:00 – 8:30 sáng' }
        { value: '08:30', label: '8:30 – 9:00 sáng' }
        { value: '09:00', label: '9:00 – 9:30 sáng' }
        { value: '09:30', label: '9:30 – 10:00 sáng' }
        { value: '10:00', label: '10:00 – 10:30 sáng' }
        { value: '10:30', label: '10:30 – 11:00 sáng' }
        { value: '13:30', label: '13:30 – 14:00 chiều' }
        { value: '14:00', label: '14:00 – 14:30 chiều' }
        { value: '14:30', label: '14:30 – 15:00 chiều' }
        { value: '15:00', label: '15:00 – 15:30 chiều' }
        { value: '15:30', label: '15:30 – 16:00 chiều' }
        { value: '16:00', label: '16:00 – 16:30 chiều' }
        { value: '16:30', label: '16:30 – 17:00 chiều' }
    - Validation: bắt buộc
    - LƯU Ý: Đây chỉ là "khung giờ mong muốn". Cán bộ sẽ xác nhận giờ chính xác qua OA.
      Hiển thị note nhỏ: "* Giờ hẹn chính xác sẽ được cán bộ xác nhận qua Zalo."

[4] Nội dung cần tư vấn *
    - Textarea
    - Placeholder: "Mô tả ngắn gọn vấn đề bạn cần được tư vấn hoặc giải quyết..."
    - maxLength: 500
    - Validation: bắt buộc, tối thiểu 10 ký tự

[5] Họ tên người đến (tự động điền từ Zalo, có thể sửa)
    - Input
    - Mặc định: tên Zalo của người dùng (lấy từ userStore)
    - Cho phép người dùng sửa lại nếu đặt cho người thân

[6] Nút submit "Gửi yêu cầu đặt lịch"
    - Button primary, full-width
    - Loading state khi đang submit

Submit flow:
1. Validate tất cả các field
2. POST /api/bookings với payload
3. Khi thành công:
    - Modal thành công:
      Tiêu đề: "Đã gửi yêu cầu!"
      Nội dung: "Yêu cầu đặt lịch của bạn đã được gửi đến bộ phận tiếp dân.
                 Mã hẹn: [LH-XXXX]
                 Cán bộ sẽ xác nhận lịch qua tin nhắn Zalo trong thời gian sớm nhất."
      Nút: "Xem lịch hẹn của tôi" → navigate('/booking', replace: true)
4. Khi thất bại:
    - Snackbar lỗi cụ thể
```

### 8.4. TypeScript types

```typescript
export type BookingStatus =
  | 'pending'     // Chờ xác nhận
  | 'confirmed'   // Đã xác nhận
  | 'rejected'    // Từ chối
  | 'rescheduled' // Đã dời lịch
  | 'completed';  // Đã hoàn thành

export interface Booking {
  id: string;
  code: string;           // VD: "LH-2026-0015"
  field: string;          // lĩnh vực
  fieldLabel: string;     // label hiển thị
  preferredDate: string;  // ISO date
  preferredTime: string;  // "08:00"
  confirmedDate?: string;
  confirmedTime?: string;
  description: string;
  contactName: string;
  status: BookingStatus;
  rejectionReason?: string;
  rescheduledNote?: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  field: string;
  preferredDate: string;  // format: "YYYY-MM-DD"
  preferredTime: string;  // format: "HH:mm"
  description: string;
  contactName: string;
}
```

### 8.5. API cần gọi

```typescript
// Danh sách lịch hẹn của người dùng
GET /api/bookings/me?page=1&limit=10
Response: { data: Booking[]; pagination: {...} }

// Tạo lịch hẹn mới
POST /api/bookings
Body: CreateBookingPayload
Response: { data: Booking }

// Hủy lịch hẹn
DELETE /api/bookings/:id
Response: { success: true }
```

---

## PHẦN 9 – ĐÁNH GIÁ DỊCH VỤ CÔNG

### Yêu cầu

Người dân đánh giá mức độ hài lòng sau khi sử dụng dịch vụ hành chính. Back-end tự động gửi cảnh báo vào OA Manager khi đánh giá thấp – front-end không cần biết điều này.

### 9.1. pages/rating/index.tsx

```
Header: "Đánh giá dịch vụ"

Bố cục:
- Card giải thích: "Chia sẻ đánh giá của bạn về chất lượng phục vụ tại UBND phường
  để giúp chúng tôi cải thiện dịch vụ."

- Section "Đánh giá mới":
  Form đánh giá (xem 9.2)

- Divider

- Section "Thống kê đánh giá" (tóm tắt công khai):
  Fetch GET /api/ratings/summary
  Hiển thị:
  - Điểm trung bình tổng thể: "4.2 ⭐ (từ 128 đánh giá)"
  - Bar chart đơn giản (CSS thuần) cho từng mức sao: ████░ 5⭐: 78, ███░░ 4⭐: 32...
  - Không hiển thị nội dung đánh giá cụ thể của người khác (bảo mật)
```

### 9.2. Form đánh giá

```
[1] Thủ tục đã sử dụng
    - Select
    - Lựa chọn: giống danh mục lĩnh vực ở Đặt lịch (mục 8.3 [1])
    - Thêm option: { value: 'other', label: 'Thủ tục khác' }
    - Validation: bắt buộc

[2] Đánh giá theo tiêu chí
    Mỗi tiêu chí hiển thị dạng: [Label tiêu chí] + 5 icon sao (nhấn để chọn)
    Màu sao được chọn: #FFA500 (vàng cam). Chưa chọn: #E5E7EB (xám nhạt)
    Icon sao: dùng ký tự ★ (U+2605) cỡ 28px

    3 tiêu chí:
    a) "Thái độ phục vụ của cán bộ"  – required
    b) "Thời gian giải quyết hồ sơ"  – required
    c) "Kết quả giải quyết thủ tục"  – required

    Tự động tính điểm trung bình hiển thị real-time: "Điểm đánh giá: X.X / 5.0 ⭐"

[3] Nhận xét (tùy chọn)
    - Textarea
    - Placeholder: "Chia sẻ thêm ý kiến của bạn (không bắt buộc)..."
    - maxLength: 500

[4] Nút "Gửi đánh giá"
    - Button primary, full-width
    - Disabled khi chưa chọn đủ 3 tiêu chí bắt buộc

Submit flow:
1. POST /api/ratings với payload
2. Thành công: Snackbar "Cảm ơn bạn đã đánh giá!" + reset form
3. Thất bại: Snackbar lỗi
```

### 9.3. TypeScript types và API

```typescript
export interface CreateRatingPayload {
  procedure: string;          // lĩnh vực thủ tục
  attitudeScore: number;      // 1-5
  timelinessScore: number;    // 1-5
  outcomeScore: number;       // 1-5
  comment?: string;
}

// Gửi đánh giá
POST /api/ratings
Body: CreateRatingPayload
Response: { data: { id: string; averageScore: number } }

// Thống kê tóm tắt
GET /api/ratings/summary
Response: {
  data: {
    averageScore: number;
    totalCount: number;
    distribution: { stars: number; count: number }[];
  }
}
```

---

## PHẦN 10 – SỰ KIỆN – LỄ HỘI

### 10.1. pages/events/index.tsx

```
Header: "Sự kiện – Lễ hội"

Bố cục:
- Tabs: "Sắp diễn ra" | "Đang diễn ra" | "Đã qua"

Mỗi item:
- Thumbnail (aspect ratio 16:9, border-radius: 8px)
- Tiêu đề sự kiện (14px, font-weight: 600)
- Thời gian: "🕐 DD/MM/YYYY – HH:mm"
- Địa điểm: "📍 [Tên địa điểm]"
- Badge loại sự kiện (tag nhỏ): VD "Văn hóa" / "Thể thao" / "Hành chính"

Khi nhấn: navigate('/events/detail', { state: { id } })
```

### 10.2. pages/events/detail.tsx

```
Header: tên sự kiện (rút gọn) + nút back

Nội dung:
- Thumbnail đầy đủ chiều rộng
- Tiêu đề sự kiện (18px, font-weight: 700)
- Thông tin meta:
    🕐 Thời gian bắt đầu – kết thúc
    📍 Địa điểm (text)
    🏢 Đơn vị tổ chức
- Divider
- Mô tả chi tiết (dangerouslySetInnerHTML)
- Nếu có liên hệ đăng ký: hiển thị nút "Liên hệ đăng ký" → openPhoneDialer hoặc text số điện thoại
```

### 10.3. API và types

```typescript
export interface Event {
  id: string;
  title: string;
  description: string; // HTML
  thumbnailUrl: string;
  category: string;
  location: string;
  startAt: string;     // ISO datetime
  endAt: string;
  organizer: string;
  contactInfo?: string;
  status: 'upcoming' | 'ongoing' | 'past';
}

GET /api/events?status=<upcoming|ongoing|past>&page=1&limit=10
Response: { data: Event[]; pagination: {...} }

GET /api/events/:id
Response: { data: Event }
```

---

## PHẦN 11 – DI TÍCH LỊCH SỬ

### 11.1. pages/heritage/index.tsx

```
Header: "Di tích lịch sử"

Bố cục:
- SearchBar từ zmp-ui: tìm kiếm theo tên di tích
- List di tích dạng card:
    - Thumbnail (80×80px, object-fit: cover)
    - Tên di tích (14px, font-weight: 600)
    - Năm xếp hạng (nếu có): "Xếp hạng cấp tỉnh – 2008"
    - Tag loại: "Lịch sử" / "Kiến trúc" / "Văn hóa phi vật thể"

Khi nhấn: navigate('/heritage/detail', { state: { id } })
```

### 11.2. pages/heritage/detail.tsx

```
Header: tên di tích + nút back

Nội dung:
- ImageViewer (Swiper nhiều ảnh nếu có)
- Tên di tích (18px, font-weight: 700)
- Meta: Loại di tích | Năm xếp hạng | Tình trạng bảo tồn
- Divider
- Lịch sử và giá trị văn hóa (HTML content)
- Section "Thông tin tham quan" (nếu có):
    🕐 Giờ mở cửa
    📍 Địa chỉ
    📞 Liên hệ
- Không hiển thị bản đồ (tính năng bản đồ để đến giai đoạn sau)
```

### 11.3. API và types

```typescript
export interface Heritage {
  id: string;
  name: string;
  type: string;
  description: string; // HTML
  imageUrls: string[];
  address: string;
  rankingYear?: number;
  rankingLevel?: string;
  conservationStatus: string;
  openingHours?: string;
  contactInfo?: string;
}

GET /api/heritage?search=<query>&page=1&limit=20
Response: { data: Heritage[]; pagination: {...} }

GET /api/heritage/:id
Response: { data: Heritage }
```

---

## PHẦN 12 – CÁC TÍNH NĂNG "ĐANG PHÁT TRIỂN"

### Yêu cầu

Ba tính năng sau hiện chưa phát triển, chỉ hiển thị màn hình placeholder khi người dùng truy cập. Sử dụng component `ComingSoon` đã tạo ở Phần 1.

### 12.1. pages/coming-soon/index.tsx

```typescript
// Nhận params từ navigation state để hiển thị tên tính năng cụ thể
import { useSearchParams } from 'zmp-ui';

export default function ComingSoonPage() {
  const params = useSearchParams();
  const title = params.get('title') || 'Tính năng này';
  
  return (
    <Page>
      <PageHeader title={title} />
      <ComingSoon title={title} />
    </Page>
  );
}
```

**Ba tính năng sử dụng màn hình này:**
- **Giáo dục** – Action từ Home: `navigate('/coming-soon?title=Giáo dục')`
- **Tra cứu quy hoạch** – Action từ Home: `navigate('/coming-soon?title=Tra cứu quy hoạch')`
- **Bản đồ ẩm thực** – Action từ Home: `navigate('/coming-soon?title=Bản đồ ẩm thực')`

---

## PHẦN 13 – TRANG CÁ NHÂN (Profile)

### 13.1. pages/profile/index.tsx

```
Header: "Cá nhân"

Bố cục:
- Card thông tin người dùng:
    - Avatar tròn (60×60px) từ Zalo
    - Tên Zalo (16px, font-weight: 700)
    - Trạng thái: "Đã đăng nhập qua Zalo"

- Section "Lịch sử của tôi":
    - Item "Phản ánh của tôi" → navigate('/feedback')
    - Item "Lịch hẹn của tôi" → navigate('/booking')
    - Item "Đánh giá đã gửi" → navigate('/rating') (scroll đến form đánh giá)

- Section "Thông tin phường":
    - Item "Liên hệ UBND phường" → hiển thị Modal với thông tin liên hệ
    - Item "Giới thiệu ứng dụng" → hiển thị Modal với version + thông tin

- Section "Liên hệ hỗ trợ":
    Item duy nhất: "Gọi cho bộ phận hỗ trợ"
    Số điện thoại: hiển thị text, khi nhấn dùng openPhone từ zmp-sdk

Modal thông tin liên hệ:
- Tên: UBND Phường Tùng Thiện
- Địa chỉ: [địa chỉ thực tế của phường]
- Điện thoại: [số điện thoại]  
- Giờ làm việc: Thứ 2 – Thứ 6: 7:30 – 11:30 và 13:00 – 17:00
- Zalo OA: [tên OA phường]
```

---

## PHẦN 14 – ZUSTAND STORES

### 14.1. store/userStore.ts

```typescript
import { create } from 'zustand';

interface ZaloUserInfo {
  id: string;
  name: string;
  avatar: string;
}

interface UserStore {
  userInfo: ZaloUserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  setUserInfo: (info: ZaloUserInfo) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: null,
  accessToken: null,
  isLoading: false,
  setUserInfo: (info) => set({ userInfo: info }),
  setAccessToken: (token) => set({ accessToken: token }),
  setLoading: (loading) => set({ isLoading: loading }),
  clear: () => set({ userInfo: null, accessToken: null }),
}));
```

### 14.2. store/feedbackStore.ts

```typescript
import { create } from 'zustand';
import { Feedback, CreateFeedbackPayload } from '../types';

interface FeedbackStore {
  feedbacks: Feedback[];
  currentFeedback: Feedback | null;
  isLoading: boolean;
  error: string | null;
  setFeedbacks: (items: Feedback[]) => void;
  setCurrentFeedback: (item: Feedback | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  appendFeedbacks: (items: Feedback[]) => void; // dùng cho load more
}
```

### 14.3. store/bookingStore.ts

```typescript
import { create } from 'zustand';
import { Booking } from '../types';

interface BookingStore {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  setBookings: (items: Booking[]) => void;
  setCurrentBooking: (item: Booking | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  removeBooking: (id: string) => void; // dùng khi hủy lịch
}
```

---

## PHẦN 15 – XỬ LÝ TRẠNG THÁI CHUNG

### 15.1. Component LoadingSpinner.tsx

```tsx
// Hiển thị khi đang tải dữ liệu, dùng trong toàn bộ ứng dụng
// Sử dụng Spinner từ zmp-ui
// Props: { message?: string } – VD: "Đang tải..."
// Bố cục: căn giữa màn hình, icon spinner + text bên dưới
```

### 15.2. Component ErrorState.tsx

```tsx
// Hiển thị khi API lỗi
// Props: { message: string; onRetry?: () => void }
// Bố cục:
//   - Icon cảnh báo (⚠️ hoặc SVG)
//   - Text lỗi
//   - Nút "Thử lại" (Button outline) – chỉ hiển thị khi onRetry được truyền vào
```

### 15.3. Xử lý lỗi mạng toàn cục

```typescript
// Trong services/api.ts, xử lý các mã lỗi phổ biến:
// 401 → Xóa token, điều hướng về màn hình chính, hiển thị Snackbar "Phiên đăng nhập hết hạn"
// 404 → Throw Error("Không tìm thấy dữ liệu")
// 500 → Throw Error("Hệ thống đang bảo trì. Vui lòng thử lại sau.")
// Network error → Throw Error("Không có kết nối internet.")
```

---

## PHẦN 16 – BIẾN MÔI TRƯỜNG VÀ CẤU HÌNH

### 16.1. .env.development

```
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
```

### 16.2. .env.production

```
VITE_API_URL=https://api.tungtthien-phuong.gov.vn
VITE_APP_ENV=production
```

### 16.3. Lưu ý khi chạy development

```
- Chạy: npx zmp-cli start
- Mở localhost:3000 trong trình duyệt để xem UI (không có Zalo context)
- Các API zmp-sdk như getUserInfo() sẽ trả về mock data khi chạy trên browser
- Để test đầy đủ trên thiết bị: npx zmp-cli deploy → scan QR bằng Zalo
```

---

## PHỤ LỤC – THỨ TỰ PHÁT TRIỂN KHUYẾN NGHỊ

Thực hiện theo thứ tự sau để tránh phụ thuộc vòng tròn:

```
Bước 1: Phần 0 – Setup tech stack, cấu trúc thư mục, cài packages
Bước 2: Phần 14 – Tạo Zustand stores
Bước 3: Phần 0.5 + 0.6 – Tạo zaloHelper.ts và api.ts
Bước 4: Phần 1 – app.tsx, BottomNav, ComingSoon component
Bước 5: Phần 15 – LoadingSpinner, ErrorState
Bước 6: Phần 2 – Trang chủ (cần store và components từ bước 4–5)
Bước 7: Phần 3 – Trang tin tức
Bước 8: Phần 4, 5, 6 – DVC, iHanoi, VNeID (WebView – đơn giản)
Bước 9: Phần 7 – Phản ánh hiện trường (phức tạp nhất, để sau khi quen)
Bước 10: Phần 8 – Đặt lịch tiếp dân
Bước 11: Phần 9 – Đánh giá dịch vụ
Bước 12: Phần 10, 11 – Sự kiện, Di tích
Bước 13: Phần 12 – Coming Soon pages
Bước 14: Phần 13 – Profile
Bước 15: Kiểm thử E2E toàn bộ luồng quan trọng nhất:
  - Tạo phản ánh → kiểm tra OA Manager nhận được
  - Đặt lịch → kiểm tra ZNS gửi về
  - Đánh giá 1 sao → kiểm tra OA Manager nhận cảnh báo
```
