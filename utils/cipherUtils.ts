
import { ALPHABET_SPANISH, GREEK_ALPHABET, CYRILLIC_ALPHABET, SYMBOLS, COORDINATE_ROWS } from '../constants';
import { CipherKey, CipherMode } from '../types';

const TILDE_MAP: { [key: string]: string } = {
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U'
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const generateKey = (mode: CipherMode): CipherKey => {
  let targetSet: string[] = [];
  const baseAlphabet = ALPHABET_SPANISH;
  const newKey: CipherKey = {};

  if (mode === 'COORDINATES') {
    const shuffledAlphabet = shuffleArray([...baseAlphabet]);
    let charIndex = 0;
    COORDINATE_ROWS.forEach(rowLabel => {
      for (let col = 1; col <= 9; col++) {
        if (charIndex < shuffledAlphabet.length) {
          const letter = shuffledAlphabet[charIndex];
          newKey[letter] = `${rowLabel}${col}`;
          charIndex++;
        }
      }
    });
  } else if (mode === 'COORDINATES_ROWS') {
    const shuffledAlphabet = shuffleArray([...baseAlphabet]);
    let charIndex = 0;
    const rows = ['A', 'D'];
    rows.forEach(rowLabel => {
      for (let col = 1; col <= 14; col++) {
        if (charIndex < shuffledAlphabet.length) {
          const letter = shuffledAlphabet[charIndex];
          newKey[letter] = `${rowLabel}${col}`;
          charIndex++;
        }
      }
    });
  } else {
    switch (mode) {
      case 'LETTERS': targetSet = shuffleArray([...baseAlphabet]); break;
      case 'GREEK': targetSet = shuffleArray([...GREEK_ALPHABET]).slice(0, baseAlphabet.length); break;
      case 'CYRILLIC': targetSet = shuffleArray([...CYRILLIC_ALPHABET]).slice(0, baseAlphabet.length); break;
      case 'SYMBOLS': targetSet = shuffleArray([...SYMBOLS]).slice(0, baseAlphabet.length); break;
      default: targetSet = shuffleArray([...baseAlphabet]);
    }

    baseAlphabet.forEach((char, index) => {
      if (index < targetSet.length) {
        newKey[char] = targetSet[index];
      }
    });
  }
  
  return newKey;
};

export const getSymbolForChar = (char: string, key: CipherKey): string => {
  const upperChar = char.toUpperCase();
  if (key[upperChar]) return key[upperChar];
  // Si es una vocal con tilde, buscamos el símbolo de la vocal base
  const baseChar = TILDE_MAP[upperChar];
  if (baseChar && key[baseChar]) return key[baseChar];
  return char;
};

export const isAccented = (char: string): boolean => {
  return ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ü'].includes(char.toUpperCase());
};

export const sanitizeFilename = (text: string): string => {
  return text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20);
};
