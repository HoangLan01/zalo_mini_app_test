# KẾ HOẠCH KIỂM THỬ BẰNG AI CHO ZALO MINI APP
## UBND Phường Tùng Thiện — Trước khi gửi xét duyệt

> [!IMPORTANT]
> Tài liệu này được xây dựng dựa trên [Chính sách kiểm duyệt Zalo Mini App](https://miniapp.zaloplatforms.com/documents/zalo-mini-app-censorship-policy/) và kế hoạch kiểm thử nội bộ. Mục đích: cung cấp cho AI agent một bộ chỉ dẫn **có cấu trúc, đúng trọng tâm** để thực hiện kiểm thử tự động hoặc bán tự động.

---

## PHẦN A — THÔNG TIN TỔNG QUAN

### A1. Bối cảnh sản phẩm

| Mục | Nội dung |
|---|---|
| **Tên sản phẩm** | Zalo Mini App hỗ trợ chuyển đổi số tại UBND phường Tùng Thiện |
| **Đơn vị sở hữu** | UBND phường Tùng Thiện |
| **Đối tượng sử dụng** | Người dân, tổ chức, cán bộ quản trị |
| **Loại hình Mini App** | Cơ quan nhà nước / Đơn vị sự nghiệp |
| **Môi trường kiểm thử** | Môi trường Testing / Development của Zalo Mini App |
| **Kênh hỗ trợ Zalo** | OA "Zalo chuyển đổi số" hoặc minicqnn@zalo.me |

### A2. Mục tiêu kiểm thử bằng AI

AI agent sẽ thực hiện kiểm thử nhằm:

1. **Phát hiện vi phạm chính sách kiểm duyệt** — những lỗi khiến Mini App bị từ chối.
2. **Kiểm tra chức năng end-to-end** — mỗi luồng chức năng đều hoạt động đúng.
3. **Kiểm tra giao diện & trải nghiệm** — không có màn hình trắng, nút chết, nội dung demo.
4. **Kiểm tra quyền riêng tư & xin quyền** — đúng ngữ cảnh, đúng mục đích.
5. **Đánh giá hiệu suất sơ bộ** — thời gian tải trong ngưỡng cho phép.
6. **Tạo báo cáo kiểm thử** — danh sách lỗi kèm ảnh chụp/video/log.

### A3. Phạm vi loại trừ (AI KHÔNG kiểm thử)

- Cài đặt VPS, cấu hình tên miền, chứng chỉ HTTPS
- Kiểm thử tải (load testing) trên máy chủ production
- Kiểm thử an toàn mạng, penetration testing
- Kiểm thử dự phòng & khôi phục máy chủ

---

## PHẦN B — QUY TẮC CHO AI AGENT

### B1. Nguyên tắc bắt buộc

```
QUY_TẮC_01: Mỗi test case phải kiểm tra CẢ trường hợp đúng VÀ trường hợp sai.
QUY_TẮC_02: Không chỉ kiểm tra giao diện — phải xác nhận dữ liệu phía backend.
QUY_TẮC_03: Ghi nhận MỌI lỗi bằng ảnh chụp, video hoặc log.
QUY_TẮC_04: Phân loại lỗi theo 3 mức: NGHIÊM_TRỌNG | TRUNG_BÌNH | NHẸ.
QUY_TẮC_05: Đánh dấu rõ test case nào liên quan trực tiếp đến chính sách kiểm duyệt.
QUY_TẮC_06: Mô phỏng góc nhìn người dùng lần đầu sử dụng.
QUY_TẮC_07: Không sử dụng dữ liệu cá nhân thật khi kiểm thử.
QUY_TẮC_08: Kiểm tra trên thiết bị Zalo thật, không chỉ trình duyệt.
```

### B2. Phân loại mức nghiêm trọng

| Mức | Ý nghĩa | Ví dụ |
|---|---|---|
| 🔴 **NGHIÊM_TRỌNG** | Vi phạm chính sách → bị từ chối kiểm duyệt | Logo sai, tên chứa "App", xin quyền khi vừa mở, liên kết ngoài, tính năng demo |
| 🟡 **TRUNG_BÌNH** | Lỗi chức năng ảnh hưởng trải nghiệm | Gửi form không thành công, danh sách trống không có hướng dẫn, ảnh không tải |
| 🟢 **NHẸ** | Lỗi hiển thị nhỏ, không ảnh hưởng chức năng | Lỗi chính tả, khoảng trắng thừa, màu sắc chưa đồng bộ |

### B3. Cấu trúc báo cáo lỗi

Mỗi lỗi được AI ghi nhận phải có đầy đủ:

```json
{
  "mã_test_case": "META-01",
  "nhóm_kiểm_thử": "Nhóm 1 – Logo, tên, mô tả",
  "mô_tả_lỗi": "Logo có nền trong suốt",
  "mức_nghiêm_trọng": "NGHIÊM_TRỌNG",
  "chính_sách_vi_phạm": "Mục 1.2 – Logo phù hợp với chức năng Mini App",
  "bước_tái_hiện": ["Mở Mini App", "Quan sát logo trên thanh tiêu đề"],
  "kết_quả_thực_tế": "Logo hiển thị nền trong suốt, bị mất hình trên nền tối",
  "kết_quả_mong_đợi": "Logo có nền rõ ràng, không trong suốt",
  "bằng_chứng": "screenshot_meta01_logo.png",
  "trạng_thái": "CHƯA_SỬA"
}
```

---

## PHẦN C — CÁC NHÓM KIỂM THỬ CHI TIẾT

---

### 🔴 NHÓM 1: LOGO, TÊN VÀ MÔ TẢ MINI APP
**Độ ưu tiên: CAO NHẤT — Vi phạm = bị từ chối ngay**

> **Căn cứ chính sách Zalo:**
> - §1: Logo chính chủ, không giả mạo; phù hợp chức năng; không chứa SĐT, QR code; không nền trong suốt.
> - §2: Tên phù hợp chức năng; không viết hoa toàn bộ; không chứa "App", "Mini App", "Zalo", ký tự đặc biệt, emoji; cần có tiền tố/hậu tố xác định đơn vị sở hữu.
> - §3: Mô tả phù hợp chức năng; không chứa đường liên kết; không vi phạm thuần phong mỹ tục.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Điều khoản chính sách | Mức |
|---|---|---|---|---|
| META-01 | Kiểm tra logo hiển thị đầy đủ, rõ nét | Logo không méo, không mất góc | §1.1, §1.2 | 🔴 |
| META-02 | Kiểm tra logo là logo chính chủ của UBND phường | Thuộc đơn vị hoặc được cấp phép | §1.1 | 🔴 |
| META-03 | Kiểm tra logo không chứa số điện thoại, QR code | Không có SĐT, QR | §1.2 | 🔴 |
| META-04 | Kiểm tra logo không dùng nền trong suốt | Nền logo có màu, không transparent | §1.2 | 🔴 |
| META-05 | Kiểm tra logo phù hợp với UBND phường, mục đích phục vụ người dân | Logo phản ánh đúng đơn vị và chức năng | §1.2 | 🔴 |
| META-06 | Kiểm tra tên Mini App phản ánh đúng đơn vị và chức năng | Tên gợi đúng UBND phường Tùng Thiện | §2.1 | 🔴 |
| META-07 | Kiểm tra tên không viết hoa toàn bộ | Không phải dạng "UBND PHƯỜNG TÙNG THIỆN" | §2.2 | 🔴 |
| META-08 | Kiểm tra tên không chứa "App", "Mini App", "Zalo" | Không có từ bị hạn chế | §2.2 | 🔴 |
| META-09 | Kiểm tra tên không chứa emoji hoặc ký tự `#`, `$`, `@`, `!` | Tên sạch | §2.2 | 🔴 |
| META-10 | Kiểm tra mô tả nêu rõ chức năng, đối tượng, mục đích | Mô tả cụ thể, chính xác | §3.1 | 🔴 |
| META-11 | Kiểm tra mô tả không chứa URL | Không có liên kết | §3.2 | 🔴 |
| META-12 | Đối chiếu mô tả với chức năng thực tế | Không mô tả chức năng chưa có hoặc đã ẩn | §3.1 | 🔴 |

**AI Hướng dẫn thực hiện:**
1. Truy cập trang cấu hình Mini App trên Zalo Developer Portal.
2. Chụp screenshot logo, tên, mô tả.
3. Đối chiếu từng mục với checklist trên.
4. Kiểm tra logo bằng cách tải về và kiểm tra kênh alpha (nền trong suốt).
5. Dùng regex kiểm tra tên: `/(APP|MINI APP|ZALO|[#$@!]|[\u{1F600}-\u{1F9FF}])/iu`.

**Tiêu chí ĐẠT:** 12/12 test case PASS, không có lỗi NGHIÊM_TRỌNG.

---

### 🔴 NHÓM 2: KHỞI ĐỘNG VÀ ĐIỀU HƯỚNG
**Độ ưu tiên: CAO — Liên quan §5.1 (tính năng hoạt động bình thường) và §5.2 (sự cố khi sử dụng)**

> **Căn cứ chính sách Zalo:**
> - §5.1: Tất cả tính năng phải hoạt động bình thường. Tính năng ở trạng thái demo → vi phạm.
> - §5.2: Mini App bị treo, màn hình trắng/tối → vi phạm.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| NAV-01 | Mở Mini App lần đầu | Hiển thị đúng trang chủ, không màn hình trắng | 🔴 |
| NAV-02 | Mở lại Mini App sau khi đã đóng | Không treo, không trắng | 🔴 |
| NAV-03 | Chuyển giữa các tab chính | Tab đúng, trạng thái đúng | 🟡 |
| NAV-04 | Nhấn nút quay lại | Trở về đúng màn hình trước | 🟡 |
| NAV-05 | Nhấn nhanh liên tục vào một nút | Không mở trùng, không gửi trùng request | 🟡 |
| NAV-06 | Đóng rồi mở lại Mini App | Khởi động bình thường | 🟡 |
| NAV-07 | Chuyển Zalo sang background rồi quay lại | Giao diện và dữ liệu giữ nguyên | 🟡 |
| NAV-08 | Mất mạng khi đang mở trang | Hiển thị thông báo lỗi rõ ràng, không trắng | 🔴 |
| NAV-09 | Có mạng trở lại sau khi mất | Có thể tải lại nội dung | 🟡 |
| NAV-10 | API trả về lỗi (500, 404...) | Không hiển thị thông báo kỹ thuật, có fallback UI | 🔴 |
| NAV-11 | Danh sách không có dữ liệu | Hiển thị trạng thái rỗng có hướng dẫn (empty state) | 🟡 |
| NAV-12 | Nội dung đang tải | Có loading indicator, không màn hình bất động | 🟡 |

**AI Hướng dẫn thực hiện:**
1. Mở Mini App trong Zalo → quan sát thời gian load, có blank screen không.
2. Điều hướng qua tất cả các tab, ghi lại trạng thái mỗi tab.
3. Dùng DevTools throttle mạng để mô phỏng mất kết nối.
4. Kiểm tra mỗi trang khi API trả lỗi (mock 500/404).
5. Chụp screenshot mọi trạng thái bất thường.

**Tiêu chí ĐẠT:** Không có màn hình trắng/treo. Tất cả NAV-* mức 🔴 phải PASS.

---

### 🟡 NHÓM 3: GIAO DIỆN VÀ NỘI DUNG HIỂN THỊ
**Độ ưu tiên: CAO — Liên quan §4.7 (hình ảnh, văn bản)**

> **Căn cứ chính sách Zalo:**
> - §4.7: Hình ảnh không tải được → vi phạm. Lỗi font hoặc font khó đọc → vi phạm.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| UI-01 | Kiểm tra font chữ | Dễ đọc, hiển thị đúng tiếng Việt có dấu | 🔴 |
| UI-02 | Kiểm tra dấu tiếng Việt | Không lỗi mã hóa, không mất dấu | 🔴 |
| UI-03 | Kiểm tra cỡ chữ | Không quá nhỏ (<12px), không bị cắt | 🟡 |
| UI-04 | Kiểm tra tiêu đề dài | Xuống dòng hợp lý, không tràn | 🟡 |
| UI-05 | Kiểm tra nội dung dài | Không tràn ra ngoài container | 🟡 |
| UI-06 | Kiểm tra nút bấm | Nội dung nút rõ nghĩa, vùng tap ≥ 44x44px | 🟡 |
| UI-07 | Kiểm tra biểu tượng/icon | Đúng chức năng, không sai ngữ cảnh | 🟢 |
| UI-08 | Kiểm tra ảnh sự kiện | Ảnh tải được, không méo, đúng tỷ lệ | 🔴 |
| UI-09 | Kiểm tra ảnh di tích | Hiển thị rõ, đúng nội dung | 🔴 |
| UI-10 | Kiểm tra fallback khi ảnh lỗi | Có ảnh thay thế hoặc placeholder phù hợp | 🔴 |
| UI-11 | Kiểm tra trên màn hình nhỏ (≤5.5") | Không tràn chữ, chồng nút | 🟡 |
| UI-12 | Kiểm tra trên màn hình lớn (≥6.7") | Bố cục cân đối, không trống quá nhiều | 🟡 |
| UI-13 | Kiểm tra bàn phím ảo | Không che trường nhập hoặc nút gửi | 🟡 |
| UI-14 | Kiểm tra cuộn trang | Mượt, không mất nội dung | 🟡 |
| UI-15 | Kiểm tra tương phản màu sắc | Contrast ratio ≥ 4.5:1 cho text thường | 🟡 |
| UI-16 | Kiểm tra thông báo hệ thống | Nội dung rõ ràng bằng tiếng Việt, không hiển thị mã lỗi | 🟡 |
| UI-17 | Kiểm tra lỗi chính tả | Không còn lỗi chính tả, câu văn rõ ràng | 🟢 |
| UI-18 | Kiểm tra thuật ngữ hành chính | Dùng thống nhất (VD: "phường" không viết "Phường" lẫn lộn) | 🟢 |

**AI Hướng dẫn thực hiện:**
1. Crawl qua tất cả các trang của Mini App.
2. Kiểm tra mọi thẻ `<img>` — xác nhận src hợp lệ, có alt text, có fallback handler.
3. Kiểm tra CSS font-family — xác nhận có web-safe fallback cho tiếng Việt.
4. Dùng DevTools responsive mode kiểm tra nhiều kích thước màn hình.
5. Quét toàn bộ text hiển thị qua spell-checker tiếng Việt nếu có.

**Tiêu chí ĐẠT:** Tất cả UI-* mức 🔴 PASS. Không quá 3 lỗi mức 🟡.

---

### 🟡 NHÓM 4: TRANG CHỦ
**Độ ưu tiên: CAO — Trang đầu tiên người kiểm duyệt nhìn thấy**

> **Căn cứ chính sách Zalo:**
> - §5.1: Tính năng ở trạng thái demo → vi phạm.
> - §4.3: Không có quảng cáo kiếm tiền.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| HOME-01 | Mở trang chủ | Hiển thị đầy đủ nhóm tiện ích | 🔴 |
| HOME-02 | Kiểm tra tên từng tiện ích | Tên ngắn gọn, dễ hiểu, đúng chức năng | 🟡 |
| HOME-03 | Nhấn từng tiện ích trên trang chủ | Mở đúng chức năng tương ứng | 🔴 |
| HOME-04 | Kiểm tra banner (nếu có) | Rõ ràng, không mang tính quảng cáo thương mại | 🔴 |
| HOME-05 | Kiểm tra nội dung nổi bật | Không có dữ liệu sai hoặc hết hiệu lực | 🟡 |
| HOME-06 | Kiểm tra thứ tự sắp xếp chức năng | Chức năng thiết yếu ưu tiên lên trước | 🟢 |
| HOME-07 | Tìm kiếm chức năng chưa hoàn thiện | Không có trên bản submit | 🔴 |
| HOME-08 | Tìm kiếm nút không phản hồi | Không tồn tại nút "chết" | 🔴 |
| HOME-09 | Tìm kiếm nội dung "Demo" | Không còn text "Demo" bất kỳ đâu | 🔴 |
| HOME-10 | Tìm kiếm nội dung "Đang phát triển" | Không hiển thị trên phiên bản xét duyệt | 🔴 |

**AI Hướng dẫn thực hiện:**
1. Mở trang chủ → chụp full screenshot.
2. Grep toàn bộ text trên trang: tìm `demo`, `đang phát triển`, `coming soon`, `test`, `TODO`.
3. Click vào TỪNG tiện ích/nút → ghi nhận có phản hồi hay không.
4. Kiểm tra banner: phân tích nội dung có chứa thương hiệu bên thứ 3 hoặc CTA quảng cáo không.

**Tiêu chí ĐẠT:** Tất cả HOME-* mức 🔴 PASS. Không có nút chết hoặc nội dung demo.

---

### 🟡 NHÓM 5: SỰ KIỆN

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| EVT-01 | Mở danh sách sự kiện | Tải thành công, có loading | 🟡 |
| EVT-02 | Kiểm tra ảnh sự kiện | Ảnh đúng, rõ, không méo | 🔴 |
| EVT-03 | Kiểm tra tiêu đề | Đầy đủ hoặc rút gọn hợp lý (có tooltip/ellipsis) | 🟡 |
| EVT-04 | Kiểm tra định dạng thời gian | Đúng format ngày/giờ thống nhất | 🟡 |
| EVT-05 | Kiểm tra địa điểm | Hiển thị đúng, đầy đủ | 🟡 |
| EVT-06 | Mở chi tiết sự kiện | Nội dung khớp với danh sách | 🟡 |
| EVT-07 | Sự kiện đã kết thúc | Có nhãn trạng thái rõ ràng | 🟡 |
| EVT-08 | Không có sự kiện nào | Hiển thị empty state phù hợp | 🟡 |
| EVT-09 | Sự kiện có nội dung rất dài | Không tràn bố cục, có thể cuộn | 🟡 |
| EVT-10 | Ảnh sự kiện bị lỗi | Có fallback image | 🔴 |

---

### 🟡 NHÓM 6: THÔNG TIN DI TÍCH LỊCH SỬ

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| HER-01 | Mở danh sách di tích | Hiển thị đúng dữ liệu | 🟡 |
| HER-02 | Mở từng trang chi tiết | Điều hướng đúng | 🟡 |
| HER-03 | Kiểm tra tên di tích | Đúng theo tài liệu được phê duyệt | 🟡 |
| HER-04 | Kiểm tra nội dung lịch sử | Không sai lệch, không bổ sung vô căn cứ | 🟡 |
| HER-05 | Kiểm tra hình ảnh | Đúng di tích, tải được | 🔴 |
| HER-06 | Kiểm tra chú thích ảnh | Chính xác, rõ ràng | 🟢 |
| HER-07 | Nội dung dài | Hiển thị đầy đủ, có thể cuộn | 🟡 |
| HER-08 | Kiểm tra năm, tên riêng | Không sai chính tả | 🟡 |
| HER-09 | Thiếu ảnh | Có phương án hiển thị thay thế | 🔴 |
| HER-10 | Nguồn nội dung | Có thể đối chiếu với tài liệu gốc | 🟡 |

---

### 🔴 NHÓM 7: PHẢN ÁNH, KIẾN NGHỊ
**Độ ưu tiên: CAO — Chức năng chính, yêu cầu xin quyền**

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| FB-01 | Mở biểu mẫu phản ánh | Hiển thị đầy đủ các trường | 🟡 |
| FB-02 | Gửi biểu mẫu hợp lệ | Gửi thành công + thông báo xác nhận | 🔴 |
| FB-03 | Bỏ trống trường bắt buộc | Validation hiện tại đúng trường bị thiếu | 🟡 |
| FB-04 | SĐT sai định dạng | Cảnh báo rõ ràng, không cho gửi | 🟡 |
| FB-05 | Nội dung quá ngắn | Hiển thị yêu cầu bổ sung | 🟡 |
| FB-06 | Nội dung rất dài | Hệ thống xử lý đúng giới hạn ký tự | 🟡 |
| FB-07 | Ký tự đặc biệt `<script>`, SQL injection | Không lỗi giao diện, dữ liệu được escape | 🔴 |
| FB-08 | Đính kèm ảnh hợp lệ | Ảnh được chọn + preview hiển thị | 🟡 |
| FB-09 | Ảnh dung lượng lớn (>5MB) | Có giới hạn hoặc thông báo rõ | 🟡 |
| FB-10 | Chọn tệp không hợp lệ (PDF, DOC) | Không nhận hoặc cảnh báo | 🟡 |
| FB-11 | Xóa ảnh đã chọn | Ảnh được loại bỏ khỏi form | 🟡 |
| FB-12 | Từ chối quyền camera | Vẫn dùng được chức năng không phụ thuộc camera | 🔴 |
| FB-13 | Nhấn gửi nhiều lần liên tiếp | Chỉ tạo 1 phản ánh (debounce/disable nút) | 🔴 |
| FB-14 | Mất mạng khi đang gửi | Không báo thành công sai | 🔴 |
| FB-15 | Gửi lại sau khi có mạng | Thao tác thành công | 🟡 |
| FB-16 | Kiểm tra dữ liệu trên admin | Phản ánh xuất hiện đúng trên trang quản trị | 🔴 |
| FB-17 | Kiểm tra dữ liệu không bị sai lệch | Không mất dấu, không sai thông tin | 🟡 |
| FB-18 | Thông báo thành công | Nội dung rõ ràng, không gây hiểu nhầm | 🟡 |
| FB-19 | Dữ liệu nhạy cảm | Không tự động hiển thị công khai | 🔴 |
| FB-20 | Quay lại sau khi gửi | Form được reset đúng trạng thái | 🟡 |

**AI Hướng dẫn thực hiện:**
1. Điền form hợp lệ → gửi → xác nhận trên admin.
2. Test validation: bỏ trống lần lượt từng trường → ghi nhận thông báo lỗi.
3. Test XSS: nhập `<script>alert(1)</script>` vào trường nội dung.
4. Test double submit: disable network delay + click liên tiếp.
5. Kiểm tra quyền camera: từ chối → đảm bảo không block toàn bộ form.

---

### 🔴 NHÓM 8: ĐẶT LỊCH LÀM VIỆC

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| APT-01 | Mở chức năng đặt lịch | Giao diện tải đầy đủ | 🟡 |
| APT-02 | Đặt lịch hợp lệ | Tạo lịch thành công + xác nhận | 🔴 |
| APT-03 | Bỏ trống họ tên | Có validation cảnh báo | 🟡 |
| APT-04 | Bỏ trống SĐT | Có validation cảnh báo | 🟡 |
| APT-05 | SĐT sai định dạng | Không chấp nhận | 🟡 |
| APT-06 | Bỏ trống nội dung làm việc | Có validation cảnh báo | 🟡 |
| APT-07 | Chọn ngày trong quá khứ | Không cho phép chọn | 🟡 |
| APT-08 | Chọn ngày nghỉ | Có thông báo rõ | 🟡 |
| APT-09 | Chọn khung giờ hết chỗ | Không tạo lịch, có thông báo | 🟡 |
| APT-10 | Gửi trùng lịch | Có cảnh báo hoặc kiểm soát | 🟡 |
| APT-11 | Nhấn gửi nhiều lần | Không tạo nhiều lịch trùng | 🔴 |
| APT-12 | Mất mạng khi gửi | Không báo thành công sai | 🔴 |
| APT-13 | Kiểm tra dữ liệu trên admin | Dữ liệu lịch hẹn chính xác | 🔴 |
| APT-14 | Thông báo xác nhận | Hiển thị ngày, giờ, nội dung chính | 🟡 |
| APT-15 | Định dạng ngày giờ | Thống nhất toàn Mini App | 🟡 |
| APT-16 | Thoát khi chưa gửi | Không tự lưu dữ liệu ngoài ý muốn | 🟡 |

---

### 🟡 NHÓM 9: BỘ CÂU HỎI KIẾN THỨC CHUYỂN ĐỔI SỐ

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| QUIZ-01 | Mở bộ câu hỏi | Hiển thị câu hỏi đầu tiên | 🟡 |
| QUIZ-02 | Chọn đáp án | Ghi nhận đúng lựa chọn | 🟡 |
| QUIZ-03 | Chuyển câu tiếp theo | Điều hướng đúng | 🟡 |
| QUIZ-04 | Chưa chọn đáp án, nhấn tiếp | Có cảnh báo hoặc xử lý theo thiết kế | 🟡 |
| QUIZ-05 | Quay lại câu trước | Giữ lựa chọn đã thực hiện | 🟡 |
| QUIZ-06 | Hoàn thành bài | Hiển thị kết quả rõ ràng | 🔴 |
| QUIZ-07 | Trả lời đúng toàn bộ | Điểm = 100% | 🟡 |
| QUIZ-08 | Trả lời sai toàn bộ | Điểm = 0% | 🟡 |
| QUIZ-09 | Đáp án đúng khớp dữ liệu admin | Không sai lệch | 🔴 |
| QUIZ-10 | Làm lại bài | Khởi tạo lượt mới, reset kết quả | 🟡 |
| QUIZ-11 | Thoát giữa chừng | Xử lý trạng thái theo thiết kế | 🟡 |
| QUIZ-12 | Câu hỏi có nội dung dài | Không tràn bố cục | 🟡 |
| QUIZ-13 | Đáp án có nội dung dài | Không bị che hoặc mất nội dung | 🟡 |
| QUIZ-14 | Không tải được câu hỏi | Có thông báo + nút thử lại | 🟡 |
| QUIZ-15 | Nhấn nhanh nhiều lần | Không bỏ qua câu hoặc ghi nhận sai | 🟡 |

---

### 🟡 NHÓM 10: ZALO OA VÀ TÍCH HỢP

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| OA-01 | Nhấn nút nhắn tin OA | Mở đúng OA của UBND phường | 🔴 |
| OA-02 | Kiểm tra tên OA | Đúng đơn vị sở hữu | 🟡 |
| OA-03 | Kiểm tra OA hoạt động | OA active, có nội dung | 🟡 |
| OA-04 | Từ chối quan tâm OA | Vẫn dùng được các chức năng khác | 🔴 |
| OA-05 | Đồng ý quan tâm OA | Hoàn tất đúng quy trình | 🟡 |
| OA-06 | Xin quyền tương tác OA | Chỉ xin khi có ngữ cảnh phù hợp | 🔴 |
| OA-07 | Quay lại Mini App từ OA | Trở lại đúng trạng thái | 🟡 |
| OA-08 | OA không khả dụng | Có thông báo hoặc xử lý phù hợp | 🟡 |

---

### 🔴 NHÓM 11: LIÊN KẾT NGOÀI
**Độ ưu tiên: CAO NHẤT — Vi phạm phổ biến nhất**

> **Căn cứ chính sách Zalo:**
> - §4.1: Không điều hướng ra liên kết ngoài. Ngoại trừ Chính sách bảo mật, Điều khoản sử dụng.
> - Nếu có liên kết ngoài: phải **ẩn**, **vô hiệu hóa** hoặc **nhúng** trực tiếp trong Mini App.
> - Không khuyến khích tải ứng dụng riêng.
> - Không điều hướng đăng nhập Google, Facebook.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| LINK-01 | Thống kê toàn bộ liên kết ngoài | Có danh sách đầy đủ | 🔴 |
| LINK-02 | Kiểm tra mục đích từng liên kết | Có lý do nghiệp vụ rõ ràng | 🔴 |
| LINK-03 | Liên kết chính sách bảo mật | Mở đúng nội dung (ưu tiên nhúng) | 🟡 |
| LINK-04 | Liên kết điều khoản sử dụng | Mở đúng nội dung (ưu tiên nhúng) | 🟡 |
| LINK-05 | Kiểm tra liên kết lỗi 404 | Không có liên kết chết | 🟡 |
| LINK-06 | Kiểm tra liên kết không an toàn (HTTP) | Không có liên kết HTTP thuần | 🟡 |
| LINK-07 | Nút Cổng dịch vụ công | ⚠️ Đánh giá rủi ro — xem xét ẩn trước submit | 🔴 |
| LINK-08 | Nút VNeID | ⚠️ Đánh giá rủi ro — xem xét ẩn trước submit | 🔴 |
| LINK-09 | Nút Trang thông tin điện tử | ⚠️ Đánh giá rủi ro — xem xét ẩn trước submit | 🔴 |
| LINK-10 | Quảng bá ứng dụng khác | Không có CTA tải app riêng | 🔴 |
| LINK-11 | Đăng nhập bên thứ 3 | Không yêu cầu Google/Facebook login | 🔴 |
| LINK-12 | Khả năng nhúng nội dung | Ưu tiên popup/trang nội bộ khi có thể | 🟡 |

**AI Hướng dẫn thực hiện:**
1. Crawl DOM toàn bộ Mini App → tìm tất cả thẻ `<a href="http...">` dẫn ra ngoài domain.
2. Lập bảng: [URL] → [Trang chứa] → [Mục đích] → [Đánh giá rủi ro].
3. Với mỗi liên kết ngoài: kiểm tra có phải chính sách/điều khoản không → nếu KHÔNG → đánh dấu 🔴.
4. Đặc biệt: liên kết tới Cổng DVC, VNeID, TTĐT → liên hệ kênh "Zalo chuyển đổi số" trước khi submit.

**Tiêu chí ĐẠT:** Không có liên kết ngoài trái phép. Các liên kết rủi ro đã được ẩn hoặc nhúng.

---

### 🔴 NHÓM 12: XIN QUYỀN NGƯỜI DÙNG
**Độ ưu tiên: CAO NHẤT — Vi phạm = bị từ chối**

> **Căn cứ chính sách Zalo:**
> - §6.1: Không xin quyền khi vừa vào Mini App. Phải có ngữ cảnh rõ ràng.
> - §6.2: Không giả mạo giao diện nền tảng.
> - §6.3: Không bắt cấp quyền để sử dụng. Từ chối → vẫn dùng được tính năng khác.
> - §6.4: Không bắt đăng nhập/đăng ký để sử dụng. Người dùng có thể trải nghiệm mà không cần đăng nhập.
> - §6.5: Liên kết tài khoản phải dùng đúng tên "Liên kết tài khoản".
> - API cá nhân chỉ kích hoạt dựa trên hành vi người dùng.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| PER-01 | Mở Mini App lần đầu | **KHÔNG** tự động xin bất kỳ quyền nào | 🔴 |
| PER-02 | Quyền tên + ảnh đại diện | Chỉ xin khi tính năng thực sự cần | 🔴 |
| PER-03 | Quyền số điện thoại | Có giải thích mục đích TRƯỚC khi xin | 🔴 |
| PER-04 | Quyền camera | Chỉ xin khi nhấn nút chụp ảnh | 🔴 |
| PER-05 | Quyền vị trí | Chỉ xin tại chức năng cần vị trí | 🔴 |
| PER-06 | Quyền gửi thông báo | Có ngữ cảnh + giải thích lợi ích | 🔴 |
| PER-07 | Quyền quan tâm OA | Không bắt buộc ngay khi mở | 🔴 |
| PER-08 | Quyền tương tác OA | Chỉ xin khi có thao tác liên quan | 🔴 |
| PER-09 | Người dùng đồng ý | Chức năng hoạt động đúng | 🟡 |
| PER-10 | Người dùng từ chối | Chức năng khác vẫn sử dụng được | 🔴 |
| PER-11 | Người dùng đóng hộp thoại | Không treo, không chặn Mini App | 🔴 |
| PER-12 | Xin lại quyền | Không xin liên tục gây khó chịu | 🟡 |
| PER-13 | Giải thích trước khi xin quyền | Nội dung cụ thể, dễ hiểu | 🔴 |
| PER-14 | Giao diện xin quyền | Sử dụng giao diện CHUẨN của Zalo | 🔴 |
| PER-15 | Kiểm tra giao diện giả | Không tự thiết kế giao diện giống Zalo để lừa | 🔴 |
| PER-16 | Dữ liệu sau cấp quyền | Chỉ dùng đúng mục đích đã thông báo | 🔴 |
| PER-17 | Dữ liệu khi không cấp quyền | Không tự lấy/hiển thị dữ liệu | 🔴 |
| PER-18 | Bắt buộc đăng nhập | Người dùng vẫn xem được nội dung công khai | 🔴 |
| PER-19 | Khóa toàn bộ chức năng | Không bắt cấp quyền không cần thiết | 🔴 |
| PER-20 | Thông báo lỗi quyền | Hướng dẫn rõ ràng, không gây áp lực | 🟡 |

**Ma trận quyền tham chiếu:**

| Quyền | Chức năng | Thời điểm xin | Khi từ chối |
|---|---|---|---|
| Tên, ảnh | Cá nhân hóa / biểu mẫu | Khi chọn dùng thông tin Zalo | Cho nhập thủ công |
| SĐT | Phản ánh, đặt lịch | Khi chọn lấy SĐT từ Zalo | Cho nhập thủ công |
| Camera | Chụp ảnh phản ánh | Khi nhấn nút chụp | Cho chọn ảnh từ thư viện |
| Vị trí | Xác định hiện trường | Khi chọn lấy vị trí | Cho nhập địa chỉ thủ công |
| Thông báo | Nhắc lịch, xử lý phản ánh | Sau khi giải thích lợi ích | Không ảnh hưởng chức năng |
| Quan tâm OA | Nhận tin UBND | Khi người dùng chủ động chọn | Vẫn dùng Mini App |
| Tương tác OA | Nhắn tin/nhận phản hồi | Khi mở chức năng nhắn tin | Có hướng dẫn thay thế |

**AI Hướng dẫn thực hiện:**
1. Mở Mini App với tài khoản mới → GHI LẠI toàn bộ permission dialog xuất hiện.
2. Nếu có bất kỳ dialog xin quyền nào xuất hiện TRƯỚC khi người dùng thao tác → 🔴 FAIL.
3. Duyệt qua code: tìm `getPhoneNumber`, `getUserInfo`, `getLocation`, `authorize` → kiểm tra ngữ cảnh gọi.
4. Từ chối tất cả quyền → kiểm tra Mini App vẫn hoạt động được các chức năng công khai.

---

### 🔴 NHÓM 13: ĐĂNG NHẬP VÀ TRẢI NGHIỆM KHÔNG CẦN TÀI KHOẢN

> **Căn cứ chính sách Zalo:**
> - §6.4: Không bắt đăng ký/đăng nhập. Người dùng có thể trải nghiệm dịch vụ mà không cần đăng nhập.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| AUTH-01 | Mở Mini App không đăng nhập riêng | Xem được trang chủ | 🔴 |
| AUTH-02 | Xem sự kiện | Không cần tài khoản riêng | 🔴 |
| AUTH-03 | Xem di tích | Không cần tài khoản riêng | 🔴 |
| AUTH-04 | Làm bộ câu hỏi | Không bắt đăng ký | 🔴 |
| AUTH-05 | Gửi phản ánh | Chỉ yêu cầu thông tin cần thiết | 🟡 |
| AUTH-06 | Đặt lịch | Chỉ yêu cầu thông tin phục vụ lịch hẹn | 🟡 |
| AUTH-07 | Kiểm tra màn hình đăng nhập | Không xuất hiện nếu không có lý do nghiệp vụ | 🔴 |
| AUTH-08 | Đăng nhập bên thứ 3 | Không yêu cầu Google/Facebook | 🔴 |
| AUTH-09 | "Liên kết tài khoản" (nếu có) | Dùng đúng tên "Liên kết tài khoản" | 🟡 |
| AUTH-10 | Người dùng từ chối cung cấp dữ liệu | Vẫn xem được nội dung công khai | 🔴 |

---

### 🔴 NHÓM 14: QUYỀN RIÊNG TƯ VÀ BẢO VỆ DỮ LIỆU

> **Căn cứ chính sách Zalo:**
> - §7: Thu thập dữ liệu phải có sự đồng ý rõ ràng, minh bạch. Không chứa mã độc. Không chia sẻ bên thứ 3 khi chưa có sự cho phép.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| PRI-01 | Liệt kê dữ liệu được thu thập | Có danh sách cụ thể | 🔴 |
| PRI-02 | Mục đích thu thập | Mỗi dữ liệu có mục đích rõ | 🔴 |
| PRI-03 | Sự đồng ý của người dùng | Có thông báo + hành động đồng ý rõ ràng | 🔴 |
| PRI-04 | Dữ liệu không cần thiết | Không thu thập vượt quá nhu cầu | 🟡 |
| PRI-05 | SĐT người phản ánh | Không hiển thị công khai | 🔴 |
| PRI-06 | Ảnh phản ánh | Không hiển thị sai đối tượng | 🔴 |
| PRI-07 | Nội dung phản ánh | Chỉ admin có thẩm quyền truy cập | 🔴 |
| PRI-08 | Dữ liệu lịch hẹn | Không lộ cho người dùng khác | 🔴 |
| PRI-09 | Console log frontend | Không ghi dữ liệu nhạy cảm ra console | 🟡 |
| PRI-10 | Thông báo lỗi | Không làm lộ token, API path, credentials | 🔴 |
| PRI-11 | Chia sẻ bên thứ 3 | Có thông báo rõ nếu phát sinh | 🔴 |
| PRI-12 | Dữ liệu kiểm thử | Không dùng thông tin cá nhân thật | 🟡 |
| PRI-13 | Phân quyền admin | Người không có quyền không xem được | 🔴 |
| PRI-14 | Sau đăng xuất admin | Không còn hiển thị dữ liệu | 🟡 |
| PRI-15 | Chính sách xóa dữ liệu | Có nội dung hoặc đầu mối liên hệ | 🟡 |

**AI Hướng dẫn thực hiện:**
1. Kiểm tra DevTools Console → tìm `console.log` chứa token, SĐT, tên người dùng.
2. Kiểm tra Network tab → xác nhận API response không trả thừa dữ liệu nhạy cảm.
3. Kiểm tra error handler → khi API lỗi, thông báo không chứa stack trace hoặc API endpoint.

---

### 🔴 NHÓM 15: CHÍNH SÁCH BẢO MẬT VÀ ĐIỀU KHOẢN SỬ DỤNG

> **Căn cứ chính sách Zalo:**
> - §4.8: Nội dung chính sách - điều khoản chung chung → vi phạm. Tiêu đề phải thể hiện rõ chính sách của Mini App nào.

**Chính sách bảo mật cần có tối thiểu:**
- [ ] Tên Mini App
- [ ] Tên đơn vị quản lý (UBND phường Tùng Thiện)
- [ ] Phạm vi áp dụng
- [ ] Loại dữ liệu thu thập
- [ ] Mục đích thu thập
- [ ] Cách thức sử dụng dữ liệu
- [ ] Phạm vi chia sẻ dữ liệu
- [ ] Thời gian lưu trữ
- [ ] Biện pháp bảo vệ dữ liệu
- [ ] Quyền của người dùng
- [ ] Cách yêu cầu cập nhật/xóa dữ liệu
- [ ] Thông tin liên hệ
- [ ] Ngày có hiệu lực

**Điều khoản sử dụng cần có tối thiểu:**
- [ ] Tên Mini App và đơn vị cung cấp
- [ ] Đối tượng sử dụng
- [ ] Phạm vi chức năng
- [ ] Trách nhiệm người dùng
- [ ] Hành vi bị cấm
- [ ] Quy định phản ánh
- [ ] Quy định đặt lịch
- [ ] Giới hạn trách nhiệm
- [ ] Quyền thay đổi nội dung
- [ ] Thông tin liên hệ
- [ ] Ngày có hiệu lực

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| POL-01 | Tiêu đề chính sách | Nêu đúng tên Mini App | 🔴 |
| POL-02 | Đơn vị quản lý | Ghi rõ UBND phường Tùng Thiện | 🔴 |
| POL-03 | Loại dữ liệu | Liệt kê đầy đủ | 🔴 |
| POL-04 | Mục đích sử dụng | Cụ thể, không chung chung | 🔴 |
| POL-05 | Quyền người dùng | Nội dung rõ ràng | 🔴 |
| POL-06 | Đầu mối liên hệ | Có thông tin hợp lệ | 🟡 |
| POL-07 | Ngày hiệu lực | Có ngày ban hành/cập nhật | 🟡 |
| POL-08 | Hiển thị trên điện thoại | Dễ đọc, dễ cuộn | 🟡 |
| POL-09 | Điều hướng | Mở được và quay lại | 🟡 |
| POL-10 | Khớp chức năng thực tế | Không nêu chức năng không tồn tại | 🔴 |

---

### 🟡 NHÓM 16: NỘI DUNG PHÁP LÝ VÀ TÍNH PHÙ HỢP

> **Căn cứ chính sách Zalo:**
> - §4.2: Nội dung sai lệch, lừa đảo, vi phạm pháp luật → vi phạm.
> - §4.3: Quảng cáo kiếm tiền → vi phạm.
> - §4.4: Vật phẩm ảo, tiền điện tử → vi phạm.
> - §4.5: Rút tiền/Trả thưởng → vi phạm.
> - §4.6: Tính năng mạng xã hội hoặc cạnh tranh Zalo → vi phạm.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| LEG-01 | Nội dung hành chính | Đúng chức năng, thẩm quyền UBND phường | 🟡 |
| LEG-02 | Nội dung lịch sử | Có nguồn/tài liệu đối chiếu | 🟡 |
| LEG-03 | Tin tức, sự kiện | Chính xác, còn hiệu lực | 🟡 |
| LEG-04 | Hình ảnh | Có quyền sử dụng | 🟡 |
| LEG-05 | Logo đơn vị khác | Không sử dụng trái phép | 🔴 |
| LEG-06 | Nội dung quảng cáo | Không có quảng cáo kiếm tiền | 🔴 |
| LEG-07 | Sản phẩm thương mại | Không quảng bá không phù hợp | 🔴 |
| LEG-08 | Nội dung nhạy cảm | Không vi phạm pháp luật | 🔴 |
| LEG-09 | Dữ liệu giả định | Không trình bày test data như dữ liệu thật | 🔴 |
| LEG-10 | Nội dung người dùng nhập | Có biện pháp hạn chế nội dung xấu | 🟡 |

---

### 🟡 NHÓM 17: HIỆU SUẤT

> **Căn cứ chính sách Zalo:**
> - §5.3: Thời gian tải > 10 giây → vi phạm. LCP < 2.5 giây. PageLoad < 1.5 giây.

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| PERF-01 | Thời gian mở trang chủ | < 10 giây (hard limit), mục tiêu < 3 giây | 🔴 |
| PERF-02 | Page Load Time | Mục tiêu < 1.5 giây | 🟡 |
| PERF-03 | LCP (Largest Contentful Paint) | Mục tiêu < 2.5 giây | 🟡 |
| PERF-04 | Mở danh sách sự kiện | Có loading, hiển thị nhanh | 🟡 |
| PERF-05 | Mở chi tiết di tích | Nội dung không chờ quá lâu | 🟡 |
| PERF-06 | Tải ảnh | Ảnh được nén, kích thước phù hợp | 🟡 |
| PERF-07 | Gửi phản ánh | Có loading state rõ ràng | 🟡 |
| PERF-08 | Đặt lịch | Nút gửi không ở trạng thái bất định | 🟡 |
| PERF-09 | API chậm (>5s) | Có timeout + thông báo | 🟡 |
| PERF-10 | Nhiều thao tác liên tục | Không treo Mini App | 🔴 |
| PERF-11 | Danh sách nhiều bản ghi | Cuộn mượt, không giật | 🟡 |
| PERF-12 | Bộ câu hỏi nhiều câu | Không chậm dần | 🟡 |
| PERF-13 | Mở ứng dụng nhiều lần | Không memory leak rõ rệt | 🟡 |
| PERF-14 | Tải lại dữ liệu | Không gọi API trùng lặp quá mức | 🟡 |

**AI Hướng dẫn thực hiện:**
1. Đo LCP và Page Load bằng Lighthouse hoặc Zalo DevTools Performance.
2. Kiểm tra kích thước ảnh: > 500KB → đánh dấu cần nén.
3. Kiểm tra bundle size: main.js > 500KB → đánh dấu cần tối ưu.
4. Throttle mạng 3G → đo thời gian tải từng trang.

**Ngưỡng chấp nhận:**

| Chỉ số | Ngưỡng tối đa (vi phạm) | Mục tiêu tốt |
|---|---|---|
| Thời gian load trang/tính năng | > 10 giây | < 3 giây |
| LCP | - | < 2.5 giây |
| PageLoad Time | - | < 1.5 giây |
| Kích thước ảnh đơn lẻ | > 1MB | < 200KB |

---

### 🟡 NHÓM 18: LỖI VÀ KHẢ NĂNG PHỤC HỒI

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| ERR-01 | API lỗi 400 | Thông báo phù hợp cho người dùng | 🟡 |
| ERR-02 | API lỗi 401 | Không hiển thị nội dung kỹ thuật | 🟡 |
| ERR-03 | API lỗi 403 | Thông báo dễ hiểu | 🟡 |
| ERR-04 | API lỗi 404 | Không trang trắng | 🔴 |
| ERR-05 | API lỗi 500 | Có thể thử lại | 🔴 |
| ERR-06 | API không phản hồi (timeout) | Có xử lý timeout | 🟡 |
| ERR-07 | Mất mạng | Hiển thị trạng thái mất kết nối | 🔴 |
| ERR-08 | Có mạng trở lại | Có thể tải lại | 🟡 |
| ERR-09 | Dữ liệu trả về thiếu trường | Giao diện không vỡ | 🟡 |
| ERR-10 | Dữ liệu sai định dạng | Có error handling | 🟡 |
| ERR-11 | Ảnh không tồn tại | Có fallback image | 🔴 |
| ERR-12 | Người dùng nhấn gửi lại | Không tạo bản ghi trùng | 🟡 |
| ERR-13 | Đóng Mini App khi đang gửi | Không ghi dữ liệu sai | 🟡 |
| ERR-14 | Mở lại sau sự cố | Mini App hoạt động bình thường | 🟡 |
| ERR-15 | Lỗi JavaScript runtime | Không crash toàn bộ Mini App | 🔴 |

---

### 🟡 NHÓM 19: TRANG QUẢN TRỊ (ADMIN)

| Mã | Nội dung kiểm thử | Kết quả mong đợi | Mức |
|---|---|---|---|
| ADM-01 | Đăng nhập admin | Truy cập thành công | 🟡 |
| ADM-02 | Xem danh sách phản ánh | Hiển thị đầy đủ, đúng thứ tự | 🟡 |
| ADM-03 | Xem chi tiết phản ánh | Đúng nội dung người dùng gửi | 🔴 |
| ADM-04 | Xem danh sách lịch hẹn | Đầy đủ, chính xác | 🟡 |
| ADM-05 | Quản lý sự kiện (CRUD) | Thao tác đúng, đồng bộ Mini App | 🟡 |
| ADM-06 | Quản lý di tích (CRUD) | Thao tác đúng, đồng bộ Mini App | 🟡 |
| ADM-07 | Quản lý bộ câu hỏi | Thao tác đúng | 🟡 |
| ADM-08 | Số liệu thống kê | Hiển thị đúng, phản ánh dữ liệu thực | 🟡 |
| ADM-09 | Đồng bộ dữ liệu | Thay đổi trên admin → phản ánh trên Mini App | 🔴 |
| ADM-10 | Phân quyền | Người không có quyền bị chặn truy cập | 🔴 |

---

## PHẦN D — QUY TRÌNH KIỂM THỬ CHO AI

### D1. Thứ tự ưu tiên thực hiện

```
Đợt 1 (Bắt buộc trước submit):
  ├── Nhóm 1:  Logo, tên, mô tả          ← Vi phạm = từ chối ngay
  ├── Nhóm 11: Liên kết ngoài             ← Vi phạm phổ biến nhất
  ├── Nhóm 12: Xin quyền người dùng       ← Vi phạm = từ chối ngay
  ├── Nhóm 13: Đăng nhập                  ← Vi phạm = từ chối ngay
  └── Nhóm 15: Chính sách & điều khoản    ← Vi phạm = từ chối ngay

Đợt 2 (Quan trọng):
  ├── Nhóm 2:  Khởi động & điều hướng
  ├── Nhóm 4:  Trang chủ
  ├── Nhóm 14: Quyền riêng tư
  └── Nhóm 16: Nội dung pháp lý

Đợt 3 (Chức năng):
  ├── Nhóm 7:  Phản ánh kiến nghị
  ├── Nhóm 8:  Đặt lịch
  ├── Nhóm 9:  Bộ câu hỏi
  ├── Nhóm 10: Zalo OA

Đợt 4 (Nội dung & hiệu suất):
  ├── Nhóm 3:  Giao diện & hiển thị
  ├── Nhóm 5:  Sự kiện
  ├── Nhóm 6:  Di tích
  ├── Nhóm 17: Hiệu suất
  └── Nhóm 18: Lỗi & phục hồi

Đợt 5 (Quản trị):
  └── Nhóm 19: Trang admin
```

### D2. Điều kiện DỪNG kiểm thử

AI agent phải DỪNG và báo cáo ngay nếu phát hiện:
- Bất kỳ lỗi 🔴 NGHIÊM_TRỌNG nào ở Đợt 1 → không đủ điều kiện submit.
- Mini App bị treo hoặc màn hình trắng không thể phục hồi.
- Hơn 5 lỗi 🟡 TRUNG_BÌNH chưa được xử lý.

### D3. Tiêu chí ĐẠT toàn bộ

| Tiêu chí | Ngưỡng |
|---|---|
| Lỗi 🔴 NGHIÊM_TRỌNG | **0 lỗi** (không có ngoại lệ) |
| Lỗi 🟡 TRUNG_BÌNH | ≤ 3 lỗi (phải có kế hoạch sửa) |
| Lỗi 🟢 NHẸ | ≤ 10 lỗi (ghi nhận, sửa khi có thể) |
| Test case coverage | ≥ 95% các test case đã thực hiện |
| Chính sách Zalo | 100% các điều khoản §1–§7 tuân thủ |

---

## PHẦN E — DỮ LIỆU KIỂM THỬ CẦN CHUẨN BỊ

### E1. Dữ liệu sự kiện

| # | Mô tả | Mục đích |
|---|---|---|
| 1 | Sự kiện đang diễn ra | Test trạng thái "đang diễn ra" |
| 2 | Sự kiện sắp diễn ra | Test hiển thị tương lai |
| 3 | Sự kiện đã kết thúc | Test trạng thái "đã kết thúc" |
| 4 | Sự kiện có ảnh đại diện | Test hiển thị ảnh |
| 5 | Sự kiện không có ảnh | Test fallback image |
| 6 | Sự kiện nội dung dài | Test overflow |
| 7 | Sự kiện có thời gian + địa điểm cụ thể | Test format ngày giờ |

### E2. Dữ liệu di tích

| # | Mô tả | Mục đích |
|---|---|---|
| 1 | Di tích đầy đủ ảnh + nội dung | Test happy path |
| 2 | Di tích nhiều ảnh | Test gallery/slider |
| 3 | Nội dung lịch sử dài | Test cuộn và layout |
| 4 | Nội dung có dấu câu, năm, tên riêng | Test encoding tiếng Việt |
| 5 | Di tích thiếu ảnh | Test ảnh mặc định |

### E3. Dữ liệu phản ánh

| # | Tình huống | Mục đích |
|---|---|---|
| 1 | Hợp lệ, đầy đủ | Happy path |
| 2 | Không có ảnh | Test optional field |
| 3 | Có 1 ảnh | Test upload đơn |
| 4 | Nhiều ảnh | Test upload nhiều |
| 5 | Nội dung rất ngắn | Test validation |
| 6 | Nội dung dài | Test giới hạn ký tự |
| 7 | Bỏ trống nội dung | Test required field |
| 8 | SĐT không hợp lệ | Test phone validation |
| 9 | Ký tự đặc biệt / XSS | Test sanitization |
| 10 | Nhấn gửi nhiều lần | Test debounce |
| 11 | Mất mạng khi gửi | Test error handling |

### E4. Dữ liệu đặt lịch

| # | Tình huống | Mục đích |
|---|---|---|
| 1 | Hợp lệ | Happy path |
| 2 | Ngày quá khứ | Test date validation |
| 3 | Ngày hiện tại | Test edge case |
| 4 | Ngày nghỉ | Test business logic |
| 5 | Khung giờ hết chỗ | Test availability |
| 6 | Thiếu từng trường | Test required fields |
| 7 | SĐT sai format | Test phone validation |
| 8 | Gửi trùng | Test duplicate check |

### E5. Dữ liệu bộ câu hỏi

| # | Tình huống | Mục đích |
|---|---|---|
| 1 | Đầy đủ số lượng câu hỏi | Test happy path |
| 2 | Đúng 100% | Test scoring max |
| 3 | Sai 100% | Test scoring min |
| 4 | Câu hỏi dài | Test overflow |
| 5 | Đáp án dài | Test overflow |
| 6 | Chưa chọn đáp án | Test validation |
| 7 | Thoát giữa chừng | Test state management |
| 8 | Làm lại bài | Test reset |

> [!WARNING]
> **Lưu ý về dữ liệu kiểm thử:** Tuyệt đối KHÔNG sử dụng thông tin cá nhân thật (tên, SĐT, địa chỉ). Sử dụng dữ liệu giả định phù hợp, nghiêm túc, không phản cảm.

---

## PHẦN F — MẪU BÁO CÁO KIỂM THỬ

### F1. Tóm tắt kết quả

```
┌──────────────────────────────────────────────────────────────┐
│                  BÁO CÁO KIỂM THỬ TỔNG HỢP                │
│              Zalo Mini App — UBND Phường Tùng Thiện          │
├──────────────────────────────────────────────────────────────┤
│ Ngày kiểm thử:    ____/____/________                        │
│ Phiên bản:         v____                                    │
│ Người thực hiện:   AI Agent + [Tên người giám sát]          │
├──────────────────────────────────────────────────────────────┤
│ TỔNG SỐ TEST CASE:  ___                                     │
│ ✅ PASS:            ___  (___%)                              │
│ ❌ FAIL:            ___  (___%)                              │
│ ⏭️  SKIP:           ___  (___%)                              │
├──────────────────────────────────────────────────────────────┤
│ 🔴 NGHIÊM TRỌNG:   ___                                     │
│ 🟡 TRUNG BÌNH:     ___                                     │
│ 🟢 NHẸ:            ___                                     │
├──────────────────────────────────────────────────────────────┤
│ KẾT LUẬN:          ☐ ĐỦ ĐIỀU KIỆN SUBMIT                  │
│                     ☐ CẦN SỬA TRƯỚC KHI SUBMIT             │
│                     ☐ KHÔNG ĐỦ ĐIỀU KIỆN                   │
└──────────────────────────────────────────────────────────────┘
```

### F2. Chi tiết lỗi theo nhóm

Cho mỗi nhóm, AI cần tạo bảng:

| Mã | Trạng thái | Mức | Mô tả lỗi | Chính sách liên quan | Bằng chứng |
|---|---|---|---|---|---|
| META-01 | ✅ PASS | - | - | §1.2 | screenshot_01.png |
| META-04 | ❌ FAIL | 🔴 | Logo nền trong suốt | §1.2 | screenshot_04.png |

### F3. Danh sách hành động cần thực hiện

| # | Hành động | Mức ưu tiên | Người phụ trách | Deadline |
|---|---|---|---|---|
| 1 | Thay logo không trong suốt | 🔴 Khẩn cấp | Dev | Trước submit |
| 2 | Ẩn nút Cổng DVC | 🔴 Khẩn cấp | Dev | Trước submit |
| 3 | Thêm empty state cho danh sách | 🟡 Cao | Dev | Trước submit |

---

> [!TIP]
> **Sau khi sửa lỗi:** Phải thực hiện kiểm thử lại (regression test) cho tất cả test case liên quan. AI agent cần chạy lại ít nhất Đợt 1 sau mỗi lần sửa lỗi nghiêm trọng.

> [!IMPORTANT]
> **Liên hệ trước khi submit:** Với Mini App cơ quan nhà nước, liên hệ OA "Zalo chuyển đổi số" hoặc email minicqnn@zalo.me để hỏi về các liên kết tiện ích công (Cổng DVC, VNeID) trước khi gửi xét duyệt.
