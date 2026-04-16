import { Address } from '@/lib/types';

export const SW1A_1AA_ADDRESSES: Address[] = [
  { id: 'addr_1',  line1: '10 Downing Street',                   city: 'London' },
  { id: 'addr_2',  line1: '11 Downing Street',                   city: 'London' },
  { id: 'addr_3',  line1: '12 Downing Street',                   city: 'London' },
  { id: 'addr_4',  line1: '70 Whitehall',                        city: 'London' },
  { id: 'addr_5',  line1: '1 Horse Guards Road',                 city: 'London' },
  { id: 'addr_6',  line1: '2 Horse Guards Road',                 city: 'London' },
  { id: 'addr_7',  line1: 'Cabinet Office, 70 Whitehall',        city: 'London' },
  { id: 'addr_8',  line1: 'HM Treasury, 1 Horse Guards',         city: 'London' },
  { id: 'addr_9',  line1: 'Foreign Office, King Charles Street', city: 'London' },
  { id: 'addr_10', line1: 'Admiralty Arch, The Mall',            city: 'London' },
  { id: 'addr_11', line1: 'St James Park Gate',                  city: 'London' },
  { id: 'addr_12', line1: 'Birdcage Walk',                       city: 'London' },
];

// Module-level counter for BS1 4DJ retry simulation.
// Resets on Next.js server restart. workers:1 in playwright.config ensures no race conditions.
let bs14djCallCount = 0;

export function resetBs14djCounter() {
  bs14djCallCount = 0;
}

export function getBs14djResponse(): { shouldFail: boolean } {
  bs14djCallCount++;
  return { shouldFail: bs14djCallCount === 1 };
}

export const BS1_4DJ_ADDRESSES: Address[] = [
  { id: 'bs_addr_1', line1: '1 Harbourside',            city: 'Bristol' },
  { id: 'bs_addr_2', line1: '2 Harbourside',            city: 'Bristol' },
  { id: 'bs_addr_3', line1: 'Watershed Media Centre',   city: 'Bristol' },
];
