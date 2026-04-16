'use client';

import { useState } from 'react';
import { WasteType, PlasterboardOption } from '@/lib/types';

interface Step2Props {
  initialWasteType: WasteType | null;
  initialPlasterboardOption: PlasterboardOption | null;
  onComplete: (wasteType: WasteType, plasterboardOption: PlasterboardOption | null) => void;
  onBack: () => void;
}

const WASTE_TYPES = [
  { id: 'general' as WasteType,      label: 'General Waste',  desc: 'Household or office waste, furniture, garden waste', icon: '🗑️' },
  { id: 'heavy' as WasteType,        label: 'Heavy Waste',    desc: 'Soil, concrete, bricks, tiles, rubble', icon: '🧱' },
  { id: 'plasterboard' as WasteType, label: 'Plasterboard',   desc: 'Plasterboard sheets, drywall, gypsum board', icon: '🪵' },
];

const PLASTERBOARD_OPTIONS: { id: PlasterboardOption; label: string; desc: string; note: string }[] = [
  { id: 'separate-bag',     label: 'Separate Bag',      desc: 'Place plasterboard in a separate bag alongside the skip', note: 'Most cost-effective option' },
  { id: 'dedicated-skip',   label: 'Dedicated Skip',    desc: 'A skip solely for plasterboard waste', note: 'Required for large quantities' },
  { id: 'licensed-carrier', label: 'Licensed Carrier',  desc: 'Collection by a licensed waste carrier', note: 'Fully compliant with regulations' },
];

export default function Step2WasteType({
  initialWasteType,
  initialPlasterboardOption,
  onComplete,
  onBack,
}: Step2Props) {
  const [wasteType, setWasteType] = useState<WasteType | null>(initialWasteType);
  const [plasterboardOption, setPlasterboardOption] = useState<PlasterboardOption | null>(initialPlasterboardOption);
  const [loading, setLoading] = useState(false);

  const canContinue =
    wasteType !== null &&
    (wasteType !== 'plasterboard' || plasterboardOption !== null);

  async function handleContinue() {
    if (!wasteType || !canContinue) return;
    setLoading(true);
    try {
      await fetch('/api/waste-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heavyWaste: wasteType === 'heavy',
          plasterboard: wasteType === 'plasterboard',
          plasterboardOption: wasteType === 'plasterboard' ? plasterboardOption : null,
        }),
      });
    } finally {
      setLoading(false);
    }
    onComplete(wasteType, wasteType === 'plasterboard' ? plasterboardOption : null);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {WASTE_TYPES.map(({ id, label, desc, icon }) => (
          <button
            key={id}
            onClick={() => { setWasteType(id); if (id !== 'plasterboard') setPlasterboardOption(null); }}
            className={[
              'w-full rounded-xl border-2 p-4 text-left transition-colors',
              wasteType === id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400',
            ].join(' ')}
            data-testid={`waste-type-${id}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {wasteType === 'plasterboard' && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">How would you like to dispose of the plasterboard?</p>
          {PLASTERBOARD_OPTIONS.map(({ id, label, desc, note }) => (
            <button
              key={id}
              onClick={() => setPlasterboardOption(id)}
              className={[
                'w-full rounded-lg border-2 p-3 text-left transition-colors',
                plasterboardOption === id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400',
              ].join(' ')}
              data-testid={`plasterboard-${id}`}
            >
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
              <p className="mt-0.5 text-xs font-medium text-blue-600">{note}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className={[
            'flex-1 rounded-lg py-3 text-sm font-semibold transition-colors',
            canContinue && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ].join(' ')}
          data-testid="step2-continue"
        >
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
