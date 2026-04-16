interface BookingSuccessProps {
  bookingId: string;
  skipSize: string;
  price: number;
}

export default function BookingSuccess({ bookingId, skipSize, price }: BookingSuccessProps) {
  return (
    <div className="space-y-6 text-center" data-testid="booking-success">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your {skipSize} skip hire has been booked.
        </p>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-gray-600">Booking Reference</p>
        <p
          className="mt-1 text-2xl font-bold tracking-widest text-green-700"
          data-testid="booking-id"
        >
          {bookingId}
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium">What happens next?</p>
        <p className="mt-1">We'll confirm your booking by email and call to arrange delivery.</p>
        <p className="mt-2 font-semibold text-gray-900">Total charged: £{price}</p>
      </div>
    </div>
  );
}
