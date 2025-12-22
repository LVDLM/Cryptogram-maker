
import { ALPHABET_SPANISH, GREEK_ALPHABET, CYRILLIC_ALPHABET, SYMBOLS, COORDINATE_ROWS } from '../constants';
import { CipherKey, CipherMode } from '../types';

const TILDE_MAP: { [key: string]: string } = {
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U'
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const normalizeLetter = (char: string): string => {
  const upper = char.toUpperCase();
  return TILDE_MAP[upper] || upper;
};

export const generateKey = (mode: CipherMode): CipherKey => {
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
  } else if (mode === 'SYMBOLS_HARD') {
    // Modo difícil pedagógico: 
    // Mezclamos alfabeto y símbolos. Usamos 25 símbolos para 27 letras.
    // Esto genera 2 colisiones (contextuales).
    const shuffledSymbols = shuffleArray([...SYMBOLS]).slice(0, 25);
    const shuffledAlphabet = shuffleArray([...baseAlphabet]);
    
    // Las primeras 23 letras tienen símbolos únicos
    for (let i = 0; i < 23; i++) {
      newKey[shuffledAlphabet[i]] = shuffledSymbols[i];
    }
    // Las últimas 4 letras comparten los últimos 2 símbolos (2 letras por cada símbolo repetido)
    newKey[shuffledAlphabet[23]] = shuffledSymbols[23];
    newKey[shuffledAlphabet[24]] = shuffledSymbols[23]; // Colisión 1
    newKey[shuffledAlphabet[25]] = shuffledSymbols[24];
    newKey[shuffledAlphabet[26]] = shuffledSymbols[24]; // Colisión 2
    
  } else {
    let targetSet: string[] = [];
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
