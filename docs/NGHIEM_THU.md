# Nghiệm thu FootballFieldApp

Ngày 28/10/2026. Ứng dụng đã triển khai theo Đề số 2, sử dụng project React Native CLI có sẵn. Bản này thay thế màn hình mẫu bằng các màn hình quản lý sân và lịch đặt.

## Đối chiếu yêu cầu

| Câu | Đã triển khai | Bằng chứng kiểm tra |
| --- | --- | --- |
| 1 | FlatList, tên/loại/giá, nhãn xanh/cam, tổng sân hoạt động | UI máy ảo hiển thị 3/4 sân hoạt động và 300.000 đ/giờ |
| 2 | Stack form chung thêm/sửa, điền sẵn, nút chọn, lỗi dưới ô/viền đỏ | Test giao diện + nhập sân thử trên máy ảo; sửa giá 250.000 thành 275.000 |
| 3 | Alert xác nhận xoá; chặn sân còn booking ở cả UI và nghiệp vụ | Máy ảo từ chối xoá sân thử có 2 booking; cho xoá sau khi huỷ hết |
| 4 | Chi tiết, danh sách booking theo sân, Modal, thành tiền cập nhật, disabled bảo trì | Máy ảo hiển thị 275.000 × 2 = 550.000 đ; kiểm tra enabled=false cho nút Đặt sân của Sân B2 |
| 5 | Điện thoại 10 số bắt đầu 0, ngày thực tế, giờ 6–22, thuê 1–3, kết thúc <=23, chống trùng, huỷ có Alert | Test ranh giới và máy ảo: 17–19 nhận, 18–19 từ chối, 19–20 nhận |
| 6 | AsyncStorage lưu chung sân + booking, seed lần đầu 4 sân/3 booking, không seed lại khi rỗng | Tắt hẳn/mở lại trên máy ảo vẫn có sân mới và lịch mới; test lỗi đọc/ghi, ghi đồng thời, mảng rỗng |
| 7 | Theme chung, StyleSheet, card/bóng, phản hồi nhấn/disabled, rỗng/lỗi, keyboard/safe area | Test giao diện và xem ảnh màn hình danh sách/Modal thực tế; thao tác nhập và cuộn trên Android |

## Kiểm tra tự động

Chạy `npm.cmd run check`: TypeScript đạt, ESLint đạt, Jest đạt **4 suites, 61 tests**.

Các nhóm kiểm tra:

- Ngày hợp lệ/ngày nhuận, định dạng ngày, số sai, giá, tên trùng và tên rỗng.
- Sửa giữ id; thêm tự sinh id; chuyển bảo trì giữ lịch cũ; chặn xoá có booking.
- Lịch giao nhau, bao nhau, trùng hoàn toàn, sát giờ, khác sân/khác ngày, giờ lẻ và giới hạn 23:00.
- Số điện thoại, tên khách, giờ và số giờ không hợp lệ.
- Khởi tạo seed chỉ lần đầu; không tự ghi đè JSON hỏng; lỗi đọc/ghi; giữ snapshot cũ khi ghi thất bại; chặn ghi đồng thời.
- Chuỗi thao tác thêm/sửa/đặt/huỷ/xoá được khôi phục khi tạo repository mới.
- Form thêm/sửa, thông báo lỗi, Alert xoá/huỷ, Modal tính tiền, chặn trùng, nút bảo trì, danh sách rỗng và thử lại khi đọc bộ nhớ lỗi.

Jest dùng mock cho native storage/safe area và thay native navigator ở test khởi động. Test không thay thế việc chạy trên thiết bị; bước Android thực tế được thực hiện riêng như bên dưới.

## Kiểm tra Android thực tế

Lệnh: `npx.cmd react-native run-android --active-arch-only --no-packager`, Metro chạy riêng. Kết quả: **BUILD SUCCESSFUL**, cài thành công lên Medium_Phone_API_37.0, x86_64. Bản nghiệp vụ build trong 29 giây nhờ cache môi trường đã chuẩn bị.

Đã thao tác qua ADB/UIAutomator trên giao diện thực:

1. Xác nhận 4 sân, 3 booking mẫu, đếm hoạt động và giá hiển thị đúng.
2. Lưu form rỗng: hiện lỗi tên và giá dưới ô.
3. Thêm sân tạm SanKiemThu, giá 250.000; đợi lưu xong rồi force-stop/mở lại, sân vẫn còn.
4. Sửa sân tạm thành giá 275.000; mở chi tiết và đặt 17–19, thành tiền 550.000.
5. Thử đặt 18–19: Modal báo sân đã có lịch 17–19 và không tạo booking.
6. Đặt 19–20: thành công, chi tiết có hai booking nối tiếp.
7. Force-stop/mở lại; thử xoá sân tạm: Alert báo sân có lịch và không xoá.
8. Huỷ cả hai booking qua từng Alert xác nhận; chi tiết chuyển sang danh sách rỗng.
9. Xoá sân tạm qua Alert xác nhận; không thay đổi các sân/lịch mẫu.
10. Mở Sân B2 đang bảo trì: nút Đặt sân disabled, có giải thích trạng thái.

Ảnh màn hình danh sách và Modal đã được xem để kiểm tra chữ tiếng Việt, bố cục, màu và vùng an toàn. Log khởi động không ghi nhận lỗi ReactNativeJS hoặc AndroidRuntime trong lần kiểm tra. Metro và máy ảo được giữ để tiếp tục xem ứng dụng.

## Bàn giao

- Mã nguồn chính: `src/`, entry `App.tsx`; toàn bộ chức năng tách màn hình/component.
- Hướng dẫn chạy và cấu trúc: `README.md`.
- Hướng dẫn môi trường: `docs/MOI_TRUONG.md`.
- Đóng gói: `scripts/package-source.ps1`, truyền FullName và StudentId thật.
- Bản nén `releases/HoTen_MSSV_De2.zip` dùng tên tạm vì chưa có thông tin sinh viên; đổi tên trước khi nộp.
- ZIP giữ source, package-lock và Gradle wrapper; loại node_modules, android/build, android/app/build, ios/Pods, .git, cache native, log và local.properties.

Chưa chạy iOS hoặc kiểm thử native trên ABI khác x86_64. Bài đã được xác minh bằng Android theo lựa chọn run-android trong đề. Điểm số do giảng viên chấm; bảng trên ghi chức năng và bằng chứng đã kiểm tra.
