import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

// Keep actual storage/context/list UI; only substitute the native navigator.
jest.mock('../src/navigation/RootNavigator', () => {
  const ReactModule = require('react');
  const { FieldListScreen } = require('../src/screens/FieldListScreen');
  return {
    RootNavigator: () =>
      ReactModule.createElement(FieldListScreen, {
        navigation: { navigate: jest.fn() },
      }),
  };
});

test('khởi động nạp seed và hiển thị số sân cùng giá đúng định dạng', async () => {
  await AsyncStorage.clear();
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const text = renderer.root
    .findAllByType(Text)
    .map(node =>
      React.Children.toArray(node.props.children)
        .filter(child => typeof child === 'string' || typeof child === 'number')
        .join(''),
    )
    .join(' ');
  expect(text).toContain('sân hoạt động');
  expect(text).toContain('Sân A1');
  expect(text).toContain('300.000 đ');
  expect(text).toContain('Bảo trì');
  await ReactTestRenderer.act(async () => renderer.unmount());
});
