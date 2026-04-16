'use client';

import { useState } from 'react';
import { BookingState, BookingStep, ManualAddress, PlasterboardOption, WasteType } from '@/lib/types';
import StepIndicator from '@/components/ui/StepIndicator';
import Step1Postcode from '@/components/steps/Step1Postcode';
import Step2WasteType from '@/components/steps/Step2WasteType';

const STEP_TITLES: Record<number, string> = {
  1: 'Where do you need the skip?',
  2: 'What type of waste?',
  3: 'Choose your skip size',
  4: 'Review & Confirm',
};

const initialBooking: BookingState = {
  postcode: '',
  selectedAddressId: null,
  manualAddress: null,
  wasteType: null,
  plasterboardOption: null,
  selectedSkip: null,
  bookingId: null,
};

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingState>(initialBooking);

  function goBack() {
    setCurrentStep(prev => (prev - 1) as BookingStep);
  }

  function handleStep1Complete(postcode: string, addressId: string | null, manual: ManualAddress | null) {
    setBooking(prev => ({ ...prev, postcode, selectedAddressId: addressId, manualAddress: manual }));
    setCurrentStep(2);
  }

  function handleStep2Complete(wasteType: WasteType, plasterboardOption: PlasterboardOption | null) {
    setBooking(prev => {
      const skipChanged = prev.wasteType === 'heavy' && wasteType !== 'heavy';
      return {
        ...prev,
        wasteType,
        plasterboardOption,
        selectedSkip: skipChanged ? null : prev.selectedSkip,
      };
    });
    setCurrentStep(3);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Book Your Skip</h1>
          <p className="text-sm text-center text-gray-500 mb-6">REM Waste — fast, reliable skip hire</p>
          {currentStep <= 4 && <StepIndicator currentStep={currentStep} />}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {STEP_TITLES[currentStep]}
          </h2>

          {currentStep === 1 && (
            <Step1Postcode
              initialPostcode={booking.postcode}
              initialAddressId={booking.selectedAddressId}
              initialManualAddress={booking.manualAddress}
              onComplete={handleStep1Complete}
            />
          )}

          {currentStep === 2 && (
            <Step2WasteType
              initialWasteType={booking.wasteType}
              initialPlasterboardOption={booking.plasterboardOption}
              onComplete={handleStep2Complete}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">Step 3 — Skip Selection</p>
              <p className="text-sm mt-1">Coming in Day 3</p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-medium">Step 4 — Review & Confirm</p>
              <p className="text-sm mt-1">Coming in Day 3</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
