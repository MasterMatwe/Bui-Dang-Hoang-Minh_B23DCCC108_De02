# Môi trường phát triển Android

Dự án gốc: `C:\Users\hoang\Documents\Đa nền tảng\FootballFieldApp`.
Liên kết phục vụ build: `C:\Users\hoang\FootballFieldApp`.
Hai đường dẫn cùng trỏ tới một bộ mã nguồn. Dùng đường dẫn không dấu khi chạy Gradle, Metro và React Native CLI vì công cụ native có thể xử lý sai đường dẫn tiếng Việt.

## Cấu hình được chọn

| Thành phần | Phiên bản hoặc đường dẫn |
| --- | --- |
| Node đang có | 26.12.0; đáp ứng engines trong react-native 0.88.1 |
| npm đang có | 11.20.0 |
| React Native CLI project | React Native 0.88.1, React 19.3.0, CLI 20.2.0 |
| JDK cài bổ sung | Microsoft OpenJDK 17.0.21.0.2 |
| JAVA_HOME | `C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot` |
| ANDROID_HOME | `C:\Users\hoang\AppData\Local\Android\Sdk` |
| Gradle wrapper | 9.4.1, dùng bản của project |
| Android Gradle Plugin | 9.2.1 theo React Native Gradle plugin |
| SDK yêu cầu bởi project | compile SDK 37, build-tools 37.0.0, target SDK 36, min SDK 24 |
| NDK yêu cầu | 27.1.12297006 |
| CMake đã cài qua build | 3.22.1 |
| Máy ảo sẵn có | Medium_Phone_API_37.0, x86_64 |
| Gói ứng dụng Android | `com.footballfieldapp` |

JAVA_HOME và ANDROID_HOME đã được lưu ở phạm vi tài khoản Windows. PATH người dùng đã được bổ sung Java bin, platform-tools, emulator và cmdline-tools. Terminal và ứng dụng đã mở trước khi thay đổi có thể cần mở lại để nhận môi trường mới. Java 27 có sẵn vẫn được giữ; dự án này dùng JDK 17.

`android/local.properties` chứa đường dẫn SDK cục bộ và được Git bỏ qua. Máy khác phải tạo lại theo SDK của máy đó.

## Các thư viện phục vụ bài

- `@react-navigation/native` 7.5.1
- `@react-navigation/native-stack` 7.21.0
- `react-native-screens` 4.30.0
- `react-native-safe-area-context` có sẵn từ template; phiên bản cài chính xác được ghi trong package-lock
- `@react-native-async-storage/async-storage` 2.2.0

AsyncStorage 2.2.0 được chọn để dùng API `getItem/setItem` quen thuộc và giảm phần cấu hình cho bài 90 phút. Các gói thêm trực tiếp đều thuộc danh sách đề. `@react-native/new-app-screen` đã được gỡ; App.tsx hiện khởi chạy các màn hình nghiệp vụ.

MainActivity đã được bổ sung RNScreensFragmentFactory theo README của react-native-screens để chuẩn bị cho Native Stack. Máy ảo Android 17 đã được cấp ACCESS_LOCAL_NETWORK cho bản debug để kết nối Metro; khi cài lên thiết bị Android 17 khác, chấp nhận quyền mạng cục bộ ở lần khởi động đầu nếu được hỏi.

## Cách chạy trên máy này

Mở PowerShell mới và chạy:

```powershell
cd C:\Users\hoang\FootballFieldApp
# Nạp JAVA_HOME/ANDROID_HOME mới mà không thay chính sách toàn máy
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
. .\scripts\android-env.ps1
```

Mở máy ảo qua Android Studio Device Manager hoặc:

```powershell
emulator -avd Medium_Phone_API_37.0 -memory 2048 -cores 2
adb devices
```

Terminal 1, tại đường dẫn project không dấu, chạy Metro:

```powershell
npm.cmd start
```

Terminal 2, nạp môi trường tương tự rồi chạy lệnh đúng theo đề:

```powershell
npx.cmd react-native run-android
```

Lần phát triển chỉ dùng máy ảo x86_64 có thể rút ngắn build:

```powershell
npx.cmd react-native run-android --active-arch-only
```

Hoặc dùng script hỗ trợ (script nạp môi trường và chọn liên kết không dấu):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-android.ps1 -ActiveArchOnly
```

Dùng `.cmd` để tránh npm.ps1/npx.ps1 bị chính sách PowerShell chặn. `ExecutionPolicy` ở phạm vi Process chỉ có hiệu lực trong phiên hiện tại. Không cần thay đổi chính sách toàn máy.

## Kiểm tra lại

```powershell
node --version
npm.cmd --version
java -version
adb devices -l
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd test -- --runInBand
cd android
.\gradlew.bat --version
.\gradlew.bat :app:assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2
```

Máy có RAM khoảng 16 GB; nên đóng các ứng dụng nặng trước khi chạy emulator và Gradle cùng lúc. Build đầu tải nhiều thành phần native; các lần tiếp theo sử dụng cache. Kiểm tra trên Windows tập trung vào Android; build iOS cần macOS và Xcode.

## Tài liệu chính thức

- https://reactnative.dev/docs/set-up-your-environment
- https://docs.gradle.org/current/userguide/compatibility.html
- https://developer.android.com/studio
- https://reactnavigation.org/docs/getting-started/

Kết quả xác minh thực tế được ghi ở `KET_QUA_KIEM_TRA.md` sau khi hoàn tất quá trình cài/build.
