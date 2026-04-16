import { BookingStep } from '@/lib/types';

interface StepIndicatorProps {
  currentStep: BookingStep;
}

const STEPS = [
  { n: 1, label: 'Postcode' },
  { n: 2, label: 'Waste Type' },
  { n: 3, label: 'Skip Size' },
  { n: 4, label: 'Review' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0" data-testid="step-indicator">
      {STEPS.map(({ n, label }, idx) => {
        const done = currentStep > n;
        const active = currentStep === n;

        return (
          <div key={n} className="flex items-center">
            <div
              className="flex flex-col items-center"
              data-testid={`step-indicator-${n}`}
            >
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  done
                    ? 'bg-blue-600 text-white'
                    : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500',
                ].join(' ')}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={[
                  'mt-1 text-xs font-medium',
                  active ? 'text-blue-600' : done ? 'text-blue-600' : 'text-gray-400',
                ].join(' ')}
              >
                {label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'mx-2 mb-4 h-0.5 w-12',
                  currentStep > n ? 'bg-blue-600' : 'bg-gray-200',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
