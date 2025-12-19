import { ALPHABET_UPPER, ALPHABET_SPANISH, GREEK_ALPHABET, CYRILLIC_ALPHABET, SYMBOLS, COORDINATE_ROWS } from '../constants';
import { CipherKey, CipherMode } from '../types';

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
  const baseAlphabet = (mode === 'COORDINATES' || mode === 'COORDINATES_ROWS') ? ALPHABET_SPANISH : ALPHABET_UPPER;
  const newKey: CipherKey = {};

  if (mode === 'COORDINATES') {
    // Classic 3-row mode (A, B, D x 9 cols)
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
    // New "Sandwich" mode: 2 Rows (A, D) x 14 Cols = 28 slots (enough for 27 chars)
    const shuffledAlphabet = shuffleArray([...baseAlphabet]);
    let charIndex = 0;
    const rows = ['A', 'D'];
    
    rows.forEach(rowLabel => {
      // 14 columns to fit 27 letters in 2 rows
      for (let col = 1; col <= 14; col++) {
        if (charIndex < shuffledAlphabet.length) {
          const letter = shuffledAlphabet[charIndex];
          newKey[letter] = `${rowLabel}${col}`;
          charIndex++;
        }
      }
    });

  } else {
    // Standard Substitution Logic
    switch (mode) {
      case 'LETTERS':
        targetSet = shuffleArray([...ALPHABET_UPPER]);
        break;
      case 'GREEK':
        targetSet = shuffleArray([...GREEK_ALPHABET]).slice(0, 26);
        break;
      case 'CYRILLIC':
        targetSet = shuffleArray([...CYRILLIC_ALPHABET]).slice(0, 26);
        break;
      case 'SYMBOLS':
        targetSet = shuffleArray([...SYMBOLS]).slice(0, 26);
        break;
      default:
        targetSet = shuffleArray([...ALPHABET_UPPER]);
    }

    baseAlphabet.forEach((char, index) => {
      if (index < targetSet.length) {
        newKey[char] = targetSet[index];
      } else {
        newKey[char] = char;
      }
    });
  }
  
  // Fallback for missing letters (e.g., standard alphabet vs spanish mismatch)
  ALPHABET_UPPER.forEach(char => {
     if (!newKey[char]) {
         // Try to find a substitute or map to itself if completely broken, 
         // but usually W or Ñ might be the issue.
         // In COORDINATES modes we used ALPHABET_SPANISH so it covers standard.
         // Just in case:
         newKey[char] = newKey['W'] || char; 
     }
  });

  return newKey;
};

export const encodeText = (text: string, key: CipherKey): string => {
  // Determine if we are using extended spanish chars based on key presence
  const isCoordinate = Object.values(key).some(v => v.length >= 2 && /\d/.test(v));
  
  return text
    .toUpperCase()
    .split('')
    .map((char) => {
      if (key[char]) {
        return key[char]; 
      }
      if (ALPHABET_UPPER.includes(char) && key[char]) {
        return key[char];
      }
      return char;
    })
    .join(isCoordinate ? ' ' : '');
};

export const sanitizeFilename = (text: string): string => {
  return text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20);
};
