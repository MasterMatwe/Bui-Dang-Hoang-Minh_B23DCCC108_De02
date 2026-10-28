# FootballFieldApp — Quản lý sân bóng mini

Bài React Native CLI theo Đề số 2. Ứng dụng quản lý sân, lịch đặt và lưu dữ liệu cục bộ bằng AsyncStorage. Không dùng Expo, backend hoặc thư viện UI dựng sẵn.

## Chạy trên máy Windows đã cấu hình

Mã nguồn nằm trong thư mục ban đầu. Đường dẫn không dấu dưới đây là liên kết tới cùng project để tránh lỗi công cụ native khi đường dẫn có tiếng Việt.

```powershell
cd C:\Users\hoang\FootballFieldApp
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
. .\scripts\android-env.ps1
```

Mở máy ảo Medium_Phone_API_37.0 qua Android Studio Device Manager. Tại terminal 1 chạy `npm.cmd start`. Tại terminal 2, nạp môi trường như trên rồi chạy:

```powershell
npx.cmd react-native run-android --active-arch-only
```

Lệnh tiêu chuẩn của đề `npx.cmd react-native run-android` cũng có thể dùng; cờ active-arch-only giúp build nhanh cho thiết bị đang kết nối. Nếu Android 17 hỏi quyền mạng cục bộ, cho phép để bản debug kết nối Metro. Mỗi máy mới cần `npm.cmd ci`, JDK và SDK phù hợp; xem [hướng dẫn môi trường](docs/MOI_TRUONG.md).

## Các chức năng theo đề

| Câu | Chức năng | Mã nguồn chính |
| --- | --- | --- |
| 1 | FlatList sân, tên/loại/giá, nhãn xanh/cam, đếm sân hoạt động | src/screens/FieldListScreen.tsx, src/components/FieldCard.tsx |
| 2 | Form chung thêm/sửa, điền dữ liệu cũ, chọn loại/trạng thái, lỗi dưới ô | src/screens/FieldFormScreen.tsx |
| 3 | Xoá có Alert xác nhận, chặn sân còn lịch | FieldListScreen, src/data/operations.ts |
| 4 | Chi tiết, danh sách booking, Modal đặt, tính tiền ngay, disabled khi bảo trì | FieldDetailScreen, BookingModal |
| 5 | Điện thoại/ngày/giờ hợp lệ, chống trùng, huỷ có Alert | src/utils/validation.ts, booking.ts, operations.ts |
| 6 | Lưu sân và booking cùng snapshot, seed lần đầu 4 sân/3 lịch | src/storage/appStorage.ts, src/data/seed.ts |
| 7 | Theme chung, StyleSheet, card/bóng, pressed/disabled/rỗng/lỗi, bàn phím, safe area | src/theme/colors.ts, src/components |

## Quy tắc sử dụng

- Tên sân không trống, không trùng sau khi bỏ khoảng trắng đầu/cuối và chuẩn hoá hoa/thường; giá là số > 0.
- Điện thoại gồm 10 chữ số, bắt đầu bằng 0. Ngày phải có thật và đúng dd/mm/yyyy.
- Giờ bắt đầu từ 6 đến 22, thuê từ 1 đến 3 giờ, kết thúc không quá 23:00. Có thể nhập giờ lẻ: 17.5 = 17:30; dấu phẩy thập phân cũng được nhận.
- Hai lượt cùng sân và cùng ngày bị xem là trùng khi các khoảng thời gian giao nhau. Lịch 17–19 và 19–20 được phép.
- Sân bảo trì không nhận lượt đặt mới; các lịch cũ vẫn giữ.
- Huỷ hết các lượt đặt của một sân trước khi xoá sân đó. Mọi thao tác xoá đều qua Alert xác nhận.
- Dữ liệu mẫu chỉ sinh khi chưa có key lưu trữ. Xoá hết dữ liệu qua giao diện không làm dữ liệu mẫu xuất hiện lại.
- Khi đọc/ghi bộ nhớ thất bại, ứng dụng báo lỗi; không tự thay dữ liệu cũ bằng dữ liệu mẫu.

## Kiểm tra

```powershell
npm.cmd run check
```

Gồm TypeScript, ESLint và Jest. Các test kiểm tra validation, ranh giới trùng giờ, mutation nghiệp vụ, lỗi lưu trữ, ghi đồng thời, khôi phục dữ liệu và thao tác giao diện. Jest mô phỏng native modules; kiểm tra chạy thật trên Android được ghi riêng trong [kết quả nghiệm thu](docs/NGHIEM_THU.md).

## Cấu trúc

`src/screens` chứa 3 màn hình; `components` chứa các phần giao diện và Modal; `context` nối state với repository; `data` chứa seed và nghiệp vụ; `storage` quản lý snapshot; `utils` chứa validation/định dạng/trùng lịch; `navigation` cấu hình Native Stack.

Không lưu thành tiền vào booking vì đề không có trường này; tính bằng giá sân hiện tại nhân số giờ. Khi sửa giá sân, các khoản tiền hiển thị theo giá mới.

## Đóng gói nộp bài

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\package-source.ps1 -FullName NguyenVanA -StudentId B22DCCN001
```

Kết quả nằm trong `releases/NguyenVanA_B22DCCN001_De2.zip`. Thay họ tên và MSSV bằng thông tin thật. Script loại node_modules, các thư mục build, android/.gradle, .cxx, ios/Pods, .git, log và local.properties; giữ source, package-lock và Gradle wrapper.

Bản `releases/HoTen_MSSV_De2.zip` dùng tên chờ điền thông tin sinh viên; cần đổi tên trước khi nộp. Không cần nộp APK nếu giảng viên chỉ yêu cầu project.

[Phân tích và kế hoạch ban đầu](docs/PHAN_TICH_VA_KE_HOACH.md) · [Nghiệm thu](docs/NGHIEM_THU.md)
