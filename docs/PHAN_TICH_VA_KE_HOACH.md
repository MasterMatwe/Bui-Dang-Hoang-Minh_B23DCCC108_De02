# Phân tích và kế hoạch FootballFieldApp

Ngày lập: 28/10/2026. Nguồn yêu cầu: `C:\Users\hoang\Downloads\De2_QuanLySanBong.docx`.

Mục tiêu: ứng dụng React Native CLI quản lý sân bóng mini, đáp ứng đủ 7 câu trong đề, chạy Android trên máy Windows hiện tại. Đây là kế hoạch ban đầu; các chức năng đã được triển khai. Xem `NGHIEM_THU.md` để biết kết quả kiểm tra của phiên bản hoàn chỉnh.

## 1. Phạm vi bắt buộc

| Câu | Điểm | Kết quả phải có | Cách nghiệm thu |
| --- | ---: | --- | --- |
| 1 | 1,5 | FlatList sân; tên, loại, giá dạng `300.000 đ/giờ`; nhãn xanh/cam; số sân hoạt động/tổng | Lần đầu có ít nhất 4 sân, đếm đúng trạng thái |
| 2 | 1,5 | Stack mở form dùng chung thêm/sửa; điền sẵn khi sửa; nút chọn loại/trạng thái; lỗi dưới ô | Tên rỗng/trùng và giá không hợp lệ bị chặn; sửa giữ nguyên id |
| 3 | 1,0 | Xoá từng sân qua Alert xác nhận; chặn sân còn lượt đặt bằng Alert | Huỷ xác nhận không đổi dữ liệu; sân có đặt không bị xoá |
| 4 | 1,5 | Chi tiết sân và các lượt đặt; Modal đặt sân; thành tiền cập nhật tức thì; vô hiệu đặt khi bảo trì | Thay số giờ đổi thành tiền; sân bảo trì có nút mờ và disabled |
| 5 | 1,5 | Điện thoại, ngày, giờ hợp lệ; chặn lịch giao nhau; huỷ lượt đặt có xác nhận | Thử giao nhau, sát giờ, khác sân và khác ngày |
| 6 | 1,0 | AsyncStorage lưu cả sân và lịch; seed ít nhất 4 sân + 3 lịch ở lần đầu | Force-stop/mở lại vẫn giữ các thay đổi; không seed lại khi xoá hết |
| 7 | 2,0 | Theme chung; StyleSheet; card bo góc và bóng; phản hồi nhấn/disabled/rỗng/lỗi; bàn phím và safe area | Kiểm tra màn hình nhỏ, bàn phím số/điện thoại, Modal và nút Back Android |

Ràng buộc: không Expo, không thư viện UI dựng sẵn; chỉ thêm các thư viện trong danh sách đề. Tách màn hình/component để tránh trừ 0,5 điểm. Crash bị trừ 1 điểm/lỗi, tối đa 2 điểm. Không chạy CLI thì không được chấm.

Không bổ sung đăng nhập, backend, thanh toán, bản đồ hay thống kê vì đề không yêu cầu. Thư viện icon là tuỳ chọn; dùng chữ cho nút để giảm cấu hình native.

## 2. Mô hình dữ liệu

```ts
type Field = {
  id: string;
  name: string;
  type: '5 người' | '7 người';
  pricePerHour: number;
  status: 'Hoạt động' | 'Bảo trì';
};

type Booking = {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string; // dd/mm/yyyy, chuẩn hoá sau kiểm tra
  startHour: number;
  hours: number;
};

type AppData = { version: 1; fields: Field[]; bookings: Booking[] };
```

Sinh id cục bộ bằng timestamp + bộ đếm/ngẫu nhiên, kiểm tra không trùng trong tập hiện có; không cần thư viện uuid. `fieldId` phải tham chiếu sân tồn tại. Thành tiền được tính từ `pricePerHour * hours`, không thêm thuộc tính tổng tiền vào schema của đề. Đề không yêu cầu giữ giá lịch sử; khi sửa giá sân, các khoản tiền hiển thị được tính theo giá hiện tại.

## 3. Quy tắc và các điểm cần quyết định rõ

- Tên sân: trim; so sánh sau chuẩn hoá Unicode NFC và chữ thường, loại trừ chính id đang sửa. Đây là cách triển khai để tránh tên trùng do hoa/thường hoặc khoảng trắng đầu/cuối; đề chỉ nói không trùng.
- Giá: chuỗi nhập phải biểu diễn một số hữu hạn > 0. Không dùng `parseFloat` đơn thuần vì có thể nhận `300abc`. Ô nhập dùng bàn phím numeric; định dạng tiền lúc hiển thị, không dùng chuỗi có dấu phân cách để tính toán.
- Tên khách: trim và không rỗng. Điện thoại là chuỗi, không chuyển số để giữ số 0 đầu; regex `^0\d{9}$`.
- Ngày: đúng `dd/mm/yyyy`, kiểm tra ngày thực tế và năm nhuận; không chấp nhận 31/02. Không tự thêm ràng buộc cấm ngày quá khứ vì đề không yêu cầu.
- Giờ bắt đầu: số từ 6 đến 22; thời lượng từ 1 đến 3; kết thúc <= 23. Bản triển khai nhận cả số lẻ (17.5 = 17:30) theo kiểu number của đề; có nút chọn nhanh 1/2/3 giờ và ô nhập số giờ.
- Khi lưu đặt sân phải kiểm tra lại sân tồn tại và đang hoạt động, không chỉ dựa vào nút disabled.
- Đổi sân có lịch sang Bảo trì: vẫn cho sửa, giữ lịch cũ và chỉ chặn đặt mới vì đề không yêu cầu huỷ lịch cũ.
- Xoá sân: kiểm tra có bất kỳ booking nào cùng fieldId, kể cả ngày đã qua. Không xoá dây chuyền.
- Huỷ booking: xoá bản ghi sau Alert xác nhận, không cần thêm trạng thái booking vì schema không có thuộc tính này.
- Mọi thao tác xoá đều hỏi Alert. Khi sân có lịch, báo Alert lỗi và không thực hiện xoá.

### Công thức trùng lịch

Coi mỗi lịch là khoảng nửa mở `[start, end)`, `end = startHour + hours`.

```ts
sameField && sameDate && newStart < oldEnd && newEnd > oldStart
```

Ngày phải được kiểm tra và chuẩn hoá trước khi so sánh. Ví dụ với lịch cũ 17–19:

| Lịch mới | Kết quả |
| --- | --- |
| 18–20, 17–19, 16–18, 16–19 | Từ chối |
| 19–20, 16–17 | Cho phép |
| 18–20 khác sân hoặc khác ngày | Cho phép |
| 22–23 | Cho phép nếu không giao nhau |
| 22–24 hoặc 23–24 | Từ chối do giờ không hợp lệ |

## 4. Luồng màn hình và cấu trúc code đề xuất

```text
App.tsx -> SafeAreaProvider -> AppProvider -> NavigationContainer
  FieldListScreen -> FieldFormScreen (thêm/sửa)
  FieldListScreen -> FieldDetailScreen -> BookingModal

src/
  types/index.ts
  theme/colors.ts
  theme/spacing.ts
  data/seed.ts
  navigation/RootNavigator.tsx
  context/AppContext.tsx
  storage/appStorage.ts
  utils/validation.ts
  utils/booking.ts
  utils/format.ts
  components/Button.tsx
  components/FormInput.tsx
  components/FieldCard.tsx
  components/BookingCard.tsx
  components/EmptyState.tsx
  components/BookingModal.tsx
  screens/FieldListScreen.tsx
  screens/FieldFormScreen.tsx
  screens/FieldDetailScreen.tsx
```

Route chỉ truyền `fieldId` thay vì bản sao đối tượng sân để chi tiết cập nhật sau khi sửa. Form dùng chung có `fieldId` tuỳ chọn; không có thì thêm. Không cho gửi lặp trong lúc đang lưu. Danh sách cập nhật qua state chung ngay khi thao tác thành công.

Context + hook đủ cho dữ liệu nhỏ; không cần Redux/Zustand và các gói này cũng ngoài danh sách đề. Dùng React Native Modal, Alert, Pressable, TextInput, FlatList, KeyboardAvoidingView/ScrollView và StyleSheet.

Theme dự kiến: xanh lá cho thương hiệu/Hoạt động, cam cho Bảo trì, đỏ cho lỗi/xoá; nền sáng; cỡ chữ và khoảng cách thống nhất. Nội dung tiếng Việt và đơn vị tiền VNĐ. Nút sửa/xoá trong card cần tách vùng nhấn để không vô tình mở chi tiết.

## 5. Lưu trữ tránh mất dữ liệu

Một key `@FootballFieldApp/data/v1` chứa toàn bộ `AppData` giúp sân và booking cùng được ghi trong một snapshot. Chỉ seed nếu `getItem` trả về null, không dựa vào độ dài mảng. Seed 4 sân (3 hoạt động, 1 bảo trì) và ít nhất 3 booking hợp lệ, không giao nhau.

Khởi động: hiển thị loading -> đọc -> parse/kiểm tra schema -> nạp hoặc seed -> mở giao diện. Không chạy effect ghi mảng rỗng trước khi đọc xong. Nếu lỗi đọc hoặc JSON hỏng, báo lỗi và cho thử lại; không tự ghi đè dữ liệu cũ bằng seed.

Mọi mutation đi qua một hàng đợi: lấy state mới nhất, kiểm tra nghiệp vụ lại, tạo snapshot tiếp theo, chờ AsyncStorage ghi thành công rồi mới báo lưu thành công/cập nhật state. Nếu ghi thất bại, giữ state cũ và báo lỗi. Cách này tránh ghi cũ đè ghi mới khi người dùng thao tác nhanh. Với quy mô đề, một cờ `isSaving` khoá thao tác ghi trong lúc lưu là đủ nếu được áp dụng nhất quán.

## 6. Thứ tự làm bài trong 90 phút

Môi trường cần được cài và build thử trước buổi làm bài; lịch dưới đây dành cho phần triển khai sau khi môi trường hoạt động.

| Phút | Công việc | Kết quả |
| --- | --- | --- |
| 0–10 | Types, theme, seed, storage, Context | Dữ liệu mẫu và khôi phục dữ liệu |
| 10–22 | Stack, danh sách FlatList, card và đếm sân | Câu 1 và nền câu 7 |
| 22–37 | Form thêm/sửa, lỗi dưới ô, xoá có chặn booking | Câu 2–3 |
| 37–52 | Chi tiết, danh sách booking, Modal, tính tiền | Câu 4 |
| 52–67 | Kiểm tra ngày/điện thoại/giờ/trùng lịch, huỷ booking | Câu 5 |
| 67–77 | Safe area, bàn phím, trạng thái rỗng, pressed/disabled/error | Hoàn thiện câu 7 |
| 77–87 | Chạy ca nghiệp vụ, force-stop/reopen, xử lý lỗi | Xác minh câu 6 và tránh crash |
| 87–90 | Kiểm tra code tách file và đóng gói | Bản nộp đúng quy định |

Ưu tiên chạy được luồng hoàn chỉnh trước khi chỉnh trang trí. Giữ khoảng 10 phút kiểm thử vì lỗi crash bị trừ điểm đáng kể. Đây là phân bổ dự kiến, không phải cam kết thời gian build lần đầu.

## 7. Checklist nghiệm thu

- [ ] Cài mới có >= 4 sân và >= 3 booking; số sân hoạt động khớp.
- [ ] Thêm/sửa tên rỗng, chỉ khoảng trắng, tên trùng, giá 0/âm/NaN/chuỗi lẫn chữ đều bị chặn; lỗi dưới ô và viền đỏ.
- [ ] Sửa sân không bị nhận nhầm tên của chính mình là trùng; dữ liệu cũ điền sẵn; id giữ nguyên.
- [ ] Xoá sân chưa có lịch: thử Huỷ và Đồng ý. Sân có lịch không xoá được.
- [ ] Chi tiết chỉ hiện booking đúng sân; thêm/huỷ cập nhật ngay.
- [ ] Bảo trì: nút đặt mờ, disabled; tầng nghiệp vụ cũng từ chối.
- [ ] Tên khách rỗng và điện thoại sai độ dài/ký tự/đầu số bị chặn.
- [ ] Ngày 31/02, 29/02 năm không nhuận, sai định dạng bị chặn; ngày nhuận đúng được nhận.
- [ ] Kiểm tra các trường hợp trùng lịch trong bảng; giờ sát nhau được nhận.
- [ ] Giờ 5/23, thời lượng 0/4, kết thúc sau 23 bị chặn; 6–7 và 22–23 hợp lệ.
- [ ] Thành tiền đổi ngay khi chọn số giờ; giá hiển thị `300.000 đ/giờ`.
- [ ] Huỷ booking có Alert; Huỷ xác nhận giữ nguyên dữ liệu.
- [ ] Thêm/sửa/xoá/đặt/huỷ rồi tắt hẳn app và mở lại; dữ liệu vẫn đúng.
- [ ] Xoá hết dữ liệu qua UI rồi mở lại không tự sinh seed lần nữa.
- [ ] Kiểm tra bàn phím, cuộn form, nút Back đóng Modal, safe area, danh sách rỗng.
- [ ] TypeScript, ESLint và test hàm validation/trùng lịch/lưu trữ đạt; chạy thật trên Android không có màn hình lỗi.

## 8. Đóng gói khi hoàn thành

Nén project thành `HoTen_MSSV_De2.zip` sau khi có họ tên và MSSV. Bỏ `node_modules`, `android/build`, `android/app/build`, `ios/Pods` đúng đề; bỏ thêm `.git`, `.gradle`, `.cxx`, log và cấu hình đường dẫn máy `android/local.properties`. Giữ package-lock, Gradle wrapper và toàn bộ source để máy chấm có thể cài lại. Script `scripts/package-source.ps1` thực hiện việc này; truyền họ tên và MSSV thật trước khi nộp.

## 9. Tài liệu kỹ thuật tham khảo

- React Native: https://reactnative.dev/docs/set-up-your-environment
- Gradle Java compatibility: https://docs.gradle.org/current/userguide/compatibility.html
- React Navigation: https://reactnavigation.org/docs/getting-started/

Phiên bản SDK thực tế phải lấy theo `android/build.gradle` của project, không sao chép số SDK từ hướng dẫn chung cho phiên bản React Native khác.
