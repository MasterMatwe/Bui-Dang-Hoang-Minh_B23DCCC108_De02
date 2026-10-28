import React from 'react';
import Renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { Alert, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from '../src/context/AppContext';
import { FieldFormScreen } from '../src/screens/FieldFormScreen';
import { FieldListScreen } from '../src/screens/FieldListScreen';
import { FieldDetailScreen } from '../src/screens/FieldDetailScreen';
import { BookingModal } from '../src/components/BookingModal';
import { Button } from '../src/components/Button';
import { createSeed } from '../src/data/seed';
import { STORAGE_KEY } from '../src/storage/appStorage';

let renderer: ReactTestRenderer;
const visibleText = () =>
  renderer.root
    .findAllByType(Text)
    .map(node =>
      React.Children.toArray(node.props.children)
        .filter(child => typeof child === 'string' || typeof child === 'number')
        .join(''),
    )
    .join(' ');
beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});
afterEach(async () => {
  if (renderer) {
    await act(async () => renderer.unmount());
  }
});
async function mount(child: React.ReactNode) {
  await act(async () => {
    renderer = Renderer.create(<AppProvider>{child}</AppProvider>);
  });
}
async function input(testID: string, value: string) {
  await act(async () => {
    renderer.root
      .findAllByType(TextInput)
      .find(node => node.props.testID === testID)!
      .props.onChangeText(value);
  });
}
async function press(testID: string) {
  await act(async () => {
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.testID === testID)!
      .props.onPress();
  });
}
async function stored() {
  return JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
}

test('danh sách rỗng hiển thị hướng dẫn và không tự tạo lại sân mẫu', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, fields: [], bookings: [] }),
  );
  const props = {
    navigation: { navigate: jest.fn() },
  } as unknown as React.ComponentProps<typeof FieldListScreen>;
  await mount(<FieldListScreen {...props} />);
  expect(visibleText()).toContain('Chưa có sân bóng');
  expect((await stored()).fields).toEqual([]);
});

test('lỗi đọc bộ nhớ có thông báo và nút thử lại khôi phục giao diện', async () => {
  jest
    .spyOn(AsyncStorage, 'getItem')
    .mockRejectedValueOnce(new Error('Không đọc được bộ nhớ'));
  const props = {
    navigation: { navigate: jest.fn() },
  } as unknown as React.ComponentProps<typeof FieldListScreen>;
  await mount(<FieldListScreen {...props} />);
  expect(visibleText()).toContain('Không đọc được bộ nhớ');
  await act(async () => {
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.title === 'Thử lại')!
      .props.onPress();
  });
  expect(visibleText()).toContain('Sân A1');
});

test('form thêm báo lỗi dưới ô, rồi lưu sân hợp lệ', async () => {
  const goBack = jest.fn();
  const props = {
    route: { params: undefined },
    navigation: { goBack },
  } as unknown as React.ComponentProps<typeof FieldFormScreen>;
  await mount(<FieldFormScreen {...props} />);
  await press('save-field');
  expect(visibleText()).toContain('Vui lòng nhập tên sân.');
  expect(goBack).not.toHaveBeenCalled();
  await input('field-name', 'Sân C1');
  await input('field-price', '250000');
  await press('save-field');
  expect((await stored()).fields).toHaveLength(5);
  expect(goBack).toHaveBeenCalledTimes(1);
});

test('form sửa điền sẵn, chặn tên trùng và cập nhật sân cũ', async () => {
  const goBack = jest.fn();
  const props = {
    route: { params: { fieldId: 'field-a1' } },
    navigation: { goBack },
  } as unknown as React.ComponentProps<typeof FieldFormScreen>;
  await mount(<FieldFormScreen {...props} />);
  expect(
    renderer.root
      .findAllByType(TextInput)
      .find(node => node.props.testID === 'field-name')!.props.value,
  ).toBe('Sân A1');
  await input('field-name', 'Sân A2');
  await press('save-field');
  expect(visibleText()).toContain('Tên sân đã tồn tại');
  await input('field-name', 'Sân A1');
  await input('field-price', '400000');
  await press('save-field');
  expect((await stored()).fields[0].pricePerHour).toBe(400000);
  expect((await stored()).fields).toHaveLength(4);
});

test('xoá sân hỏi Alert và chỉ thực hiện sau xác nhận; chặn sân có lịch', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const props = {
    navigation: { navigate: jest.fn() },
  } as unknown as React.ComponentProps<typeof FieldListScreen>;
  await mount(<FieldListScreen {...props} />);
  await act(async () => {
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.accessibilityLabel === 'Xoá Sân A1')!
      .props.onPress();
  });
  expect(alert.mock.calls[0][0]).toBe('Không thể xoá sân');
  await act(async () => {
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.accessibilityLabel === 'Xoá Sân A2')!
      .props.onPress();
  });
  expect((await stored()).fields).toHaveLength(4);
  const buttons = alert.mock.calls[1][2]!;
  expect(buttons[0].style).toBe('cancel');
  await act(async () => {
    buttons[1].onPress!();
  });
  expect((await stored()).fields).toHaveLength(3);
});

test('Modal tính tiền ngay, chặn trùng, nhận lịch nối tiếp và đóng khi lưu', async () => {
  const seed = createSeed();
  const onClose = jest.fn();
  await mount(<BookingModal field={seed.fields[0]} onClose={onClose} />);
  await input('booking-customer', 'Khách mới');
  await input('booking-phone', '0901234567');
  await input('booking-start', '18');
  await input('booking-hours', '2');
  expect(visibleText()).toContain('600.000 đ');
  await press('confirm-booking');
  expect(visibleText()).toContain('Vui lòng chọn khung giờ khác');
  expect(onClose).not.toHaveBeenCalled();
  await input('booking-start', '20');
  await input('booking-hours', '1');
  await press('confirm-booking');
  expect((await stored()).bookings).toHaveLength(4);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('chi tiết sân bảo trì vô hiệu nút Đặt sân và hiển thị danh sách rỗng', async () => {
  const props = {
    route: { params: { fieldId: 'field-b2' } },
    navigation: { navigate: jest.fn() },
  } as unknown as React.ComponentProps<typeof FieldDetailScreen>;
  await mount(<FieldDetailScreen {...props} />);
  expect(
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.testID === 'open-booking')!.props.disabled,
  ).toBe(true);
  expect(visibleText()).toContain('Sân chưa có lượt đặt');
});

test('huỷ lượt đặt hỏi xác nhận và chỉ xoá booking tương ứng', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const props = {
    route: { params: { fieldId: 'field-a1' } },
    navigation: { navigate: jest.fn() },
  } as unknown as React.ComponentProps<typeof FieldDetailScreen>;
  await mount(<FieldDetailScreen {...props} />);
  await act(async () => {
    renderer.root
      .findAllByType(Button)
      .find(node => node.props.title === 'Huỷ lượt đặt')!
      .props.onPress();
  });
  expect((await stored()).bookings).toHaveLength(3);
  expect(alert.mock.calls[0][0]).toBe('Huỷ lượt đặt?');
  await act(async () => {
    alert.mock.calls[0][2]![1].onPress!();
  });
  expect((await stored()).bookings).toHaveLength(2);
});
