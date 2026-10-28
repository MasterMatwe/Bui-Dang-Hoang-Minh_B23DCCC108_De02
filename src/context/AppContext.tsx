import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppRepository } from '../storage/appStorage';
import type { AppData, BookingInput, FieldInput } from '../types';
import * as operations from '../data/operations';
import { colors, fontSize, spacing } from '../theme/colors';
import { Button } from '../components/Button';

type AppContextValue = AppData & {
  isSaving: boolean;
  saveField: (input: FieldInput, id?: string) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addBooking: (input: BookingInput) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Không thể lưu dữ liệu. Vui lòng thử lại.';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [repository] = useState(() => new AppRepository());
  const [data, setData] = useState<AppData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setSaving] = useState(false);
  const saving = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const result = await repository.load();
      if (mounted.current) {
        setData(result);
      }
    } catch (error) {
      if (mounted.current) {
        setLoadError(errorMessage(error));
      }
    }
  }, [repository]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const commit = async (update: (current: AppData) => AppData) => {
    if (saving.current) {
      throw new Error('Đang lưu dữ liệu. Vui lòng chờ một chút.');
    }
    saving.current = true;
    setSaving(true);
    try {
      const next = await repository.commit(update);
      if (mounted.current) {
        setData(next);
      }
    } finally {
      saving.current = false;
      if (mounted.current) {
        setSaving(false);
      }
    }
  };

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.brand}>SÂN NHÀ</Text>
        {loadError ? (
          <>
            <Text style={styles.message}>{loadError}</Text>
            <Button
              title="Thử lại"
              onPress={() => {
                void load();
              }}
            />
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.message}>Đang tải sân và lịch đặt…</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        ...data,
        isSaving,
        saveField: (input, id) =>
          commit(current => operations.saveField(current, input, id)),
        deleteField: id =>
          commit(current => operations.deleteField(current, id)),
        addBooking: input =>
          commit(current => operations.addBooking(current, input)),
        cancelBooking: id =>
          commit(current => operations.cancelBooking(current, id)),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp phải nằm trong AppProvider.');
  }
  return context;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.xl,
  },
  brand: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.primary,
  },
  message: {
    fontSize: fontSize.body,
    lineHeight: 24,
    color: colors.secondary,
    textAlign: 'center',
  },
});
