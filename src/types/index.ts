export type FieldType = '5 người' | '7 người';
export type FieldStatus = 'Hoạt động' | 'Bảo trì';

export type Field = {
  id: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
  status: FieldStatus;
};

export type Booking = {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
};

export type AppData = { version: 1; fields: Field[]; bookings: Booking[] };
export type FieldInput = Omit<Field, 'id'>;
export type BookingInput = Omit<Booking, 'id'>;
export type FieldDraft = Omit<FieldInput, 'pricePerHour'> & {
  pricePerHour: string;
};
export type BookingDraft = Omit<BookingInput, 'startHour' | 'hours'> & {
  startHour: string;
  hours: string;
};
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type RootStackParamList = {
  FieldList: undefined;
  FieldForm: { fieldId?: string } | undefined;
  FieldDetail: { fieldId: string };
};
