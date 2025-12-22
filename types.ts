
export type CipherMode = 'LETTERS' | 'GREEK' | 'CYRILLIC' | 'SYMBOLS' | 'SYMBOLS_HARD' | 'COORDINATES' | 'COORDINATES_ROWS';

export interface CipherKey {
  [key: string]: string;
}

export interface SavedCryptogram {
  id: string;
  title: string;
  originalText: string;
  cipherKey: CipherKey;
  mode: CipherMode;
  tildeAssistant: boolean;
  createdAt: number;
}

export enum ViewState {
  EDITOR = 'EDITOR',
  LIBRARY = 'LIBRARY',
  PLAYER = 'PLAYER'
}

export interface PlayerStats {
  hintsUsed: number;
  mistakes: number;
  timeSeconds: number;
  completed: boolean;
}
