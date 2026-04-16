'use client';

import { useState } from 'react';
import { BookingConfirmResponse, BookingState } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import BookingSuccess from '@/components/steps/BookingSuccess';

interface Step4Props {
  booking: BookingState;
  addressDisplay: string;
  onComplete: (bookingId: string) => void;
  onBack: () => void;
}

const PLASTERBOARD_LABELS: Record<string, string> = {
  'separate-bag':     'Separate Bag',
  'dedicated-skip':   'Dedicated Skip',
  'licensed-carrier': 'Licensed Carrier',
};

const WASTE_LABELS: Record<string, string> = {
  general:      'General Waste',
  heavy:        'Heavy Waste',
  plasterboard: 'Plasterboard',
};

type Phase = 'review' | 'loading' | 'error' | 'success';

export default function Step4Review({ booking, addressDisplay, onComplete, onBack }: Step4Props) {
  const [phase, setPhase] = useState<Phase>('review');
  const [apiError, setApiError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const skip = booking.selectedSkip!;

  async function handleConfirm() {
    if (phase !== 'review') return;
    setPhase('loading');
    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: booking.postcode,
          addressId: booking.selectedAddressId ?? 'manual',
          heavyWaste: booking.wasteType === 'heavy',
          plasterboard: booking.wasteType === 'plasterboard',
          plasterboardOption: booking.plasterboardOption,
          skipSize: skip.size,
          price: skip.price,
        }),
      });
      if (!res.ok) throw new Error('Booking failed. Please try again.');
      const data: BookingConfirmResponse = await res.json();
      setBookingId(data.bookingId);
      setPhase('success');
      onComplete(data.bookingId);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Something went wrong.');
      setPhase('error');
    }
  }

  if (phase === 'success' && bookingId) {
    return <BookingSuccess bookingId={bookingId} skipSize={skip.size} price={skip.price} />;
  }

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {[
          { label: 'Postcode',   value: booking.postcode,                   testid: 'review-postcode' },
          { label: 'Address',    value: addressDisplay,                     testid: 'review-address' },
          { label: 'Waste Type', value: WASTE_LABELS[booking.wasteType!],   testid: 'review-waste-type' },
          ...(booking.plasterboardOption ? [{
            label: 'Disposal Method',
            value: PLASTERBOARD_LABELS[booking.plasterboardOption],
            testid: 'review-plasterboard-option',
          }] : []),
          { label: 'Skip Size',  value: skip.size,                          testid: 'review-skip-size' },
        ].map(({ label, value, testid }) => (
          <div key={testid} className="flex justify-between px-4 py-3 text-sm">
            <dt className="font-medium text-gray-500">{label}</dt>
            <dd className="font-semibold text-gray-900" data-testid={testid}>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-xl border border-gray-200 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Skip hire</span>
          <span className="font-semibold" data-testid="review-price-base">£{skip.price}</span>
        </div>
        <hr className="my-2 border-gray-200" />
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span data-testid="review-price-total">£{skip.price}</span>
        </div>
      </div>

      {phase === 'error' && apiError && (
        <ErrorState message={apiError} onRetry={() => { setPhase('review'); setApiError(null); }} />
      )}
      {phase === 'loading' && <div data-testid="confirm-loading"><LoadingSpinner message="Confirming booking…" /></div>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={phase === 'loading'}
          className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={phase !== 'review'}
          className={[
            'flex-1 rounded-lg py-3 text-sm font-semibold transition-colors',
            phase === 'review'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ].join(' ')}
          data-testid="confirm-button"
        >
          {phase === 'loading' ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
