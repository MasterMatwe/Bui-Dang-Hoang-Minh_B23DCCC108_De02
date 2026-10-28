# Kết quả chuẩn bị và kiểm tra

Đây là biên bản giai đoạn chuẩn bị môi trường. Ứng dụng nghiệp vụ đã được triển khai sau đó; xem `NGHIEM_THU.md` cho kết quả phiên bản hoàn chỉnh.

Ngày: 28/10/2026. Phạm vi: đọc đề, lập kế hoạch, cài/cấu hình môi trường và chạy ứng dụng mẫu trong project đã có.

## Đã hoàn tất

- Đọc nội dung đề Word và đối chiếu đầy đủ 7 câu chấm điểm, quy định thư viện, lưu trữ và nộp bài.
- Giữ project CLI `FootballFieldApp` có sẵn, không khởi tạo project lồng nhau.
- Cài Microsoft OpenJDK 17; lưu JAVA_HOME, ANDROID_HOME và các mục PATH ở phạm vi người dùng.
- Cài Android command-line tools từ Google, đối chiếu SHA256 thành công: `90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a`.
- Build đã cài NDK 27.1.12297006, Build Tools 37.0.0 và CMake 3.22.1. SDK Platform 37.0, platform-tools và máy ảo có sẵn được tái sử dụng.
- Cài các gói Navigation, Native Stack, Screens và AsyncStorage; cập nhật package-lock.
- Cấu hình RNScreensFragmentFactory trong MainActivity theo README của react-native-screens 4.30.0 để hỗ trợ khôi phục Activity khi dùng Navigation.
- Tạo liên kết `C:\Users\hoang\FootballFieldApp` trỏ tới project gốc để khắc phục Gradle đọc sai đường dẫn tiếng Việt.
- Thêm script nạp môi trường/chạy Android và tài liệu hướng dẫn.

## Kết quả thực chạy

| Kiểm tra | Kết quả |
| --- | --- |
| Gradle wrapper `--version` | 9.4.1, Launcher/Daemon JVM dùng JDK 17 |
| `npx.cmd tsc --noEmit` | Đạt |
| `npm.cmd run lint` | Đạt |
| `npm.cmd test -- --runInBand` | Đạt 1 suite, 1 test mặc định của template |
| `sdkmanager --list_installed` | Liệt kê đúng SDK/NDK/Build Tools đã cài |
| Script PowerShell | Hai file được kiểm tra cú pháp, không có lỗi parse |
| `gradlew :app:assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2` | BUILD SUCCESSFUL, lần đầu 7 phút 39 giây, 121 task |
| `npx.cmd react-native run-android --active-arch-only --no-packager` | BUILD SUCCESSFUL, cài lên 1 thiết bị, khởi chạy MainActivity; build tiếp theo 22 giây |
| ADB | `emulator-5554`, trạng thái device, `sys.boot_completed=1` |
| Metro | HTTP `/status` trả `packager-status:running` |
| UI thực tế qua UIAutomator | Hiện `Welcome to React Native`, `Version: 0.88.1`, `JS Engine: Hermes`, `Open App.tsx to get started` |
| Log khởi động | Không ghi nhận lỗi AndroidRuntime/ReactNativeJS trong lần kiểm tra |

Android 17 hỏi quyền ACCESS_LOCAL_NETWORK cho bản debug để nối Metro. Đã cấp quyền này cho package `com.footballfieldapp` trên máy ảo, rồi khởi động lại ứng dụng và xác nhận UI tải thành công. Đây là quyền phát triển trên emulator, không phải chức năng của bài quản lý sân.

Gradle có cảnh báo deprecated từ template và thư viện, không chặn build. `npm install` báo 9 cảnh báo bảo mật mức low trong cây phụ thuộc; không chạy `npm audit fix --force` để tránh thay phiên bản ngoài kế hoạch. Chưa kiểm thử các ABI khác hoặc iOS.

## Ranh giới hoàn thành

Môi trường Android đã được kiểm tra bằng build, cài và mở ứng dụng thực tế. `App.tsx` vẫn là màn hình mẫu của React Native CLI. Chưa triển khai CRUD sân, Modal đặt sân, kiểm tra trùng lịch hay lưu dữ liệu nghiệp vụ; test mặc định không chứng minh các chức năng đó đã đạt.

Phương án triển khai và checklist nằm trong `PHAN_TICH_VA_KE_HOACH.md`. Hướng dẫn chạy lại nằm trong `MOI_TRUONG.md`. Bước tiếp theo là xây types/theme/seed/storage/Context, sau đó 3 màn hình và Modal theo thứ tự trong kế hoạch.
