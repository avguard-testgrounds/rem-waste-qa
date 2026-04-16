// ONLY used by Playwright tests — never import this in app code

export const POSTCODES = {
  valid: {
    sw1a: 'SW1A 1AA',  // 12 addresses
    ec1a: 'EC1A 1BB',  // 0 addresses — empty state
    m1:   'M1 1AE',    // latency simulation
    bs1:  'BS1 4DJ',   // 500 → retry
  },
  invalid: {
    tooShort:     'NG1',
    wrongFormat:  '12345',
    empty:        '',
    xss:          '<script>alert(1)</script>',
    sqlInjection: "' OR 1=1 --",
  },
};

export const SKIP_SIZES = {
  mini:           '2-yard',
  small:          '4-yard',
  medium:         '6-yard',
  large:          '8-yard',
  extraLarge:     '10-yard',
  disabledHeavy1: '12-yard',  // disabled when heavyWaste:true
  disabledHeavy2: '14-yard',  // disabled when heavyWaste:true
  disabledHeavy3: '16-yard',  // disabled when heavyWaste:true
};

export const PLASTERBOARD_OPTIONS = {
  separateBag:     'separate-bag',
  dedicatedSkip:   'dedicated-skip',
  licensedCarrier: 'licensed-carrier',
};

export const VALID_ADDRESS_ID = 'addr_1';  // from SW1A 1AA fixture
