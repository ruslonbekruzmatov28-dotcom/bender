/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppState {
  WELCOME = 'welcome',
  TODAY = 'today',
  MONTH = 'month',
  DUA = 'dua',
  REGION = 'region',
  TASBIH = 'tasbih',
  ZAKAT = 'zakat',
  TRACKER = 'tracker',
  COMMUNITY = 'community'
}

export enum AppTheme {
  EMERALD = 'emerald',
  ROYAL = 'royal',
  SAND = 'sand',
  MINIMAL = 'minimal'
}

export interface CalendarDay {
  day: number;
  date: string;
  fajr: string;
  maghrib: string;
}

export interface DistrictOffset {
  name: string;
  sahar: number;
  iftor: number;
}

export interface Dua {
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
}
