/**
 * Device presets for the prototype harness — min → max. Widths are the real
 * logical (dp/pt) widths; the layout is exercised at each so responsive
 * behaviour can be checked. `os` picks the status-bar / nav-chrome style and
 * corner radius.
 */
export type DeviceOS = 'ios' | 'android';
export type Device = {
  key: string;
  name: string;
  w: number;
  h: number;
  os: DeviceOS;
  radius: number;
  notch: boolean;
};

export const DEVICES: Device[] = [
  { key: 'se', name: 'iPhone SE', w: 375, h: 667, os: 'ios', radius: 0, notch: false },
  { key: 'i14', name: 'iPhone 14', w: 390, h: 844, os: 'ios', radius: 44, notch: true },
  { key: 'pixel', name: 'Pixel 7', w: 412, h: 915, os: 'android', radius: 34, notch: true },
  { key: 'max', name: 'iPhone 15 Pro Max', w: 430, h: 932, os: 'ios', radius: 50, notch: true },
  { key: 'mini', name: 'iPad mini', w: 744, h: 1024, os: 'ios', radius: 24, notch: false },
];

export const DEFAULT_DEVICE = DEVICES[1]; // iPhone 14
