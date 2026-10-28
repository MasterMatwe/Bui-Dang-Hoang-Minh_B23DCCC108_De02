import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { FieldListScreen } from '../screens/FieldListScreen';
import { FieldFormScreen } from '../screens/FieldFormScreen';
import { FieldDetailScreen } from '../screens/FieldDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};
export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="FieldList"
          component={FieldListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FieldForm"
          component={FieldFormScreen}
          options={({ route }) => ({
            title: route.params?.fieldId ? 'Sửa sân' : 'Thêm sân',
          })}
        />
        <Stack.Screen
          name="FieldDetail"
          component={FieldDetailScreen}
          options={{ title: 'Chi tiết sân' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
