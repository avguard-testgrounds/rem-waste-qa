'use client';

import { useState } from 'react';
import { Address, ManualAddress, PostcodeLookupResponse } from '@/lib/types';
import { isValidUKPostcode } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import ManualAddressForm from '@/components/steps/ManualAddressForm';

interface Step1Props {
  initialPostcode: string;
  initialAddressId: string | null;
  initialManualAddress: ManualAddress | null;
  onComplete: (postcode: string, addressId: string | null, manual: ManualAddress | null) => void;
}

const EMPTY_MANUAL: ManualAddress = { line1: '', line2: '', city: '', postcode: '' };

export default function Step1Postcode({
  initialPostcode, initialAddressId, initialManualAddress, onComplete,
}: Step1Props) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialAddressId);
  const [showManual, setShowManual] = useState(!!initialManualAddress);
  const [manual, setManual] = useState<ManualAddress>(initialManualAddress ?? EMPTY_MANUAL);
  const [lastQueried, setLastQueried] = useState(initialPostcode);

  function validate(value: string): string | null {
    if (!value.trim()) return 'Please enter a postcode';
    if (!isValidUKPostcode(value)) return 'Please enter a valid UK postcode (e.g. SW1A 1AA)';
    return null;
  }
  async function handleLookup() {
    const err = validate(postcode);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setApiError(null);
    setLoading(true);
    setAddresses(null);
    setSelectedId(null);

    try {
      const res = await fetch('/api/postcode/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode }),
      });
      if (!res.ok) throw new Error('Could not look up postcode. Please try again.');
      const data: PostcodeLookupResponse = await res.json();
      setAddresses(data.addresses);
      setLastQueried(postcode);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const canContinue = !!selectedId || !!(showManual && manual.line1.trim() && manual.city.trim());

  function handleContinue() {
    if (!canContinue) return;
    if (showManual && manual.line1.trim() && manual.city.trim()) {
      onComplete(manual.postcode || lastQueried, null, { ...manual, postcode: manual.postcode || lastQueried });
    } else {
      onComplete(lastQueried, selectedId, null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={postcode}
            onChange={e => { setPostcode(e.target.value); setValidationError(null); }}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="e.g. SW1A 1AA"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            data-testid="postcode-input"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            data-testid="postcode-submit"
          >
            Find Address
          </button>
        </div>
        {validationError && (
          <p className="mt-1 text-sm text-red-600" data-testid="error-message">{validationError}</p>
        )}
      </div>

      {loading && <LoadingSpinner message="Looking up address…" />}
      {apiError && !loading && <ErrorState message={apiError} onRetry={handleLookup} />}

      {addresses !== null && !loading && !apiError && (
        addresses.length === 0
          ? <p className="text-sm text-gray-500">No addresses found for this postcode.</p>
          : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200" data-testid="address-list">
              {addresses.map(addr => (
                <li key={addr.id}>
                  <button
                    onClick={() => { setSelectedId(addr.id); setShowManual(false); }}
                    className={[
                      'w-full px-4 py-3 text-left text-sm transition-colors',
                      selectedId === addr.id ? 'bg-blue-50 font-medium text-blue-700' : 'hover:bg-gray-50 text-gray-700',
                    ].join(' ')}
                    data-testid={`address-option-${addr.id}`}
                  >
                    {addr.line1}, {addr.city}
                  </button>
                </li>
              ))}
            </ul>
          )
      )}

      <button
        onClick={() => setShowManual(v => !v)}
        className="text-sm text-blue-600 underline hover:text-blue-700"
        data-testid="manual-entry-toggle"
      >
        Enter address manually
      </button>

      {showManual && <ManualAddressForm value={manual} onChange={setManual} />}

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={[
          'w-full rounded-lg py-3 text-sm font-semibold transition-colors',
          canContinue ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        ].join(' ')}
        data-testid="step1-continue"
      >
        Continue
      </button>
    </div>
  );
}
