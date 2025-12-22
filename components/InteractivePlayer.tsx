
import React, { useState, useEffect, useMemo } from 'react';
import { CipherKey, CipherMode, PlayerStats } from '../types';
import { ALPHABET_SPANISH, COORDINATE_ROWS } from '../constants';
import { getSymbolForChar, isAccented } from '../utils/cipherUtils';
import { Lightbulb, Trophy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractivePlayerProps {
  text: string;
  cipherKey: CipherKey;
  mode: CipherMode;
  tildeAssistant: boolean;
  onExit: () => void;
}

interface PuzzleChar {
  id: string;
  original: string;
  encoded: string;
  isPuzzle: boolean;
  hasTilde: boolean;
}

export const InteractivePlayer: React.FC<InteractivePlayerProps> = ({ text, cipherKey, mode, tildeAssistant, onExit }) => {
  const [guesses, setGuesses] = useState<{ [index: string]: string }>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [isKeyExpanded, setIsKeyExpanded] = useState(true);
  const [stats, setStats] = useState<PlayerStats>({
    hintsUsed: 0,
    mistakes: 0,
    timeSeconds: 0,
    completed: false
  });
  
  const isCoordinateMode = mode === 'COORDINATES' || mode === 'COORDINATES_ROWS';
  const isSandwichMode = mode === 'COORDINATES_ROWS';

  const puzzleData = useMemo(() => {
    let index = 0;
    return text.toUpperCase().split(' ').map((word) => {
      const chars: PuzzleChar[] = word.split('').map((char) => {
        const id = `char-${index++}`;
        return {
          id,
          original: char,
          encoded: getSymbolForChar(char, cipherKey),
          isPuzzle: /^[A-ZÑÁÉÍÓÚÜ]$/i.test(char),
          hasTilde: isAccented(char)
        };
      });
      return { chars, id: `word-${index}` };
    });
  }, [text, cipherKey]);

  useEffect(() => {
    if (stats.completed) return;
    const timer = setInterval(() => {
      setStats(s => ({ ...s, timeSeconds: s.timeSeconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [stats.completed]);

  const handleInputChange = (id: string, value: string) => {
    if (stats.completed) return;
    const val = value.slice(-1).toUpperCase();
    
    let charObj: PuzzleChar | undefined;
    puzzleData.forEach(word => word.chars.forEach(c => {
        if (c.id === id) charObj = c;
    }));

    if (!charObj) return;

    const newGuesses = { ...guesses };
    puzzleData.forEach(word => word.chars.forEach(c => {
        if (c.encoded === charObj?.encoded && c.isPuzzle) {
            newGuesses[c.id] = val;
        }
    }));
    
    setGuesses(newGuesses);
    checkCompletion(newGuesses);
  };

  const checkCompletion = (currentGuesses: { [index: string]: string }) => {
    let allCorrect = true;
    let filledCount = 0;
    let totalPuzzleChars = 0;

    puzzleData.forEach(word => word.chars.forEach(c => {
      if (c.isPuzzle) {
        totalPuzzleChars++;
        const guess = currentGuesses[c.id];
        if (guess) filledCount++;
        if (guess !== c.original) allCorrect = false;
      }
    }));

    if (allCorrect && filledCount === totalPuzzleChars) {
      setStats(s => ({ ...s, completed: true }));
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const getHint = () => {
    if (stats.completed) return;
    const empty: PuzzleChar[] = [];
    puzzleData.forEach(word => word.chars.forEach(c => {
      if (c.isPuzzle && !guesses[c.id]) empty.push(c);
    }));

    if (empty.length > 0) {
      const targetChar = empty[Math.floor(Math.random() * empty.length)];
      const newGuesses = { ...guesses };
      puzzleData.forEach(word => word.chars.forEach(c => {
        if (c.encoded === targetChar.encoded && c.isPuzzle) {
            newGuesses[c.id] = targetChar.original;
        }
      }));
      setGuesses(newGuesses);
      setStats(s => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
      checkCompletion(newGuesses);
    }
  };

  const getLetterAtCoordinate = (row: string, col: number) => {
    const coord = `${row}${col}`;
    return Object.keys(cipherKey).find(key => cipherKey[key] === coord) || "";
  };

  if (stats.completed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-emerald-100 max-w-2xl mx-auto mt-10">
        <Trophy className="w-20 h-20 text-yellow-500 mb-6 animate-bounce" />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Excelente!</h2>
        <p className="text-slate-500 mb-8 text-center">Has completado el criptograma con éxito.</p>
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-indigo-600">{stats.timeSeconds}s</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Tiempo</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
                <span className="block text-2xl font-bold text-emerald-600">{stats.hintsUsed}</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Pistas</span>
            </div>
        </div>
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg mb-8 text-lg font-medium italic text-center w-full">"{text}"</div>
        <button onClick={onExit} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors uppercase text-sm tracking-widest">Volver</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 px-2 md:px-4 pb-10">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center sticky top-2 z-30">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">← SALIR</button>
        <div className="text-slate-700 font-mono font-bold text-lg">{Math.floor(stats.timeSeconds / 60)}:{(stats.timeSeconds % 60).toString().padStart(2, '0')}</div>
        <button onClick={getHint} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm">
            <Lightbulb className="w-4 h-4" />
            <span className="font-bold text-xs uppercase">Pista</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button onClick={() => setIsKeyExpanded(!isKeyExpanded)} className="w-full flex justify-between items-center p-3 bg-slate-50 border-b border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isCoordinateMode ? "TABLA DE COORDENADAS" : "CLAVE DE SUSTITUCIÓN"}</h3>
          {isKeyExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isKeyExpanded && (
          <div className="p-4 overflow-x-auto">
             {isCoordinateMode ? (
                <div className="min-w-max mx-auto flex justify-center">
                     {isSandwichMode ? (
                       <table className="border-collapse border-2 border-slate-800">
                          <tbody>
                            <tr>
                              <td className="w-10 h-10 bg-blue-300 border border-slate-800 font-bold text-center">A</td>
                              {Array.from({length: 14}, (_, i) => i + 1).map(col => (<td key={`A${col}`} className="w-10 h-10 text-center border border-slate-800 font-bold bg-white">{getLetterAtCoordinate('A', col)}</td>))}
                            </tr>
                            <tr>
                              <td className="w-10 h-8 bg-slate-200 border border-slate-800"></td>
                              {Array.from({length: 14}, (_, i) => i + 1).map(col => (<td key={`Num${col}`} className="w-10 h-8 text-center border border-slate-800 text-xs font-bold text-slate-600 bg-slate-200">{col}</td>))}
                            </tr>
                            <tr>
                              <td className="w-10 h-10 bg-blue-300 border border-slate-800 font-bold text-center">D</td>
                              {Array.from({length: 14}, (_, i) => i + 1).map(col => (<td key={`D${col}`} className="w-10 h-10 text-center border border-slate-800 font-bold bg-white">{getLetterAtCoordinate('D', col)}</td>))}
                            </tr>
                          </tbody>
                       </table>
                     ) : (
                       <table className="border-separate border-spacing-1">
                         <thead><tr><th></th>{[1,2,3,4,5,6,7,8,9].map(n => (<th key={n} className="text-[10px] text-slate-400 pb-1">{n}</th>))}</tr></thead>
                         <tbody>{COORDINATE_ROWS.map(row => (<tr key={row}><td className="w-7 h-7 bg-slate-700 text-white text-xs font-bold text-center rounded-sm">{row}</td>{[1,2,3,4,5,6,7,8,9].map(col => (<td key={`${row}${col}`} className="w-8 h-8 bg-slate-50 border border-slate-200 text-center text-xs font-bold rounded-sm">{getLetterAtCoordinate(row, col)}</td>))}</tr>))}</tbody>
                       </table>
                     )}
                </div>
             ) : (
                <div className="flex flex-wrap justify-center gap-2">
                    {ALPHABET_SPANISH.map(char => (<div key={char} className="flex flex-col items-center bg-slate-50 p-1.5 rounded border border-slate-100 min-w-[2.5rem]"><span className="text-[10px] text-slate-400 mb-1">{char}</span><span className="font-bold text-lg text-indigo-800">{cipherKey[char]}</span></div>))}
                </div>
             )}
          </div>
        )}
      </div>

      <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-200 min-h-[300px]">
        <div className="flex flex-wrap gap-x-6 gap-y-10 justify-center">
        {puzzleData.map((word, wIdx) => (
            <div key={wIdx} className="flex flex-wrap gap-1">
            {word.chars.map((charData) => {
                const isSelected = selectedCell === charData.id;
                const hasGuess = !!guesses[charData.id];
                return (
                <div key={charData.id} className="flex flex-col items-center relative">
                    {tildeAssistant && charData.hasTilde && (
                        <div className="absolute -top-4 text-indigo-500 font-bold text-2xl select-none animate-pulse">´</div>
                    )}
                    <div className={`font-bold text-indigo-900 mb-1 h-6 flex items-end justify-center select-none ${isCoordinateMode ? 'text-xs w-10 md:w-12' : 'text-xl w-8'}`}>{charData.encoded}</div>
                    {charData.isPuzzle ? (
                        <input
                            type="text"
                            value={guesses[charData.id] || ''}
                            maxLength={1}
                            onFocus={() => setSelectedCell(charData.id)}
                            onChange={(e) => handleInputChange(charData.id, e.target.value)}
                            className={`text-center font-bold text-xl uppercase transition-all ${isCoordinateMode ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'} border-2 rounded-md outline-none shadow-sm ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300'} ${hasGuess ? 'bg-slate-50' : 'bg-white'} ${hasGuess && guesses[charData.id] === charData.original ? 'text-emerald-600 border-emerald-200' : 'text-slate-800'}`}
                        />
                    ) : (
                        <div className={`flex items-center justify-center font-bold text-slate-800 ${isCoordinateMode ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`}>{charData.original}</div>
                    )}
                </div>
                );
            })}
            </div>
        ))}
        </div>
      </div>
    </div>
  );
};
