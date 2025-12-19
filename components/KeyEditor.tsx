import React from 'react';
import { ALPHABET_UPPER } from '../constants';
import { CipherKey } from '../types';

interface KeyEditorProps {
  currentKey: CipherKey;
  onKeyChange: (newKey: CipherKey) => void;
}

export const KeyEditor: React.FC<KeyEditorProps> = ({ currentKey, onKeyChange }) => {
  const handleChange = (letter: string, value: string) => {
    onKeyChange({
      ...currentKey,
      [letter]: value.slice(0, 1) // Only allow 1 char
    });
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-2 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      {ALPHABET_UPPER.map((char) => (
        <div key={char} className="flex flex-col items-center p-1 bg-slate-50 rounded">
          <span className="text-xs font-bold text-slate-400 mb-1">{char}</span>
          <div className="flex items-center justify-center">
            <span className="text-slate-400 mr-1">=</span>
            <input
              type="text"
              value={currentKey[char] || ''}
              onChange={(e) => handleChange(char, e.target.value)}
              className="w-8 h-8 text-center border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
