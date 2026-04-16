import { Skip } from '@/lib/types';

interface SkipCardProps {
  skip: Skip;
  selected: boolean;
  onSelect: () => void;
}

export default function SkipCard({ skip, selected, onSelect }: SkipCardProps) {
  return (
    <div
      data-testid={`skip-card-${skip.size}`}
      onClick={skip.disabled ? undefined : onSelect}
      className={[
        'relative rounded-xl border-2 p-4 transition-colors',
        skip.disabled
          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
          : selected
          ? 'border-blue-600 bg-blue-50 cursor-pointer'
          : 'border-gray-200 hover:border-blue-400 cursor-pointer',
      ].join(' ')}
    >
      {skip.disabled && (
        <span
          className="absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500"
          data-testid={`skip-card-${skip.size}-disabled`}
        >
          Not suitable for heavy waste
        </span>
      )}

      <p className="text-base font-bold text-gray-900">{skip.size}</p>
      <p
        className="mt-1 text-lg font-semibold text-blue-600"
        data-testid={`skip-card-${skip.size}-price`}
      >
        £{skip.price}
      </p>
      <p className="mt-0.5 text-xs text-gray-400">per week hire</p>

      {selected && !skip.disabled && (
        <span className="mt-2 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
          Selected
        </span>
      )}
    </div>
  );
}
