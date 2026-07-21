# Báo cáo kiểm thử trước xét duyệt Zalo Mini App

**Sản phẩm:** Phường Tùng Thiện  
**Ngày kiểm thử:** 17/07/2026  
**Nguồn kế hoạch:** `ke_hoach_kiem_thu_ai.md`  
**Kết luận:** **KHÔNG ĐỦ ĐIỀU KIỆN SUBMIT**

## 1. Phạm vi và phương pháp

Đã thực hiện kiểm thử tĩnh, build, type-check và test tự động tại workspace:

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Kiểm tra biến môi trường mẫu | PASS | `npm run check:env-examples` |
| Kiểm tra mã hóa tiếng Việt | PASS | `npm run check:vi-encoding` — 124 file mã nguồn/cấu hình |
| TypeScript Mini App | PASS | `npm run typecheck` |
| Test Mini App | PASS | `npm test` — 4 suite, 25 test |
| Build Mini App | PASS, cảnh báo hiệu năng | `npm run build` — bundle JS 580.78 kB (gzip 180.67 kB) |
| Test backend | PASS | `backend/npm test` — 13 suite, 142 test |
| Build backend | PASS | `backend/npm run build` |
| Build admin | PASS, cảnh báo hiệu năng | `admin/npm run build` — bundle JS 624.23 kB (gzip 193.16 kB) |
| Smoke test cục bộ | PASS | `check.ps1`: backend health, admin preview và anonymous admin API trả 401 |
| Checklist trước triển khai | PASS | `scripts/pre-deploy-check.ps1` — 13/13 kiểm tra PASS: secret scan, production dependency audit, build guard, type-check, test và encoding |
| Kiểm thử tích hợp chỉ-đọc | PASS | Backend local: `/health` 200; `GET /api/events` 200 với empty dataset hợp lệ; `GET /api/feedbacks/me` không token 401; ID sự kiện sai và route API không tồn tại 404 |
| Kiểm thử Zalo Development thủ công | PASS (người phụ trách xác nhận) | Từ chối quyền vẫn sử dụng được app; mất mạng/phục hồi; gửi phản ánh; đặt lịch; và responsive điện thoại đều không có vấn đề |

Tổng cộng **167 test tự động PASS**. Các test hiện có tập trung vào service, store, middleware và route backend; chưa có E2E UI cho Mini App.

Kết quả coverage backend: **51.02% statements**, **23.17% branches**, **28.42% functions**, **49.85% lines**. Các phần có coverage đặc biệt thấp/chưa có test gồm Zalo OA, ZNS, webhook, upload, events, admin account và các controller. Frontend: **9.30% statements**, **3.92% branches**, **9.05% functions**, **9.95% lines** (25/25 test PASS). Coverage frontend thấp vì test hiện mới tập trung ở service/store, chưa có test UI/E2E cho các page và component chính.

Không thể xác minh trong workspace: cấu hình logo/tên/mô tả trên Zalo Developer Portal, quyền trên ứng dụng Zalo thật, hiệu năng LCP/PageLoad trên thiết bị thật, luồng OA thật, và dữ liệu/CRUD admin với database testing. Các hạng mục này được ghi là **CHƯA XÁC MINH**, không được coi là PASS.

Đã đối chiếu [Chính sách kiểm duyệt Mini App của Zalo](https://miniapp.zaloplatforms.com/documents/zalo-mini-app-censorship-policy/) ngày 17/07/2026.

> Ghi chú nghiệp vụ ngày 17/07/2026: người phụ trách xác nhận các liên kết ngoài là được phép. Báo cáo giữ `EXT-01` và `EXT-02` ở trạng thái **cần bằng chứng chấp thuận của Zalo** — AI không có quyền tự xác minh hoặc thay thế xác nhận đó. Khi có xác nhận bằng văn bản/ticket, hai mục này có thể được chuyển sang PASS theo ngoại lệ.

## 2. Điều kiện dừng

Theo D2 của kế hoạch, phải dừng đánh giá submit khi có lỗi nghiêm trọng ở đợt 1. Đã phát hiện các lỗi `CRITICAL` ở Nhóm 11, 12 và 15, do đó không tiếp tục đánh giá theo hướng “đủ điều kiện submit”. Các kiểm tra còn lại chỉ nhằm hoàn thiện bằng chứng và danh sách sửa lỗi.

## 3. Phát hiện cần sửa trước submit

| Mã | Nhóm / mức | Mô tả và bằng chứng | Chính sách liên quan |
|---|---|---|---|
| EXT-01 | Nhóm 11 — **NGHIÊM TRỌNG** | App điều hướng người dùng sang `dichvucong.gov.vn`, `vneid.gov.vn`, `ihanoi.gov.vn`; xem [dvc](src/pages/dvc/index.tsx:10), [vneid](src/pages/vneid/index.tsx:10), [ihanoi](src/pages/ihanoi/index.tsx:10). | §4.1: không điều hướng ra liên kết ngoài Mini App, ngoại lệ chỉ dành cho tài liệu pháp lý theo cách ẩn/vô hiệu hóa hoặc nhúng nội dung. |
| OA-01 | Nhóm 10 — **PASS trên Zalo Development** | Người phụ trách đã kiểm tra trên Zalo Mini App Development: nút “Nhắn OA” mở trực tiếp hội thoại Zalo OA thành công qua `openChat`. Đây là luồng Zalo native, không phải điều hướng website ngoài. Fallback `window.open(https://zalo.me/...)` chỉ chạy khi SDK lỗi hoặc ở web/dev; cần giữ không kích hoạt fallback này trong bản submit nếu không có sự chấp thuận riêng. Xem [BottomNav](src/components/BottomNav.tsx:65) và [trang chủ](src/pages/index/index.tsx:196). | §4.1 — PASS cho luồng `openChat` đã xác minh; fallback cần theo dõi. |
| PERM-01 | Nhóm 12 — **NGHIÊM TRỌNG** | `fetchUser()` được gọi ngay khi App mount ([app](src/app.tsx:31)); hàm này gọi `getUserInfo({ autoRequestPermission: true })` ([zaloHelper](src/utils/zaloHelper.ts:10)). Người dùng sẽ gặp consent ngay khi vừa mở app, không có ngữ cảnh/tùy chọn trước đó. | §6.1, §6.3: không xin quyền ngay khi vào; API dữ liệu cá nhân phải được kích hoạt từ tương tác cụ thể. |
| LEGAL-01 | Nhóm 14/15 — **NGHIÊM TRỌNG** | Không tìm thấy trang/route/nội dung Chính sách riêng tư hoặc Điều khoản sử dụng trong `src`; app vẫn thu thập tên/avatar, số điện thoại, nội dung phản ánh và có thể có vị trí. Không có thông báo/đồng ý riêng tư rõ ràng trước khi gửi form. | §4.8 yêu cầu chính sách/điều khoản rõ ràng theo tên Mini App; §7 yêu cầu đồng ý rõ ràng và minh bạch khi thu thập dữ liệu cá nhân. |
| HOME-01 | Nhóm 4 — **NGHIÊM TRỌNG** | Sáu route công khai sử dụng component `ComingSoon`: `/education`, `/planning`, `/services`, `/social-security`, `/health`, `/profile` ([app](src/app.tsx:51)). Các route `/education`, `/planning`, `/social-security`, `/health` lại được mở từ trang chủ ([trang chủ](src/pages/index/index.tsx:236)). | §5.1: tính năng ở trạng thái demo/không dùng được là vi phạm. |
| CONT-01 | Nhóm 6 — **NGHIÊM TRỌNG** | Nội dung di tích là mock (`mockHtmlContent`, `initialHeritages`) và một mục hiển thị “Nội dung chi tiết đang được Admin cập nhật...”; xem [heritageStore](src/store/heritageStore.ts:20) và [heritageStore](src/store/heritageStore.ts:58). | §5.1: không được có nội dung/tính năng demo hoặc đang phát triển trên phiên bản xét duyệt. |
| UI-IMG-01 | Nhóm 3/5/6/18 — **TRUNG BÌNH** | Các ảnh sự kiện/di tích/ảnh đính kèm không có `onError` hoặc placeholder fallback; tìm kiếm mã nguồn không có handler ảnh lỗi. Ví dụ [events](src/pages/events/index.tsx:91), [heritage](src/pages/heritage/index.tsx:77). | §4.7: hình ảnh không tải được là vi phạm. |
| CONT-02 | Nhóm 6/14 — **ĐÃ SỬA, CẦN XÁC NHẬN HIỂN THỊ** | Đã bỏ toàn bộ URL Unsplash. Avatar fallback chuyển thành biểu tượng nội bộ; gallery không có ảnh nội bộ riêng sẽ ẩn. Typecheck, test và production build PASS. | §4.7, §7. |
| UI-NAV-01 | Nhóm 3 — **ĐÃ SỬA, CẦN XÁC NHẬN HIỂN THỊ** | Màu inactive đã đổi sang `#62666A`, đạt **5.79:1** trên trắng; selector active đã sửa thành `.zaui-bottom-navigation-item-label` để áp màu primary và `font-weight: 600`. Typecheck, test và production build PASS. | UI-03, UI-15. |
| PERF-01 | Nhóm 17 — **TRUNG BÌNH** | Bundle Mini App 580.78 kB và admin 624.23 kB, đều vượt ngưỡng cảnh báo 500 kB của Vite. Chưa đo được LCP/PageLoad trên thiết bị thật nên chưa thể kết luận đáp ứng §5.3. | §5.3: LCP < 2.5 giây, PageLoad < 1.5 giây. |

## 4. Kết quả theo nhóm kiểm thử

| Nhóm | Trạng thái | Ghi chú |
|---|---|---|
| 1. Logo, tên, mô tả | CHƯA XÁC MINH | Logo UI là JPEG nền đặc (không alpha), không thấy QR/SĐT khi quan sát; nhưng quyền sở hữu logo và tên/mô tả ở Developer Portal chưa có quyền truy cập để xác nhận. |
| 2. Khởi động & điều hướng | FAIL MỘT PHẦN | Kiểm thử runtime mạng mất–có lại trên Zalo Development PASS theo người phụ trách xác nhận; vẫn có route công khai dẫn đến `ComingSoon`. |
| 3. UI & nội dung | FAIL MỘT PHẦN | Responsive điện thoại đã PASS theo người phụ trách xác nhận; vẫn chưa có fallback ảnh khi tải lỗi. |
| 4. Trang chủ | FAIL | Nút trên trang chủ dẫn tới các route chưa hoàn thiện. |
| 5. Sự kiện | CHƯA XÁC MINH | Có loading/error/empty state trong code nhưng chưa có fallback ảnh và chưa kiểm thử API testing thực tế. |
| 6. Di tích | FAIL | Có mock content, nội dung “đang cập nhật”, gallery ngoài và không fallback ảnh. |
| 7. Phản ánh | PASS MỘT PHẦN | Có validate client, giới hạn ảnh, backend test và gửi phản ánh trên Zalo Development PASS theo người phụ trách xác nhận; chưa có test tự động cho mọi nhánh E2E/lỗi mạng. |
| 8. Đặt lịch | PASS MỘT PHẦN | Backend booking test và đặt lịch trên Zalo Development PASS theo người phụ trách xác nhận; chưa xác minh lịch nghỉ, slot hết chỗ và gửi trùng với DB testing. |
| 9. Bộ câu hỏi | PASS MỘT PHẦN | Store/backend quiz tests PASS; cần test UI dài, thoát giữa chừng và làm lại bài. |
| 10. OA & tích hợp | PASS MỘT PHẦN | `openChat` đã được xác minh trên Zalo Development, mở hội thoại OA thành công. Chưa kiểm thử tình huống SDK lỗi/fallback. |
| 11. Liên kết ngoài | FAIL | Có các điều hướng ngoài Mini App. |
| 12. Xin quyền | FAIL TUÂN THỦ / PASS CHỨC NĂNG | Người phụ trách xác nhận từ chối quyền vẫn dùng được app trên Zalo Development. Tuy nhiên code vẫn gọi `getUserInfo({ autoRequestPermission: true })` khi app mount, không đúng ngữ cảnh xin quyền theo §6.1. |
| 13. Đăng nhập | PASS MỘT PHẦN | Người dùng có thể duyệt màn hình công khai khi không có `userInfo`; cần kiểm tra thật thao tác gửi form khi từ chối quyền/token. |
| 14. Quyền riêng tư | FAIL | Thiếu nội dung minh bạch và consent cho dữ liệu cá nhân. |
| 15. Chính sách & điều khoản | FAIL | Không có trang/nội dung chính sách và điều khoản. |
| 16. Nội dung pháp lý | CHƯA XÁC MINH | Cần đơn vị chủ quản xác nhận toàn bộ nội dung, ảnh, mốc lịch sử và thông tin hành chính. |
| 17. Hiệu suất | CHƯA XÁC MINH | Build thành công nhưng có cảnh báo bundle; chưa đo chỉ số trên thiết bị Zalo thật. |
| 18. Lỗi & phục hồi | PASS MỘT PHẦN | Có một số loading/error/empty state và backend tests; chưa mock 401/403/404/500/timeout/mất mạng qua E2E. |
| 19. Admin | PASS MỘT PHẦN | Build admin và 142 test backend PASS; cần chạy CRUD và phân quyền với tài khoản testing. |

## 5. Hành động bắt buộc trước khi kiểm thử lại

1. Gỡ các mục chưa hoàn thiện khỏi trang chủ và khỏi `pages`, hoặc hoàn thiện toàn bộ chức năng; không để `ComingSoon`, “đang cập nhật”, mock/demo trên bản submit.
2. Đổi `getUserInfo` sang xin quyền theo hành động có ngữ cảnh (ví dụ người dùng chủ động mở thẻ hồ sơ), đồng thời bảo đảm từ chối quyền vẫn dùng được các chức năng không liên quan.
3. Không điều hướng ra website ngoài từ bản submit. Với tiện ích cơ quan nhà nước/OA, cần xác nhận phương án được Zalo chấp thuận với OA **“Zalo chuyển đổi số”** hoặc `minicqnn@zalo.me` trước khi phát hành.
4. Thêm nội dung Chính sách riêng tư và Điều khoản sử dụng mang tên **Phường Tùng Thiện** trong Mini App; nêu rõ dữ liệu thu thập, mục đích, thời gian lưu, đơn vị xử lý, liên hệ, quyền của người dùng và cơ chế đồng ý rõ ràng trước khi gửi phản ánh/đặt lịch.
5. Thay dữ liệu mock/Unsplash bằng nội dung, hình ảnh đã được cơ quan chủ quản xác nhận quyền sử dụng; thêm placeholder/fallback cho toàn bộ ảnh từ mạng.
6. Tối ưu chia nhỏ bundle trước khi đo hiệu năng thực tế.
7. Sau khi sửa, chạy regression ít nhất cho toàn bộ đợt 1 và thực thi trên Zalo thật: mở lần đầu/từ chối quyền, điều hướng, mạng mất–có lại, 401/403/404/500/timeout, gửi phản ánh, đặt lịch, quiz, OA và admin CRUD/phân quyền.

## 6. Điều kiện mở lại đánh giá submit

Chỉ mở lại kết luận submit sau khi tất cả mã `NGHIÊM TRỌNG` ở trên được sửa và có bằng chứng screenshot/video/log trên Zalo thật. Khi đó cần chạy lại Đợt 1 trước, tiếp theo các nhóm chức năng; không dùng dữ liệu cá nhân thật trong mọi test case.
