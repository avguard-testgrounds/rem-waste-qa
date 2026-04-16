'use client';

import { ManualAddress } from '@/lib/types';

interface ManualAddressFormProps {
  value: ManualAddress;
  onChange: (updated: ManualAddress) => void;
}

export default function ManualAddressForm({ value, onChange }: ManualAddressFormProps) {
  const set = (field: keyof ManualAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
      <input type="text" placeholder="Address line 1 *" value={value.line1}
        onChange={set('line1')}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        data-testid="manual-line1" />
      <input type="text" placeholder="Address line 2 (optional)" value={value.line2 ?? ''}
        onChange={set('line2')}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        data-testid="manual-line2" />
      <input type="text" placeholder="City *" value={value.city}
        onChange={set('city')}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        data-testid="manual-city" />
    </div>
  );
}
