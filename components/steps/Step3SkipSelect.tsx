'use client';

import { useEffect, useState } from 'react';
import { Skip, SkipsResponse } from '@/lib/types';
import { normalisePostcode } from '@/lib/utils';
import SkipCard from '@/components/ui/SkipCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';

interface Step3Props {
  initialSkip: Skip | null;
  postcode: string;
  heavyWaste: boolean;
  onComplete: (skip: Skip) => void;
  onBack: () => void;
}

export default function Step3SkipSelect({
  initialSkip, postcode, heavyWaste, onComplete, onBack,
}: Step3Props) {
  const [skips, setSkips] = useState<Skip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Skip | null>(initialSkip);

  async function fetchSkips() {
    setLoading(true);
    setError(null);
    try {
      const norm = normalisePostcode(postcode);
      const res = await fetch(`/api/skips?postcode=${norm}&heavyWaste=${heavyWaste}`);
      if (!res.ok) throw new Error('Failed to load skip options.');
      const data: SkipsResponse = await res.json();
      setSkips(data.skips);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSkips(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      {loading && <LoadingSpinner message="Loading skip options…" />}
      {error && !loading && <ErrorState message={error} onRetry={fetchSkips} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {skips.map(skip => (
            <SkipCard
              key={skip.size}
              skip={skip}
              selected={selected?.size === skip.size}
              onSelect={() => setSelected(skip)}
            />
          ))}
        </div>
      )}

      {selected && (
        <div
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm"
          data-testid="skip-selected-summary"
        >
          <span className="font-medium text-blue-700">Selected:</span>
          <span className="ml-1 text-blue-900">{selected.size} skip — £{selected.price}</span>
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
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className={[
            'flex-1 rounded-lg py-3 text-sm font-semibold transition-colors',
            selected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ].join(' ')}
          data-testid="step3-continue"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
