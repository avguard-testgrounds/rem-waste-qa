import { Skip } from '@/lib/types';

const ALL_SKIPS: Skip[] = [
  { size: '2-yard',  price: 80,  disabled: false },
  { size: '4-yard',  price: 120, disabled: false },
  { size: '6-yard',  price: 160, disabled: false },
  { size: '8-yard',  price: 200, disabled: false },
  { size: '10-yard', price: 240, disabled: false },
  { size: '12-yard', price: 280, disabled: false },
  { size: '14-yard', price: 320, disabled: false },
  { size: '16-yard', price: 380, disabled: false },
];

const HEAVY_WASTE_DISABLED_SIZES = ['12-yard', '14-yard', '16-yard'];

export function getSkips(heavyWaste: boolean): Skip[] {
  return ALL_SKIPS.map(skip => ({
    ...skip,
    disabled: heavyWaste && HEAVY_WASTE_DISABLED_SIZES.includes(skip.size),
    disabledReason: heavyWaste && HEAVY_WASTE_DISABLED_SIZES.includes(skip.size)
      ? 'Not suitable for heavy waste — weight limit exceeded'
      : undefined,
  }));
}
