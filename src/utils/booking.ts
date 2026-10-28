import type { Booking, BookingInput } from '../types';

export function findConflict(
  candidate: BookingInput,
  bookings: Booking[],
): Booking | undefined {
  return bookings.find(
    booking =>
      booking.fieldId === candidate.fieldId &&
      booking.date === candidate.date &&
      candidate.startHour < booking.startHour + booking.hours &&
      candidate.startHour + candidate.hours > booking.startHour,
  );
}
