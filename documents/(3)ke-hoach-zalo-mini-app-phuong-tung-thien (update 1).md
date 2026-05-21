# KẾ HOẠCH
## NGHIÊN CỨU, XÂY DỰNG VÀ TRIỂN KHAI ỨNG DỤNG ZALO MINI APP
## PHỤC VỤ CÔNG TÁC CHUYỂN ĐỔI SỐ
### TẠI UBND PHƯỜNG TÙNG THIỆN, THÀNH PHỐ HÀ NỘI

---

**Đơn vị thực hiện:** Phòng Văn hoá – Xã hội, UBND phường Tùng Thiện  
**Bộ phận phụ trách:** Khoa học Công nghệ và Chuyển đổi số  
**Thời gian thực hiện:** 16 tuần (khoảng 4 tháng)  
**Phiên bản tài liệu:** 1.0  
**Ngày lập:** Tháng 4 năm 2026  

---

## I. MỤC ĐÍCH, YÊU CẦU

### 1. Mục đích

- **Đẩy mạnh cải cách hành chính, xây dựng chính quyền điện tử, chính quyền số tại cơ sở:** Triển khai Zalo Mini App là một trong những bước đi cụ thể, thiết thực nhằm hiện đại hóa phương thức phục vụ nhân dân, góp phần thực hiện Nghị quyết số 36-NQ/TW của Ban Chấp hành Trung ương, Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030 và Kế hoạch chuyển đổi số của Thành phố Hà Nội.

- **Tạo kênh tương tác trực tiếp, nhanh chóng và thuận tiện giữa UBND phường với người dân thông qua hệ sinh thái Zalo:** Với hơn 77 triệu người dùng tại Việt Nam, nền tảng Zalo là kênh liên lạc phổ biến và quen thuộc với đại bộ phận nhân dân. Việc xây dựng Mini App trên nền tảng này cho phép người dân tiếp cận thông tin và dịch vụ công mà không cần cài đặt thêm ứng dụng mới, qua đó giảm thiểu rào cản kỹ thuật, đặc biệt với nhóm người dùng cao tuổi hoặc không quen với công nghệ.

- **Tích hợp toàn diện các dịch vụ tiện ích thiết yếu vào một nền tảng duy nhất, giảm thiểu các thủ tục rườm rà:** Ứng dụng sẽ hợp nhất các tính năng thông tin – hành chính – tương tác vào một giao diện duy nhất, giúp người dân không phải truy cập nhiều website hay sử dụng nhiều ứng dụng khác nhau để thực hiện các nhu cầu liên quan đến chính quyền địa phương.

### 2. Yêu cầu

- **Đảm bảo tính bảo mật thông tin tuyệt đối theo quy định của Luật An ninh mạng:** Toàn bộ hệ thống phải tuân thủ Luật An ninh mạng số 24/2018/QH14, Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, và các quy định của Bộ Thông tin và Truyền thông. Dữ liệu người dân không được lưu trữ ngoài lãnh thổ Việt Nam; toàn bộ luồng truyền thông tin phải được mã hóa.

- **Giao diện thân thiện, dễ sử dụng cho mọi tầng lớp nhân dân, đặc biệt đối với người cao tuổi:** Thiết kế tuân theo nguyên tắc UX đơn giản, cỡ chữ đủ lớn, màu sắc tương phản cao, điều hướng trực quan, hạn chế tối đa số bước thao tác để hoàn thành một tác vụ. Có hỗ trợ hướng dẫn sử dụng ngay trong ứng dụng.

- **Tích hợp đồng bộ dữ liệu với các hệ thống hiện hành của Thành phố và Quận:** Ứng dụng phải kết nối được với hệ thống iHanoi, Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn), VNeID, hệ thống phản ánh hiện trường và các cơ sở dữ liệu do cơ quan cấp trên quản lý thông qua API chuẩn được cấp phép.

---

## II. MÔ TẢ CHI TIẾT CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

Mini App được cấu trúc thành các nhóm chức năng chính, phân bổ hợp lý trên giao diện chính (Home Screen) và thanh điều hướng (Bottom Navigation).

---

### 2.1. Tích hợp VNeID (webview)

**Mô tả:** Cho phép người dân xác thực danh tính thông qua ứng dụng VNeID của Bộ Công an trước khi sử dụng các dịch vụ yêu cầu định danh (nộp hồ sơ hành chính, đặt lịch tiếp dân, v.v.).

**Luồng xử lý:**
1. Người dùng chọn tính năng yêu cầu định danh.
2. Ứng dụng điều hướng sang VNeID để xác thực (thông qua deep link hoặc OAuth2 được Bộ Công an cung cấp).
3. Sau khi xác thực thành công, VNeID trả token về Mini App.
4. Mini App lưu trữ phiên xác thực an toàn (session token) trong thời gian quy định.
5. Các thao tác tiếp theo trong phiên không yêu cầu xác thực lại.

**Lưu ý:** Việc tích hợp VNeID phải được phê duyệt bởi Cục Cảnh sát Quản lý hành chính về Trật tự Xã hội (C06) – Bộ Công an theo quy trình kết nối Cơ sở dữ liệu quốc gia về dân cư.

---

### 2.2. Dịch vụ công (webview)

**Mô tả:** Cung cấp danh mục các thủ tục hành chính của phường được phép tiếp nhận trực tuyến, liên kết đến Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn) hoặc Cổng Dịch vụ công Thành phố Hà Nội (dichvucong.hanoi.gov.vn).

**Chức năng cụ thể:**
- Hiển thị danh sách thủ tục hành chính theo nhóm (hộ tịch, cư trú, chứng thực, đất đai, xây dựng…).
- Xem hướng dẫn thực hiện, thành phần hồ sơ, lệ phí, thời gian giải quyết từng thủ tục.
- Nút "Nộp hồ sơ trực tuyến" chuyển hướng sang Cổng Dịch vụ công tương ứng (liên kết WebView hoặc deep link).
- Tra cứu tiến độ xử lý hồ sơ bằng mã số hồ sơ.
- Nhận thông báo tự động qua Zalo OA khi hồ sơ thay đổi trạng thái.

---

### 2.3. Phản ánh hiện trường

**Mô tả:** Kênh tiếp nhận phản ánh, kiến nghị của người dân về các vấn đề trên địa bàn phường (hạ tầng xuống cấp, vệ sinh môi trường, trật tự đô thị, v.v.), tích hợp với hệ thống phản ánh hiện trường của Thành phố Hà Nội.

**Luồng xử lý sau khi người dân submit form:**
1. Người dân điền form phản ánh (tiêu đề, mô tả, ảnh) và nhấn "Gửi phản ánh".
2. Back-end tiếp nhận, lưu phản ánh vào CSDL, cấp mã phản ánh tự động.
3. **Back-end gọi Zalo OA API gửi tin nhắn tư vấn vào hộp thư OA Manager** của phường, nội dung bao gồm: mã phản ánh, họ tên người gửi, nội dung, ảnh đính kèm, địa chỉ.
4. Cán bộ trực OA Manager nhận thông báo tức thì trên điện thoại, xem xét và phân công xử lý.
5. Cán bộ phản hồi trực tiếp trong OA Manager → Back-end nhận qua Webhook → cập nhật trạng thái phản ánh trong CSDL.
6. Hệ thống tự động gửi ZNS thông báo tiến độ đến người dân.

**Chức năng cụ thể:**
- Giao diện tạo phản ánh với các trường: tiêu đề, mô tả, chụp ảnh.
- Hiển thị trạng thái phản ánh đã gửi: Đang tiếp nhận / Đang xử lý / Đã chuyển đơn vị / Đã giải quyết.
- Nhận thông báo ZNS khi phản ánh được cập nhật trạng thái.
- Xem lịch sử toàn bộ phản ánh của cá nhân kèm trạng thái và phản hồi.
- Liên kết hoặc đồng bộ với hệ thống dichvucong.hanoi.gov.vn mục "Phản ánh kiến nghị" nếu được cấp API.

---

### 2.4. Đánh giá dịch vụ công

**Mô tả:** Cho phép người dân đánh giá mức độ hài lòng sau khi sử dụng dịch vụ hành chính công tại phường, phục vụ công tác kiểm tra, giám sát chất lượng phục vụ.

**Luồng xử lý sau khi người dân submit form:**
1. Người dân chấm điểm và điền nhận xét, nhấn "Gửi đánh giá".
2. Back-end lưu kết quả đánh giá vào CSDL, gắn nhãn thời gian và mã thủ tục liên quan.
3. **Nếu đánh giá có sao thấp (1–2 sao) hoặc nhận xét tiêu cực**, back-end tự động gửi tin nhắn cảnh báo vào OA Manager để lãnh đạo phường nắm bắt ngay, kèm nội dung nhận xét của người dân.
4. Tất cả đánh giá được tổng hợp thống kê tự động theo tuần/tháng.

**Chức năng cụ thể:**
- Giao diện đánh giá 5 sao + nhận xét văn bản tự do.
- Đánh giá theo từng tiêu chí: thái độ tiếp đón, thời gian giải quyết, kết quả thực hiện.
- Kết quả tổng hợp hiển thị công khai dưới dạng báo cáo thống kê theo tháng/quý trên trang thông tin phường.
- Cán bộ phụ trách theo dõi tổng hợp đánh giá qua OA Manager (thống kê & báo cáo).
- Tích hợp với hệ thống đánh giá hài lòng quốc gia (dichvucong.gov.vn) nếu được cấp quyền truy cập API.

---

### 2.5. iHanoi (pending để phát triển sau)

**Mô tả:** Tích hợp hoặc liên kết nhanh đến ứng dụng iHanoi – nền tảng số của Thành phố Hà Nội phục vụ người dân và doanh nghiệp.

**Chức năng cụ thể:**
- Nút truy cập nhanh iHanoi từ màn hình chính của Mini App.
- Hiển thị các thông báo, tin tức, chính sách mới từ Thành phố được đồng bộ qua API iHanoi (nếu được cấp quyền).
- Hướng dẫn đăng ký, kích hoạt tài khoản iHanoi cho người dân chưa đăng ký.

---

### 2.6. Giáo dục (pending để phát triển sau)

**Mô tả:** Cung cấp thông tin và tiện ích liên quan đến giáo dục trên địa bàn phường Tùng Thiện.

**Chức năng cụ thể:**
- Danh sách các cơ sở giáo dục mầm non, tiểu học trên địa bàn phường (tên, địa chỉ, số điện thoại, bản đồ chỉ đường).
- Thông báo tuyển sinh đầu cấp, lịch khai giảng, các sự kiện giáo dục.
- Tra cứu thông tin học bổng, hỗ trợ học phí, chính sách xã hội hóa giáo dục.
- Cập nhật kết quả phổ cập giáo dục, xóa mù chữ trên địa bàn phường (thông tin công khai).

---

### 2.7. Tra cứu quy hoạch (pending để phát triển sau)

**Mô tả:** Cung cấp thông tin quy hoạch đất đai, quy hoạch xây dựng trên địa bàn phường Tùng Thiện thông qua kết nối với hệ thống thông tin đất đai của Sở Tài nguyên và Môi trường Hà Nội.

**Chức năng cụ thể:**
- Giao diện bản đồ số tương tác hiển thị phân vùng quy hoạch (đất ở, đất nông nghiệp, đất thương mại dịch vụ, đất dự án…).
- Tra cứu thông tin thửa đất theo địa chỉ hoặc bằng cách chạm vào bản đồ.
- Hiển thị thông tin quy hoạch: loại đất, diện tích, hệ số sử dụng đất, thông tin dự án (nếu có).
- Tích hợp WebView hoặc API từ cổng thông tin quy hoạch Hà Nội (qhkt.hanoi.gov.vn) theo phân cấp dữ liệu được cấp phép.
- Nút liên hệ bộ phận một cửa để được giải đáp thêm.

---

### 2.8. Trang thông tin điện tử phường Tùng Thiện (WebView)

**Mô tả:** Kênh thông tin chính thức của UBND phường trực tiếp trên Mini App, là đầu mối cung cấp thông tin tuyên truyền, chính sách, thông báo nội bộ.

**Chức năng cụ thể:**
- Tin tức – thông báo: Văn bản pháp quy, nghị quyết, quyết định của phường; tin hoạt động Đảng ủy – HĐND – UBND – MTTQ.
- Giới thiệu tổ chức: Sơ đồ cơ cấu tổ chức bộ máy, thông tin liên hệ cán bộ, lãnh đạo phường.
- Lịch tiếp công dân, lịch hội nghị công khai.
- Văn bản: Danh mục văn bản ban hành, tải xuống văn bản định dạng PDF.
- Công khai ngân sách, thu chi tài chính phường theo quy định.
- Tích hợp với website phường hoặc cổng thông tin Quận thông qua RSS Feed / REST API.

---

### 2.9. Di tích lịch sử (grid view)

**Mô tả:** Giới thiệu, quảng bá các di tích lịch sử, văn hóa trên địa bàn phường Tùng Thiện, góp phần bảo tồn và phát huy giá trị văn hóa địa phương.

**Chức năng cụ thể:**
- Danh sách di tích được xếp hạng và chưa xếp hạng trên địa bàn.
- Thông tin chi tiết từng di tích: lịch sử hình thành, giá trị văn hóa, hình ảnh tư liệu, tình trạng bảo tồn.
- Bản đồ chỉ đường tới di tích.
- Thông tin liên hệ ban quản lý di tích (nếu có), lịch mở cửa.
- Gợi ý hành trình tham quan kết hợp với các điểm ẩm thực, lễ hội trên địa bàn.

---

### 2.10. Sự kiện – Lễ hội

**Mô tả:** Cung cấp thông tin cập nhật về các sự kiện chính trị, văn hóa, thể thao, lễ hội truyền thống trên địa bàn phường và Thành phố.

**Chức năng cụ thể:**
- Lịch sự kiện theo dạng calendar view / danh sách.
- Chi tiết sự kiện: thời gian, địa điểm, chương trình, đơn vị tổ chức, liên hệ.
- Chức năng nhắc nhở sự kiện (Reminder) thông qua thông báo Zalo OA.
- Chia sẻ thông tin sự kiện ra ngoài Zalo (nhắn tin, đăng bài).
- Hình ảnh và video clip hoạt động lễ hội, sự kiện.

---

### 2.11. Bản đồ ẩm thực (pending để triển khai sau)

**Mô tả:** Xây dựng bản đồ số giới thiệu các điểm ẩm thực đặc trưng, các quán ăn được đánh giá tốt trên địa bàn phường Tùng Thiện, hỗ trợ phát triển kinh tế địa phương và phục vụ khách vãng lai.

**Chức năng cụ thể:**
- Bản đồ tương tác hiển thị vị trí các điểm ẩm thực.
- Thông tin từng điểm: tên, địa chỉ, món đặc trưng, giờ mở cửa, số điện thoại, hình ảnh.
- Bộ lọc theo loại hình (bún phở, cơm, đặc sản, cà phê, bánh ngọt…).
- Tích hợp đánh giá và bình luận của người dùng.
- Cập nhật nội dung thông qua CMS phía back-end, do cán bộ phụ trách kiểm duyệt.

---

### 2.12. Đặt lịch tiếp dân

**Mô tả:** Cho phép người dân đăng ký lịch hẹn gặp cán bộ, lãnh đạo UBND phường hoặc bộ phận một cửa thông qua ứng dụng, tránh tình trạng chờ đợi và tập trung đông người.

**Luồng xử lý sau khi người dân submit form:**
1. Người dân điền form (lĩnh vực cần tư vấn, ngày/giờ mong muốn, mô tả nội dung), xác thực danh tính qua Zalo, nhấn "Đặt lịch".
2. Back-end kiểm tra lịch trống, lưu yêu cầu đặt lịch vào CSDL với trạng thái "Chờ xác nhận".
3. **Back-end gọi Zalo OA API gửi tin nhắn tư vấn vào hộp thư OA Manager** của cán bộ Một cửa phụ trách, nội dung đầy đủ: họ tên người dân, số điện thoại Zalo, lĩnh vực, thời gian đề xuất, nội dung cần gặp.
4. Người dân nhận ZNS xác nhận "Đã tiếp nhận yêu cầu, đang chờ cán bộ phê duyệt".
5. Cán bộ Một cửa xem yêu cầu trong OA Manager, chọn **Xác nhận** (kèm giờ chính xác) hoặc **Từ chối / Đề xuất dời lịch**.
6. Cán bộ reply tin nhắn trong OA Manager → Back-end nhận qua OA Webhook → cập nhật CSDL.
7. Hệ thống tự động gửi ZNS thông báo kết quả đến người dân (xác nhận lịch hẹn kèm địa điểm, hoặc lý do từ chối/dời lịch).
8. Nhắc nhở tự động qua ZNS: trước 24 giờ và trước 1 giờ khi đến lịch hẹn.

**Chức năng bổ trợ:**
- Hiển thị lịch trống theo thời gian thực (lấy từ CSDL).
- Người dân có thể hủy lịch trước thời hạn quy định (tối thiểu 2 giờ trước giờ hẹn).
- Xem lịch sử các lượt đặt lịch của cá nhân.

---

## III. GIẢI PHÁP KỸ THUẬT VÀ KIẾN TRÚC HỆ THỐNG

### 3.1. Lựa chọn nền tảng và Framework phát triển

#### 3.1.1. Về Framework Front-end

Căn cứ tài liệu chính thức tại [mini.zalo.me](https://mini.zalo.me) và [miniapp.zaloplatforms.com](https://miniapp.zaloplatforms.com), hiện tại nền tảng Zalo Mini App đang khuyến khích phát triển theo hướng:

- **ZaUI (Zalo App UI)** kết hợp **React.js** là bộ thư viện giao diện chính thức được Zalo duy trì tích cực, với bộ component library (`zmp-ui` phiên bản mới nhất, hiện tại là 1.11.x) được cập nhật liên tục. Đây là lựa chọn **chính thức và được khuyến nghị** để phát triển ứng dụng.

- **Lưu ý về ZMP Framework:** Qua khảo sát thực tế, ZMP Framework (framework thuần Zalo thuở ban đầu) hiện đã không còn được Zalo chủ động phát triển và hỗ trợ tài liệu mới. Các tutorial cũ sử dụng ZMP đã bị đánh dấu "out of date" bởi chính Zalo. Nền tảng hiện tại chuyển hoàn toàn sang hướng **React.js + ZaUI + `zmp-sdk`** (bộ SDK đã được cải tiến, hỗ trợ tree-shaking, import theo nhu cầu). Vì vậy, dự án này sẽ **không sử dụng ZMP Framework** mà áp dụng stack kỹ thuật hiện đại.

**Stack kỹ thuật Front-end được lựa chọn:**

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| UI Framework | React.js 18+ | Bắt buộc để dùng ZaUI |
| UI Component | `zmp-ui` (ZaUI) | Bộ component chính thức của Zalo |
| SDK | `zmp-sdk` | API tương tác với Zalo platform |
| State Management | Zustand | Nhẹ, đơn giản, ít boilerplate |
| Build Tool | Vite | Được Zalo CLI hỗ trợ mặc định |
| Ngôn ngữ | TypeScript | Đảm bảo type safety |
| CSS | SCSS + CSS Variables của ZaUI | Không cần thêm thư viện CSS ngoài |
| Bản đồ | Google Maps JS API (WebView) | Cho module quy hoạch, ẩm thực |

#### 3.1.2. Về ZaUI Component Library

Bộ ZaUI cung cấp các component dựng sẵn đã được tối ưu cho môi trường Zalo, bao gồm:
- **Điều hướng:** `TabBar`, `Header`, `Page`, `ZMPRouter` – dùng để xây dựng cấu trúc điều hướng Bottom Navigation và page routing.
- **Form và Input:** `Input`, `Select`, `DatePicker`, `Checkbox`, `Radio`, `Textarea` – dùng cho form đặt lịch, phản ánh, đánh giá.
- **Hiển thị dữ liệu:** `List`, `Card`, `Swiper`, `ImageViewer` – dùng cho tin tức, di tích, lễ hội.
- **Phản hồi:** `Modal`, `Sheet`, `Snackbar`, `Spinner` – dùng cho xác nhận thao tác, thông báo kết quả.
- **Bản đồ:** Tích hợp WebView component hoặc Zalo Maps API cho module quy hoạch và ẩm thực.
- **Xác thực:** API `getAccessToken()`, `getUserInfo()`, `getPhoneNumber()` từ `zmp-sdk` để lấy thông tin người dùng Zalo đã đăng nhập.

---

### 3.2. Kiến trúc hệ thống Back-end – Tinh gọn và thực tiễn

Xuất phát từ quy mô triển khai cấp phường với đội ngũ kỹ thuật nhỏ, kiến trúc back-end được thiết kế theo nguyên tắc **tối giản – đủ dùng – dễ bảo trì**, ưu tiên tận dụng tối đa các công cụ sẵn có của hệ sinh thái Zalo (OA, Webhook, ZNS) thay vì xây dựng hạ tầng phức tạp không cần thiết.

#### 3.2.1. Sơ đồ kiến trúc tổng thể

```
┌───────────────────────────────────────────────────────────────┐
│                      ZALO PLATFORM                            │
│     Mini App (React + ZaUI)  │  Zalo OA  │  ZNS / Webhook     │
└──────────────┬────────────────┴─────┬─────┴─────────┬─────────┘
               │ HTTPS                │ Webhook POST  │ ZNS API
               ▼                      ▼               ▼
┌───────────────────────────────────────────────────────────────┐
│              BACK-END ĐƠN GIẢN (1 máy chủ VPS)                │
│                                                               │
│   Node.js + Express  ──────────────────────────────────────   │
│   (REST API + Webhook Handler)                                │
│                         │                                     │
│              ┌──────────┴──────────┐                          │
│              ▼                     ▼                          │
│        PostgreSQL            Cloudinary / S3                  │
│    (Dữ liệu chính)          (Lưu trữ ảnh, file)               │
└──────────────┬────────────────────────────────────────────────┘
               │ Gọi API tích hợp
┌──────────────▼────────────────────────────────────────────────┐
│              HỆ THỐNG BÊN NGOÀI                               │
│   VNeID API  │  DVC Quốc gia / HN  │  iHanoi  │  Quy hoạch HN │
└───────────────────────────────────────────────────────────────┘
```

**Triết lý thiết kế:** Toàn bộ back-end chạy trên **một máy chủ VPS duy nhất** với kiến trúc **monolith đơn giản** (Node.js + Express). Không sử dụng microservice hay kiến trúc phân tán vì quy mô ứng dụng cấp phường không đòi hỏi độ phức tạp đó. Khi cần nâng cấp trong tương lai, có thể tách module dần dần.

#### 3.2.2. Lựa chọn công nghệ Back-end

| Thành phần | Công nghệ | Lý do lựa chọn |
|---|---|---|
| Runtime | Node.js 20 LTS | Đồng bộ với front-end TypeScript, cộng đồng lớn |
| Framework | Express.js | Đơn giản, nhẹ, dễ học, phù hợp nhóm nhỏ |
| Ngôn ngữ | TypeScript | Type safety, dễ bảo trì dài hạn |
| ORM | Prisma | Dễ dùng, schema rõ ràng, migration tự động |
| Cơ sở dữ liệu | PostgreSQL 16 | Ổn định, miễn phí, phù hợp dữ liệu quan hệ |
| Lưu trữ file | Cloudinary hoặc MinIO tự host | Lưu ảnh phản ánh, ảnh sự kiện, tài liệu |
| Xác thực | JWT (Access Token ngắn hạn) | Đơn giản, stateless |
| Lập lịch tác vụ | node-cron | Nhắc lịch hẹn tự động, gửi ZNS định kỳ |
| Môi trường | `.env` + dotenv | Quản lý biến môi trường đơn giản |

> **Lý do không dùng NestJS:** NestJS có learning curve cao và nhiều abstraction không cần thiết với đội ngũ nhỏ. Express.js với cấu trúc thư mục rõ ràng là lựa chọn thực tiễn hơn ở giai đoạn này.

#### 3.2.3. Cấu trúc thư mục back-end

```
backend/
├── src/
│   ├── routes/          # Định nghĩa các endpoint API
│   │   ├── booking.ts   # Đặt lịch tiếp dân
│   │   ├── feedback.ts  # Phản ánh hiện trường
│   │   ├── content.ts   # Tin tức, sự kiện, di tích, ẩm thực
│   │   ├── auth.ts      # Xác thực Zalo token
│   │   └── webhook.ts   # Nhận sự kiện từ Zalo OA
│   ├── services/        # Logic nghiệp vụ
│   ├── middleware/      # Auth middleware, rate limit, logging
│   ├── prisma/          # Schema CSDL và migrations
│   └── utils/           # Helper: gửi ZNS, gọi Zalo OA API
├── .env
├── package.json
└── tsconfig.json
```

#### 3.2.4. Bảo mật hệ thống

Dù kiến trúc tinh gọn, các biện pháp bảo mật cốt lõi vẫn được đảm bảo đầy đủ:

| Lớp bảo mật | Biện pháp thực hiện |
|---|---|
| Xác thực người dùng | Zalo Access Token xác minh qua `zmp-sdk`; JWT ngắn hạn cho phiên làm việc |
| Phân quyền | Middleware kiểm tra role: Cán bộ OA (qua Zalo OA Admin) – Người dân |
| Truyền thông | HTTPS bắt buộc toàn bộ (Let's Encrypt miễn phí) |
| Dữ liệu nhạy cảm | Số CCCD, số điện thoại lưu dạng mã hóa (bcrypt / AES-256) |
| Chống tấn công | `helmet.js` (bảo vệ HTTP header), `express-rate-limit`, validate input với `zod` |
| Webhook Zalo | Xác minh chữ ký `OA Secret Key` của Zalo trước khi xử lý mọi webhook event |
| Log & giám sát | Ghi log với `winston`; có thể tích hợp Grafana Cloud miễn phí ở giai đoạn đầu |
| Sao lưu dữ liệu | Backup PostgreSQL tự động hàng ngày bằng `pg_dump` + lưu trữ trên Object Storage |

---

### 3.3. Mô hình quản trị vận hành – Tận dụng hệ sinh thái Zalo OA

Đây là điểm cốt lõi của phương án kỹ thuật: **thay vì xây dựng thêm một trang quản trị web riêng biệt**, dự án tận dụng triệt để các công cụ quản lý sẵn có của Zalo OA để cán bộ phường vận hành toàn bộ hệ thống ngay trên điện thoại hoặc máy tính, không cần học thêm phần mềm mới.

#### 3.3.1. Công cụ OA Manager – Trung tâm điều hành của cán bộ phường

Zalo cung cấp **OA Manager** – ứng dụng quản trị chính thức dành cho Zalo OA – dưới hai hình thức:
- **Trên điện thoại:** Mini App "OA Manager" tìm kiếm trực tiếp trong Zalo (không cần cài đặt thêm).
- **Trên máy tính:** Truy cập qua trình duyệt tại `oa.zalo.me`.

OA Manager hỗ trợ tối đa **100 admin/OA** với các vai trò phân quyền rõ ràng, hoàn toàn phù hợp để phân công cán bộ theo từng mảng nghiệp vụ của phường.

**Bảng phân công cán bộ phường theo quyền OA Manager:**

| Vai trò OA | Cán bộ phụ trách | Nhiệm vụ vận hành |
|---|---|---|
| **Quản trị viên** | Cán bộ KHCN&CĐS | Toàn quyền: quản lý admin, cấu hình OA, xem báo cáo tổng hợp |
| **Soạn nội dung** | Cán bộ Văn hoá – Xã hội | Đăng tin tức, bài viết, sự kiện, lễ hội; gửi Broadcast thông báo |
| **Chăm sóc khách hàng** | Cán bộ Tư pháp / Một cửa | Tiếp nhận và trả lời tin nhắn người dân; xử lý phản ánh qua chat |
| **Phân tích viên** | Lãnh đạo phường | Xem báo cáo thống kê, theo dõi chỉ số tương tác, mức độ hài lòng |

#### 3.3.2. Luồng xử lý nghiệp vụ qua OA Webhook – không cần admin panel riêng

Toàn bộ các nghiệp vụ có tính tương tác (đặt lịch, phản ánh) được xử lý theo mô hình **Mini App → Back-end → Zalo OA**, trong đó cán bộ nhận thông báo và phản hồi trực tiếp qua giao diện OA Manager:

**Luồng Đặt lịch tiếp dân:**
```
Người dân đặt lịch trên Mini App
        │
        ▼
Back-end lưu lịch hẹn vào PostgreSQL
        │
        ├─► Gửi ZNS xác nhận đến người dân (tự động)
        │
        └─► Gửi tin nhắn tư vấn vào hộp thư OA Manager
             (Cán bộ Một cửa thấy thông báo ngay trên điện thoại)
                     │
                     ▼
         Cán bộ xác nhận / từ chối / dời lịch
         bằng cách trả lời tin nhắn trong OA Manager
                     │
                     ▼
         Back-end nhận phản hồi qua OA Webhook
         → Cập nhật trạng thái lịch hẹn trong CSDL
         → Gửi ZNS thông báo kết quả đến người dân
```

**Luồng Phản ánh hiện trường:**
```
Người dân gửi phản ánh (ảnh, GPS, mô tả)
        │
        ▼
Back-end lưu phản ánh, gán mã số
        │
        └─► Gửi tin nhắn tự động vào hộp thư OA Manager
             kèm ảnh, địa chỉ, nội dung phản ánh
             (Cán bộ được phân công nhận thông báo tức thì)
                     │
                     ▼
         Cán bộ xem xét, chuyển bộ phận xử lý,
         cập nhật trạng thái qua lệnh reply về Webhook
                     │
                     ▼
         Back-end nhận → cập nhật CSDL
         → Gửi ZNS thông báo tiến độ đến người dân
```

#### 3.3.3. Quản lý nội dung tĩnh – Sử dụng Google Sheets làm CMS đơn giản

Đối với các nội dung thường xuyên cập nhật nhưng không cần quy trình phức tạp (danh sách ẩm thực, di tích, lịch sự kiện), dự án áp dụng giải pháp **Google Sheets làm CMS nhẹ** thay vì xây dựng giao diện quản trị riêng:

- Cán bộ cập nhật danh sách ẩm thực, di tích, lịch sự kiện **trực tiếp trên Google Sheets**.
- Back-end đọc dữ liệu từ Google Sheets thông qua **Google Sheets API** (miễn phí), cache vào bộ nhớ hoặc Redis trong thời gian ngắn.
- Không cần đăng nhập vào bất kỳ trang quản trị nào – cán bộ chỉ cần sử dụng Google Sheets quen thuộc.
- Khi nội dung phát triển phức tạp hơn, có thể chuyển sang CMS chuyên dụng (Strapi, Directus) mà không thay đổi front-end.

**Phân bổ công cụ quản lý theo loại nội dung:**

| Loại nội dung | Công cụ quản lý | Cán bộ phụ trách |
|---|---|---|
| Tin tức, thông báo, bài viết OA | OA Manager (Bài viết + Broadcast) | Cán bộ Văn hoá |
| Lịch hẹn tiếp dân | OA Manager (Hộp thư + Tiện ích đặt lịch OA) | Cán bộ Một cửa |
| Phản ánh hiện trường | OA Manager (Hộp thư + Chat) | Cán bộ phụ trách |
| Đánh giá hài lòng | Tiện ích Easy Survey của OA | Cán bộ KHCN |
| Sự kiện, lễ hội | Google Sheets → Back-end API | Cán bộ Văn hoá |
| Bản đồ ẩm thực, di tích | Google Sheets → Back-end API | Cán bộ Văn hoá |
| Thống kê, báo cáo | OA Manager (Phân tích) + Dashboard đơn giản | Lãnh đạo phường |

#### 3.3.4. Tiện ích sẵn có của Zalo OA – Tận dụng thay vì tự xây dựng

Zalo OA cung cấp một số **tiện ích tích hợp sẵn** (Tiện ích OA) mà phường có thể kích hoạt ngay, giảm đáng kể khối lượng lập trình:

- **Tiện ích Quản lý đặt lịch (OA Booking):** Cho phép thiết lập và quản lý lịch hẹn trực tiếp trong OA Manager, tự động nhắc lịch, theo dõi trạng thái hẹn mà không cần code thêm. Phù hợp cho chức năng đặt lịch tiếp dân trong giai đoạn đầu. Chi phí khoảng 129.000 VNĐ/tháng.
- **Tiện ích Easy Survey (Khảo sát):** Tạo và gửi biểu mẫu đánh giá sự hài lòng đến người dân đã follow OA, tích hợp trực tiếp trong OA Manager, không cần lập trình.
- **Tiện ích Chatbot OA:** Thiết lập kịch bản chatbot tự động phản hồi theo từ khóa, hướng dẫn người dân sử dụng Mini App, hỗ trợ 24/7.

> **Chiến lược triển khai theo giai đoạn:** Giai đoạn đầu, ưu tiên kích hoạt các Tiện ích OA sẵn có để triển khai nhanh. Giai đoạn sau, khi đã vận hành ổn định và phát sinh nhu cầu nâng cao, mới lập trình các module tùy chỉnh qua OA OpenAPI + Webhook.

---

### 3.4. Hạ tầng triển khai

Kiến trúc hạ tầng được thiết kế tối giản, phù hợp với ngân sách và năng lực vận hành của cơ quan cấp phường:

**Cấu hình đề xuất – 1 VPS duy nhất:**
- Nhà cung cấp: Viettel Cloud, VNPT Cloud hoặc FPT Cloud (ưu tiên nhà cung cấp trong nước).
- Cấu hình: 2 vCPU, 4 GB RAM, SSD 50 GB – đủ phục vụ lưu lượng truy cập cấp phường.
- Hệ điều hành: Ubuntu 22.04 LTS.
- Quản lý process: PM2 (giám sát và tự khởi động lại ứng dụng khi gặp sự cố).
- Web server / Reverse proxy: Nginx + Let's Encrypt (SSL miễn phí, tự động gia hạn).
- Database: PostgreSQL chạy cùng VPS (đủ cho quy mô hiện tại; tách ra khi cần).
- Lưu trữ file: Cloudinary (gói miễn phí đủ cho ảnh phản ánh và sự kiện ở giai đoạn đầu).

**Sao lưu dữ liệu:** Script tự động chạy hàng đêm, xuất file `.sql` và tải lên Object Storage (hoặc Google Drive của đơn vị) để lưu trữ 30 ngày gần nhất.

**Chi phí vận hành ước tính:** Khoảng 500.000 – 1.000.000 VNĐ/tháng cho VPS; không phát sinh chi phí hạ tầng bổ sung trong giai đoạn đầu nhờ tận dụng các gói miễn phí.

---

## IV. QUY TRÌNH TÍCH HỢP

### 4.1. Quy trình xuất bản ứng dụng lên Zalo Mini App Store

Quá trình xuất bản Mini App trên nền tảng Zalo tuân theo quy trình sau:

**Bước 1: Chuẩn bị tài khoản và đăng ký**
- Đăng nhập trang quản lý Zalo Developer tại `developers.zalo.me` bằng tài khoản Zalo của đơn vị.
- Tạo Zalo App mới, lấy App ID và App Secret.
- **Liên kết Mini App với Zalo OA của phường Tùng Thiện** (bắt buộc): Zalo Mini App chỉ được triển khai khi gắn với một Zalo Official Account. Phường đã có Zalo OA nên thực hiện kết nối ngay tại bước này.

**Bước 2: Xác thực Mini App qua Zalo OA**
- Truy cập Quản lý Mini App → Quản lý → Quản lý xác thực → Xác thực Mini App.
- Admin Mini App gửi yêu cầu xác thực đến Zalo OA của phường.
- Xác thực giúp Mini App mang danh tính chính thức của tổ chức, tăng uy tín với người dùng.
- Thời gian xét duyệt xác thực thông thường: **3 – 5 ngày làm việc**.
- Chuẩn bị hồ sơ kèm theo: Quyết định thành lập UBND phường, con dấu đơn vị, giấy tờ pháp lý liên quan.

**Bước 3: Phát triển và kiểm thử**
- Cài đặt Zalo Mini App CLI và Visual Studio Code Extension chính thức.
- Phát triển theo môi trường Development: kiểm thử nội bộ bằng QR code scan trên thiết bị thật.
- Sử dụng lệnh `zmp start` (Dev server) và `zmp deploy` để đẩy phiên bản lên kiểm duyệt.

**Bước 4: Gửi kiểm duyệt (Review)**
- Tại trang `miniapp.zalo.me`, chọn Mini App → Submit for Review.
- Cung cấp đầy đủ: mô tả ứng dụng, logo (512×512px), banner (1200×628px), ảnh chụp màn hình các tính năng chính.
- **Thời gian kiểm duyệt thông thường: 3 – 7 ngày làm việc**.
- Nếu bị từ chối: Zalo gửi lý do cụ thể qua dashboard; chỉnh sửa và gửi lại.

**Bước 5: Công bố và vận hành**
- Sau khi được duyệt, ứng dụng hiển thị trên Zalo Mini App Store và truy cập được qua Zalo OA.
- Cập nhật phiên bản: Thay đổi nhỏ (nội dung, ảnh) không cần duyệt lại; thay đổi lớn về tính năng cần gửi duyệt lại.

---

### 4.2. Tích hợp gói tin nhắn tự động và thông báo qua Zalo OA

Phường đã có Zalo OA – đây là lợi thế lớn để triển khai hệ thống thông báo tự động kết hợp với Mini App. Các gói dịch vụ tin nhắn phù hợp với mục đích thông báo của phường bao gồm:

#### 4.2.1. Zalo Notification Service (ZNS)

ZNS là dịch vụ gửi tin nhắn thông báo chăm sóc theo mẫu (Template), được gửi qua API đến tài khoản Zalo của người dùng. Đây là công cụ **phù hợp nhất** cho mục đích thông báo hành chính của phường.

| Loại ZNS | Mô tả | Ứng dụng tại phường |
|---|---|---|
| **ZNS Template** | Gửi đến cả người chưa quan tâm OA, dựa vào số điện thoại | Thông báo kết quả hồ sơ, nhắc lịch hẹn tiếp dân, thông báo khẩn |
| **ZNS Follower** | Gửi đến người đã quan tâm (follow) OA, không cần số điện thoại | Thông báo sự kiện, lễ hội, tin tức phường cho người theo dõi |

**Quy trình đăng ký và sử dụng ZNS:**
1. Đăng ký dịch vụ ZNS tại `business.zalo.me`.
2. Soạn thảo và gửi mẫu tin (Template) để Zalo phê duyệt (thường 1 – 3 ngày làm việc).
3. Tích hợp ZNS API vào hệ thống Notification Service của back-end.
4. Gọi API để gửi thông báo tự động khi có sự kiện kích hoạt (hồ sơ duyệt xong, lịch hẹn được xác nhận, phản ánh được xử lý…).

**Chi phí tham khảo:** ZNS tính phí theo lượt gửi, khoảng 200 – 250 VNĐ/tin (tùy gói), áp dụng với tin nhắn chăm sóc/thông báo. Phường cần dự trù kinh phí vận hành hàng năm cho dịch vụ này.

**Mẫu tin nhắn ZNS đề xuất cho phường:**
- *"Kính gửi [Họ tên], hồ sơ [loại thủ tục] mã số [XXXXX] của Ông/Bà đã được UBND phường Tùng Thiện tiếp nhận. Thời hạn giải quyết: [ngày]. Vui lòng theo dõi tại Mini App."*
- *"Kính gửi [Họ tên], UBND phường Tùng Thiện xác nhận lịch hẹn tiếp dân của Ông/Bà vào lúc [Giờ], ngày [Ngày] tại Bộ phận Một cửa, địa chỉ [Địa chỉ]. Mã hẹn: [XXXXX]."*

#### 4.2.2. Broadcast Zalo OA (Tin truyền thông)

Tính năng gửi tin nhắn hàng loạt đến toàn bộ người dùng đang **quan tâm (follow) Zalo OA** của phường. Đây là tính năng **miễn phí** trong gói OA cơ bản, với số lần gửi nhất định mỗi tháng.

| Đặc điểm | Chi tiết |
|---|---|
| Đối tượng | Người dùng đã follow Zalo OA phường |
| Chi phí | Miễn phí một số lượt nhất định/tháng; phát sinh phí nếu vượt hạn mức |
| Tần suất | Có khoảng cách tối thiểu giữa các lần gửi theo quy định của Zalo |
| Nội dung | Văn bản, hình ảnh, nút hành động (CTA) liên kết đến Mini App |

**Ứng dụng tại phường:**
- Thông báo lịch tiêm phòng, vệ sinh môi trường định kỳ.
- Thông báo hội nghị nhân dân, sự kiện lễ hội.
- Tuyên truyền chính sách mới, văn bản pháp luật.
- Thông báo đợt đăng ký tuyển sinh, nộp hồ sơ theo mùa vụ.

#### 4.2.3. Tin nhắn tương tác tự động (Chatbot OA)

Thiết lập kịch bản chatbot cơ bản trên Zalo OA để tự động phản hồi khi người dùng nhắn tin:
- Menu tự động: Hướng dẫn sử dụng Mini App, tra cứu thủ tục, liên hệ bộ phận.
- Từ khóa kích hoạt: "lịch hẹn", "hồ sơ", "phản ánh", "quy hoạch"… → Chuyển vào Mini App đúng tính năng.

---

## V. LỘ TRÌNH THỰC HIỆN

### 5.1. Tổng quan lộ trình

Dự án được thực hiện bởi **01 cán bộ phụ trách KHCN&CĐS** với sự hỗ trợ của công cụ AI, kết hợp tham vấn kỹ thuật từ Phòng CNTT Quận và các bộ phận nghiệp vụ của phường. Do nguồn lực triển khai là cá nhân đơn lẻ, lộ trình được xây dựng trong **16 tuần (khoảng 4 tháng)** theo hướng cuốn chiếu từng nhóm tính năng, đảm bảo mỗi phần được hoàn thiện và kiểm thử kỹ trước khi chuyển sang phần tiếp theo.

| Giai đoạn | Nội dung | Thời gian |
|---|---|---|
| **Giai đoạn 1** | Chuẩn bị, nghiên cứu kỹ thuật và thiết kế | Tuần 1 – 3 |
| **Giai đoạn 2** | Xây dựng nền tảng hạ tầng và back-end cốt lõi | Tuần 4 – 6 |
| **Giai đoạn 3** | Phát triển tính năng front-end theo nhóm | Tuần 7 – 12 |
| **Giai đoạn 4** | Hoàn thiện, kiểm thử toàn diện và xuất bản | Tuần 13 – 16 |

---

### 5.2. Bảng lộ trình chi tiết (xem xét lại)

| Tuần | Nội dung thực hiện | Đầu ra (Deliverable) |
|:---:|---|---|
| **Tuần 1** | **Khởi động và khảo sát yêu cầu** | |
| | - Họp khởi động với lãnh đạo UBND phường, xác nhận phạm vi và ưu tiên tính năng | Biên bản họp |
| | - Khảo sát nhu cầu người dân và cán bộ | Báo cáo khảo sát |
| | - Đăng ký tài khoản Zalo Developer, tạo App ID, liên kết Zalo OA phường | App ID đã liên kết OA |
| **Tuần 2** | **Lập kế hoạch kỹ thuật chi tiết** | |
| | - Soạn thảo Tài liệu Đặc tả Yêu cầu Phần mềm (SRS): mô tả chi tiết 12 tính năng, luồng xử lý, API spec | Tài liệu SRS |
| | - Thiết kế kiến trúc hệ thống (sơ đồ back-end, cấu trúc CSDL, luồng Webhook OA) | Tài liệu kiến trúc |
| | - Gửi hồ sơ xác thực Mini App qua Zalo OA; đăng ký dịch vụ ZNS tại business.zalo.me | Hồ sơ xác thực đã nộp |
| | - Đăng ký và cấu hình máy chủ VPS; cài đặt hệ điều hành, Nginx, SSL Let's Encrypt | VPS sẵn sàng |
| **Tuần 3** | **Thiết kế UI/UX** | |
| | - Vẽ User Flow và Wireframe cho toàn bộ 12 tính năng (có thể dùng Figma Community + AI) | Wireframe 12 màn hình |
| | - Thiết kế giao diện chi tiết (Mockup) theo ZaUI Design System: màu sắc, typography, spacing | File Figma hoàn chỉnh |
| | - Trình bày bản thiết kế với lãnh đạo phường và đại diện người dân, ghi nhận góp ý | Biên bản góp ý |
| | - Chỉnh sửa lần cuối và phê duyệt bản thiết kế | Thiết kế phê duyệt |
| | - *(Dự kiến nhận kết quả xác thực Mini App từ Zalo trong tuần này)* | Xác thực OA hoàn tất |
| **Tuần 4** | **Thiết lập back-end – Nền tảng cơ sở** | |
| | - Khởi tạo dự án Node.js + Express + TypeScript + Prisma; thiết lập cấu trúc thư mục | Repo dự án back-end |
| | - Thiết kế schema CSDL PostgreSQL: bảng users, bookings, feedbacks, contents, events | Schema CSDL |
| | - Lập trình Auth module: xác thực Zalo Access Token, phát hành JWT, middleware phân quyền | Module Auth hoạt động |
| | - Cấu hình biến môi trường `.env`, kết nối CSDL, thiết lập PM2 | Môi trường Production |
| **Tuần 5** | **Back-end – API Đặt lịch và Phản ánh + Webhook OA** | |
| | - Lập trình API Đặt lịch tiếp dân: CRUD lịch hẹn, kiểm tra lịch trống, logic phân công | API đặt lịch hoạt động |
| | - Lập trình API Phản ánh hiện trường: CRUD phản ánh, upload ảnh (Cloudinary), gắn GPS | API phản ánh hoạt động |
| | - Lập trình Webhook Handler nhận sự kiện từ Zalo OA; xác minh OA Secret Key | Webhook hoạt động |
| | - Tích hợp Zalo OA API gửi tin nhắn tư vấn vào OA Manager khi có form submit | Luồng OA → cán bộ OK |
| **Tuần 6** | **Back-end – API Nội dung, ZNS và Google Sheets CMS** | |
| | - Lập trình API Nội dung: tin tức, văn bản, sự kiện, di tích, ẩm thực (CRUD + phân trang) | API nội dung hoạt động |
| | - Tích hợp Google Sheets API: đọc dữ liệu ẩm thực, di tích, sự kiện từ Sheets | Google Sheets CMS OK |
| | - Tích hợp ZNS: đăng ký mẫu tin, gửi xác nhận lịch hẹn, nhắc lịch, cập nhật phản ánh | ZNS gửi được |
| | - Lập lịch tự động (node-cron): nhắc lịch hẹn trước 24h và 1h | Cronjob nhắc lịch OK |
| | - Kiểm thử toàn bộ back-end API bằng Postman/Thunder Client | API đã test xong |
| **Tuần 7** | **Front-end – Khung ứng dụng và Trang chủ** | |
| | - Khởi tạo dự án React + ZaUI + zmp-sdk bằng Zalo CLI; cấu hình Vite, TypeScript, Zustand | Dự án front-end khởi tạo |
| | - Xây dựng khung ứng dụng: ZMPRouter, Bottom TabBar (5 tab), Header component, layout chung | Skeleton app chạy được |
| | - Phát triển màn hình Trang chủ (Home): lưới tính năng chính, banner thông báo, shortcut nhanh | Màn hình Home hoàn chỉnh |
| | - Tích hợp getAccessToken / getUserInfo từ zmp-sdk; lưu session người dùng | Xác thực Zalo người dùng OK |
| **Tuần 8** | **Front-end – Nhóm Hành chính (Đặt lịch + DVC + VNeID)** | |
| | - Phát triển màn hình Đặt lịch tiếp dân: form nhập liệu, DatePicker, lịch trống, xác nhận | Module đặt lịch hoàn chỉnh |
| | - Phát triển màn hình Dịch vụ công: danh sách thủ tục, chi tiết, WebView liên kết DVC | Module DVC hoàn chỉnh |
| | - Tích hợp luồng VNeID (deep link xác thực trước khi submit form đặt lịch) | Luồng VNeID hoạt động |
| | - Kiểm thử luồng đặt lịch đầu-đến-cuối: submit → OA Manager → ZNS phản hồi | Luồng E2E đặt lịch OK |
| **Tuần 9** | **Front-end – Nhóm Tương tác (Phản ánh + Đánh giá)** | |
| | - Phát triển màn hình Phản ánh hiện trường: form, chụp ảnh/upload, định vị GPS, danh sách phản ánh | Module phản ánh hoàn chỉnh |
| | - Phát triển màn hình Đánh giá dịch vụ công: form 5 sao, tiêu chí, lịch sử đánh giá | Module đánh giá hoàn chỉnh |
| | - Kiểm thử luồng E2E: phản ánh submit → OA Manager nhận → cập nhật trạng thái → ZNS người dân | Luồng E2E phản ánh OK |
| **Tuần 10** | **Front-end – Trang thông tin phường và iHanoi** | |
| | - Phát triển module Trang thông tin điện tử: tin tức (List + Card), văn bản (PDF), giới thiệu cơ cấu | Module thông tin phường |
| | - Phát triển module Sự kiện – Lễ hội: calendar view, chi tiết sự kiện, tính năng nhắc nhở | Module sự kiện |
| | - Tích hợp nút liên kết nhanh iHanoi và hướng dẫn đăng ký | Liên kết iHanoi OK |
| | - Phát triển module Giáo dục: danh sách cơ sở, thông báo tuyển sinh | Module giáo dục |
| **Tuần 11** | **Front-end – Di tích và Bản đồ (Quy hoạch + Ẩm thực)** | |
| | - Phát triển module Di tích lịch sử: danh sách, chi tiết, ảnh tư liệu, bản đồ chỉ đường | Module di tích |
| | - Phát triển module Tra cứu quy hoạch: WebView nhúng cổng quy hoạch Hà Nội, nút liên hệ | Module quy hoạch |
| | - Phát triển module Bản đồ ẩm thực: Google Maps WebView, danh sách marker, bộ lọc loại hình | Module bản đồ ẩm thực |
| | - Kết nối Google Sheets CMS: load dữ liệu ẩm thực và di tích từ API back-end | Dữ liệu CMS hiển thị đúng |
| **Tuần 12** | **Hoàn thiện tổng thể và tích hợp OA** | |
| | - Thiết lập Chatbot OA và menu tự động trong OA Manager (từ khóa, kịch bản hướng dẫn) | Chatbot OA hoạt động |
| | - Thiết lập phân quyền cán bộ phường trong OA Manager theo vai trò đã xác định | Phân quyền OA OK |
| | - Kiểm tra toàn bộ luồng Webhook OA ↔ back-end ↔ ZNS ↔ người dùng | Luồng tổng thể OK |
| | - Rà soát code, tối ưu hiệu năng, kiểm tra responsive trên các dòng máy | Code review xong |
| | - Cập nhật đủ nội dung thực tế vào Google Sheets CMS (ẩm thực, di tích, sự kiện) | Nội dung thực tế đủ |
| **Tuần 13** | **Kiểm thử toàn diện (Testing)** | |
| | - Kiểm thử chức năng (Functional Testing) toàn bộ 12 tính năng theo checklist | Báo cáo kiểm thử |
| | - Kiểm thử bảo mật cơ bản: SQL injection, XSS, xác minh Webhook signature, HTTPS | Báo cáo bảo mật |
| | - Kiểm thử trên thiết bị thực: Android (nhiều phiên bản), iOS; màn hình nhỏ (5 inch) | Kết quả kiểm thử thiết bị |
| | - Sửa lỗi (Bug fixing) phát sinh từ kiểm thử | Danh sách lỗi đã xử lý |
| **Tuần 14** | **User Acceptance Testing (UAT) và sửa lỗi cuối** | |
| | - Tổ chức UAT với nhóm 10–15 người dân đại diện các lứa tuổi; ghi nhận phản hồi | Biên bản UAT |
| | - UAT nội bộ với cán bộ phường: thử nghiệm toàn bộ quy trình OA Manager | Biên bản UAT cán bộ |
| | - Sửa lỗi và điều chỉnh UX dựa trên phản hồi UAT (tập trung vào người dùng cao tuổi) | Phiên bản đã sửa lỗi UAT |
| | - Chuẩn bị hồ sơ Submit for Review: logo (512×512px), banner (1200×628px), ảnh chụp màn hình | Hồ sơ kiểm duyệt sẵn sàng |
| **Tuần 15** | **Nộp kiểm duyệt và chuẩn bị ra mắt** | |
| | - Submit Mini App lên Zalo để kiểm duyệt (thường 3–7 ngày làm việc) | Hồ sơ kiểm duyệt đã nộp |
| | - Theo dõi tiến trình kiểm duyệt; phối hợp với Zalo xử lý yêu cầu bổ sung nếu có | Ứng dụng chờ duyệt |
| | - Soạn thảo bộ tài liệu bàn giao: Hướng dẫn vận hành OA Manager, hướng dẫn Google Sheets CMS, tài liệu kỹ thuật back-end | Bộ tài liệu bàn giao |
| | - Chuẩn bị nội dung truyền thông ra mắt: bài Broadcast OA, poster QR code | Nội dung truyền thông sẵn sàng |
| **Tuần 16** | **Ra mắt chính thức, đào tạo và bàn giao** | |
| | - **Công bố chính thức Mini App** sau khi Zalo phê duyệt | Ứng dụng live trên Zalo |
| | - Gửi Broadcast OA thông báo ra mắt đến toàn bộ người dân đang follow OA phường | Broadcast đã gửi |
| | - Đào tạo cán bộ phường: sử dụng OA Manager (tiếp nhận lịch hẹn, xử lý phản ánh, gửi tin), cập nhật Google Sheets CMS, gửi Broadcast và ZNS | Biên bản đào tạo |
| | - Bàn giao toàn bộ tài liệu kỹ thuật và mã nguồn | Bàn giao hoàn tất |
| | - Họp tổng kết dự án; xây dựng kế hoạch bảo trì và nâng cấp giai đoạn tiếp theo | Báo cáo tổng kết |

---

### 5.3. Lưu ý về lộ trình 1 người thực hiện

Với mô hình triển khai do một cá nhân đảm nhiệm, một số điểm cần lưu ý để đảm bảo tiến độ:

- **Ưu tiên cuốn chiếu theo nhóm tính năng:** Mỗi module được hoàn thiện toàn bộ (back-end + front-end + kiểm thử nhanh) trước khi chuyển sang module tiếp theo, tránh nợ kỹ thuật tích lũy.
- **Dùng AI hỗ trợ tối đa:** Sử dụng AI cho việc sinh boilerplate code, viết tài liệu, tạo dữ liệu test, tìm kiếm lỗi – ước tính tiết kiệm 30–40% thời gian lập trình so với làm thủ công.
- **Quản lý rủi ro thời gian:** Dự phòng mỗi giai đoạn có thể kéo dài thêm 3–5 ngày nếu phát sinh vấn đề kỹ thuật hoặc chờ phản hồi từ bên ngoài (Zalo, Phòng CNTT Quận). Tổng dự phòng đã được tính vào 16 tuần.
- **Chờ kiểm duyệt Zalo:** Thời gian kiểm duyệt Mini App thường 3–7 ngày làm việc. Tuần 15 được bố trí dành cho việc này, tránh ảnh hưởng tiến độ ra mắt.

---

### 5.4. Kế hoạch vận hành sau triển khai

Sau khi bàn giao chính thức, công tác vận hành được phân công như sau:

- **Cán bộ phụ trách KHCN&CĐS:** Quản lý nội dung hàng ngày (tin tức, thông báo, sự kiện) qua OA Manager và Google Sheets; theo dõi tình trạng hệ thống back-end.
- **Cán bộ Một cửa / Tư pháp:** Tiếp nhận, xử lý phản ánh và lịch hẹn tiếp dân trực tiếp qua OA Manager trên điện thoại.
- **Bảo trì định kỳ:** Cập nhật bản vá bảo mật mỗi tháng; kiểm tra sao lưu dữ liệu hàng tuần.
- **Nâng cấp tính năng:** Theo chu kỳ 6 tháng/lần dựa trên phản hồi người dùng và yêu cầu mới từ cơ quan cấp trên.
- **Hỗ trợ người dân:** Thiết lập đường dây hỗ trợ qua Zalo OA và số điện thoại của bộ phận KHCN&CĐS.

---

## VI. DỰ TOÁN NGUỒN LỰC

### 6.1. Nhân lực

Toàn bộ dự án được thực hiện bằng **nguồn nhân sự nội bộ của phường**, không phát sinh chi phí thuê ngoài nhân lực. Sự phân công cụ thể như sau:

| Vai trò | Số lượng | Trách nhiệm chính |
|---|---|---|
| Cán bộ KHCN&CĐS (người chủ trì) | 1 | Toàn bộ công việc kỹ thuật: phân tích yêu cầu, thiết kế UI/UX, lập trình front-end + back-end, tích hợp hệ thống, kiểm thử, vận hành |
| Lãnh đạo phường | 1 | Phê duyệt kế hoạch, hỗ trợ liên hệ các cơ quan cấp trên |
| Cán bộ Văn hoá – Xã hội | 1 (kiêm nhiệm) | Cung cấp nội dung thực tế (ẩm thực, di tích, sự kiện), tham gia UAT |
| Cán bộ Một cửa / Tư pháp | 1 (kiêm nhiệm) | Tham gia UAT, tiếp nhận đào tạo OA Manager, vận hành sau triển khai |

### 6.2. Kinh phí tóm tắt

Chi phí dự án **không bao gồm nhân công** do sử dụng hoàn toàn nguồn lực nội bộ. Toàn bộ chi phí phát sinh là chi phí dịch vụ hạ tầng và nền tảng kỹ thuật – chi tiết tại **Mục VIII** dưới đây.

*Lưu ý: Đề nghị UBND phường phê duyệt dự toán chi tiết sau khi hoàn thành giai đoạn khảo sát kỹ thuật (Tuần 1 – 2) và xác định rõ phương án triển khai.*

---

## VII. TỔ CHỨC THỰC HIỆN VÀ KIẾN NGHỊ

### 7.1. Tổ chức thực hiện

- **UBND phường Tùng Thiện:** Phê duyệt kế hoạch, bố trí nguồn lực, chỉ đạo triển khai.
- **Bộ phận KHCN&CĐS – Phòng Văn hoá Xã hội:** Chủ trì tổ chức thực hiện, chịu trách nhiệm toàn bộ tiến độ và chất lượng.
- **Các bộ phận nghiệp vụ:** Cung cấp thông tin nội dung chuyên ngành (một cửa, tư pháp, văn hóa…), tham gia kiểm thử UAT.
- **Phòng CNTT Quận:** Hỗ trợ kết nối API với các hệ thống cấp Quận và Thành phố.

### 7.2. Kiến nghị

1. **Đề nghị UBND phường** sớm phê duyệt kế hoạch và bố trí kinh phí thực hiện ngay trong Quý II/2026 để đảm bảo tiến độ.
2. **Đề nghị Phòng CNTT Quận** hỗ trợ cung cấp tài khoản và tài liệu API kết nối với hệ thống iHanoi, Dịch vụ công Thành phố trong Tuần 1 của dự án.
3. **Đề nghị Sở Thông tin và Truyền thông Hà Nội** hướng dẫn quy trình đăng ký kết nối Cơ sở dữ liệu quốc gia về dân cư (VNeID) cho đơn vị cấp phường.
4. Sau khi vận hành ổn định, đề nghị nhân rộng mô hình sang các phường, xã khác trên địa bàn Thành phố Hà Nội để tạo thành hệ sinh thái chính quyền số đồng bộ.

---

## VIII. DỰ TOÁN CHI PHÍ THỰC HIỆN DỰ ÁN

Do toàn bộ nhân lực là cán bộ nội bộ của phường, **chi phí dự án chỉ bao gồm các khoản thuê dịch vụ hạ tầng kỹ thuật và nền tảng Zalo**. Số liệu dưới đây được khảo sát thực tế từ các nhà cung cấp tại thời điểm tháng 4/2026.

---

### 8.1. Chi phí hạ tầng máy chủ (VPS)

Hệ thống back-end chạy trên **01 máy chủ ảo (VPS) tại Việt Nam** để đảm bảo tuân thủ quy định lưu trữ dữ liệu trong nước và tốc độ kết nối thấp với Zalo API.

**Cấu hình đề xuất:** 2 vCPU – 4 GB RAM – 50 GB SSD NVMe (đủ cho lưu lượng cấp phường)

| Nhà cung cấp | Gói tham khảo | Giá/tháng (chưa VAT) | Ghi chú |
|---|---|---:|---|
| **Viettel IDC** | VPS NVMe – 2 vCPU, 4GB RAM | 614.000 VNĐ | Đơn vị nhà nước, ưu tiên lưu trữ trong nước, đạt chuẩn ISO 27017 |
| **Vietnix** | VPS SSD – 2 vCPU, 4GB RAM | 200.000 | Data center FPT/Viettel IDC Hà Nội, uptime 99,9% |
| **AZDIGI** | Cloud Server NVMe – 2 vCPU, 4GB RAM | 400.000 VNĐ | Hạ tầng HA tự phục hồi, NVMe phân tán |

> **Lựa chọn khuyến nghị:** Viettel IDC – phù hợp nhất với đơn vị nhà nước, có thể ký hợp đồng theo quy trình đấu thầu/mua sắm công nếu cần.

**Dự toán chi phí VPS:**

| Chu kỳ | Đơn giá (trung bình) | Thành tiền |
|---|---:|---:|
| Hàng tháng | 614.000 VNĐ/tháng | 614.000 VNĐ |

*Lưu ý: Chưa bao gồm VAT 10%. SSL/TLS sử dụng Let's Encrypt – miễn phí, tự động gia hạn.*

---

### 8.2. Chi phí lưu trữ ảnh và file (Object Storage) -- xem xét lại phần Cloudinary

Ảnh phản ánh hiện trường và hình ảnh sự kiện/di tích cần lưu trữ riêng biệt.

| Dịch vụ | Gói | Chi phí | Ghi chú |
|---|---|---:|---|
| **Cloudinary** | Free tier | **0 VNĐ** | 25 GB lưu trữ + 25 GB bandwidth/tháng – đủ dùng giai đoạn đầu |
| Cloudinary (nếu vượt free tier) | Paid plan | 89$/tháng | Nâng cấp khi lượng ảnh vượt 25 GB |

> Với quy mô phường, ước tính 1–2 năm đầu Cloudinary miễn phí là đủ dùng. Chỉ phát sinh chi phí khi lượng ảnh phản ánh tăng đáng kể.

---

### 8.3. Chi phí dịch vụ Zalo

#### A. Gói Zalo OA – Bắt buộc để sử dụng API tích hợp

Để tích hợp OA OpenAPI và Webhook (nhận tin nhắn từ form submit về OA Manager), phường **bắt buộc phải đăng ký gói Zalo OA trả phí**. Gói miễn phí (Cơ bản) không cho phép kết nối API.

| Gói dịch vụ | Giá tham khảo/tháng | Quyền lợi chính | Phù hợp |
|---|---:|---|---|
| **Gói Nâng cao** | ~99.000 VNĐ | Hỗ trợ OA OpenAPI + Webhook, 5 tổng đài viên, 2.000 tin tư vấn/tháng, 4 tin Broadcast/tháng |  **Phù hợp nhất** cho phường |
| Gói Dùng thử | 10.000 VNĐ (1 tháng) | Tương đương Nâng cao, chỉ dùng 1 tháng | Dùng để kiểm thử trước khi mua dài hạn |
| Gói Premium | ~399.000 VNĐ | 10 tổng đài viên, 9.000 tin tư vấn/tháng | Không cần thiết ở giai đoạn đầu |

> **Khuyến nghị:** Bắt đầu bằng **Gói Dùng thử** (10.000 VNĐ) trong tháng kiểm thử, sau đó chuyển sang **Gói Nâng cao** (~99.000 VNĐ/tháng) khi ra mắt chính thức. Đăng ký theo chu kỳ 12 tháng để được chiết khấu thêm 10%.

**Dự toán chi phí Zalo OA:**

| Chu kỳ | Đơn giá | Thành tiền |
|---|---:|---:|
| Gói Dùng thử (1 tháng kiểm thử) | 10.000 VNĐ | 10.000 VNĐ |
| Gói Nâng cao – 12 tháng (chiết khấu 10%) | ~89.000 VNĐ/tháng | **~1.070.000 VNĐ/năm** |

#### B. Zalo Notification Service (ZNS) – Tính theo lượt gửi

ZNS là dịch vụ tính phí theo từng tin nhắn gửi đi. Phí phát sinh khi gửi xác nhận lịch hẹn, nhắc lịch, cập nhật phản ánh.

| Loại ZNS | Đơn giá tham khảo | Ước lượng gửi/tháng | Chi phí/tháng |
|---|---:|---:|---:|
| ZNS Template (thông báo lịch hẹn, phản ánh) | ~200 – 250 VNĐ/tin | ~300 tin | ~60.000 – 75.000 VNĐ |
| ZNS Follower (thông báo sự kiện, lễ hội) | ~150 – 200 VNĐ/tin | ~200 tin | ~30.000 – 40.000 VNĐ |
| **Tổng ước tính ZNS** | | **~500 tin/tháng** | **~90.000 – 115.000 VNĐ/tháng** |

> *Lưu ý: Giá ZNS thực tế phụ thuộc vào loại mẫu tin và thường thay đổi. Đề nghị tra cứu giá chính thức tại `zalo.solutions/zns/pricing` trước khi lập dự toán chính thức.*

**Dự toán chi phí ZNS năm đầu:** ~1.080.000 – 1.380.000 VNĐ/năm

#### C. Tiện ích OA tùy chọn

| Tiện ích | Chi phí | Mô tả |
|---|---:|---|
| Tiện ích Quản lý đặt lịch OA | 99.000 VNĐ/tháng | Tùy chọn: kích hoạt thay vì lập trình module đặt lịch riêng ở giai đoạn đầu để tiết kiệm thời gian; có thể thay bằng module tự lập trình sau |

---

### 8.4. Tổng hợp chi phí hàng năm (cần tính toán lại)

| Khoản mục | Chi phí/tháng | Chi phí/năm (ước tính) |
|---|---:|---:|
| VPS Viettel IDC (2 vCPU, 4GB RAM, NVMe) | ~614.000 VNĐ | ~7.368.000 VNĐ |
| Lưu trữ ảnh Cloudinary | 0 VNĐ (gói miễn phí) | 0 VNĐ |
| Zalo OA – Gói Nâng cao (12 tháng) | ~99.000 VNĐ | ~1.188.000 VNĐ |
| ZNS (ước tính ~500 tin/tháng) | ~100.000 VNĐ | ~1.200.000 VNĐ |
| **Tổng cộng** | **~589.000 VNĐ/tháng** | **~6.570.000 VNĐ/năm** |
| *Cộng VAT 10%* | | *~7.230.000 VNĐ/năm* |

> **Kết luận:** Toàn bộ chi phí vận hành hệ thống (hạ tầng + nền tảng Zalo) ước tính khoảng **6,5 – 7,5 triệu VNĐ/năm** (~600.000 VNĐ/tháng), tương đương mức chi phí rất thấp so với lợi ích mang lại. Đây là khoản chi có thể đưa vào ngân sách sự nghiệp CNTT thường xuyên của phường theo Thông tư 03/2021/TT-BTTTT về định mức kinh tế – kỹ thuật trong lĩnh vực công nghệ thông tin.

---

### 8.5. Chi phí phát sinh theo nhu cầu (không bắt buộc)

| Hạng mục | Chi phí tham khảo | Ghi chú |
|---|---:|---|
| Nâng cấp VPS (khi lượng truy cập tăng) | +100.000 – 200.000 VNĐ/tháng | Nâng lên 4 vCPU, 8GB RAM khi cần |
| Cloudinary gói trả phí (khi vượt 25GB ảnh) | ~390.000 VNĐ/tháng | Chỉ cần sau 1–2 năm vận hành |
| Tiện ích Quản lý đặt lịch OA (tùy chọn thay thế module tự lập trình) | ~129.000 VNĐ/tháng | Có thể dùng giai đoạn đầu để tiết kiệm thời gian phát triển |
| Tên miền riêng cho back-end API (tùy chọn) | ~200.000 – 500.000 VNĐ/năm | Nếu không dùng IP hoặc subdomain miễn phí của VPS |

---

*Bản kế hoạch này được xây dựng bởi Bộ phận Khoa học Công nghệ và Chuyển đổi số, Phòng Văn hoá – Xã hội, UBND phường Tùng Thiện. Đề nghị lãnh đạo UBND phường xem xét, phê duyệt để triển khai thực hiện.*

---

**NGƯỜI LẬP KẾ HOẠCH**  
Cán bộ phụ trách KHCN&CĐS  
Phòng Văn hoá – Xã hội  
UBND phường Tùng Thiện

**PHÊ DUYỆT**  
Chủ tịch UBND phường Tùng Thiện