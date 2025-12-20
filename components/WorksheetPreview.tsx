
import React from 'react';
import { CipherKey } from '../types';
import { ALPHABET_SPANISH, COORDINATE_ROWS } from '../constants';

interface WorksheetPreviewProps {
  text: string;
  cipherKey: CipherKey;
  id?: string;
}

export const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ text, cipherKey, id = "preview" }) => {
  // Detect modes
  const isCoordinateMode = (Object.values(cipherKey) as string[]).some(val => val.length >= 2 && /\d/.test(val));
  // Check specifically for the Rows A/D mode by checking max column number > 9 or looking at row letters
  const maxCol = (Object.values(cipherKey) as string[]).reduce((max, val) => {
      const match = val.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0])) : max;
  }, 0);
  const isSandwichMode = isCoordinateMode && maxCol > 9;
  
  const words = text.toUpperCase().split(' ');

  const getLetterAtCoordinate = (row: string, col: number) => {
    const coord = `${row}${col}`;
    return Object.keys(cipherKey).find(key => cipherKey[key] === coord) || "";
  };

  return (
    <div 
      id={id} 
      className="bg-white p-8 md:p-12 shadow-lg w-full max-w-4xl mx-auto min-h-[600px] flex flex-col font-sans"
    >
      <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-wider">CRIPTOGRAMA</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isCoordinateMode 
              ? "Busca las coordenadas en la tabla para descifrar el mensaje." 
              : "Descifra el mensaje oculto utilizando la clave."}
          </p>
        </div>
        <div className="text-right">
           <div className="w-32 h-8 border-b border-slate-400 mb-1"></div>
           <span className="text-xs text-slate-400 uppercase">Nombre</span>
        </div>
      </div>

      {/* The Key Legend */}
      <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center tracking-widest">
          {isCoordinateMode ? "Tabla de Coordenadas" : "Clave de Sustitución"}
        </h3>
        
        {isCoordinateMode ? (
          <div className="overflow-x-auto">
            {isSandwichMode ? (
              // SANDWICH MODE (Rows A-D, Numbers in middle)
              <div className="min-w-max mx-auto border-2 border-slate-800 bg-white">
                 {/* Row A */}
                 <div className="flex border-b border-slate-300">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-300 font-bold text-slate-900 border-r border-slate-800">A</div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`A${col}`} className="w-10 h-10 flex items-center justify-center border-r border-slate-300 last:border-r-0 text-lg font-bold text-slate-800">
                            {getLetterAtCoordinate('A', col)}
                        </div>
                    ))}
                 </div>
                 {/* Numbers Row */}
                 <div className="flex border-b border-slate-300 bg-slate-100">
                    <div className="w-10 h-8 bg-white border-r border-slate-800"></div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`Num${col}`} className="w-10 h-8 flex items-center justify-center border-r border-slate-300 last:border-r-0 text-sm font-bold text-slate-500">
                            {col}
                        </div>
                    ))}
                 </div>
                 {/* Row D */}
                 <div className="flex">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-300 font-bold text-slate-900 border-r border-slate-800">D</div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`D${col}`} className="w-10 h-10 flex items-center justify-center border-r border-slate-300 last:border-r-0 text-lg font-bold text-slate-800">
                            {getLetterAtCoordinate('D', col)}
                        </div>
                    ))}
                 </div>
              </div>
            ) : (
              // STANDARD GRID MODE (3x9)
              <div className="min-w-max mx-auto">
                {/* Header Numbers */}
                <div className="flex mb-2">
                  <div className="w-10"></div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <div key={num} className="w-10 md:w-12 text-center font-bold text-slate-400 bg-slate-200 rounded mx-1">
                      {num}
                    </div>
                  ))}
                </div>
                {COORDINATE_ROWS.map((rowLabel) => (
                  <div key={rowLabel} className="flex mb-2">
                    <div className="w-10 h-10 md:h-12 flex items-center justify-center font-bold text-white bg-slate-800 rounded mr-1">
                      {rowLabel}
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                      <div key={`${rowLabel}${col}`} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border-2 border-slate-300 rounded font-bold text-slate-800 text-lg mx-1 shadow-sm">
                        {getLetterAtCoordinate(rowLabel, col)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHABET_SPANISH.map((char) => (
              <div key={char} className="flex flex-col items-center border border-slate-300 bg-white w-8 md:w-10">
                <div className="w-full text-center text-xs md:text-sm text-slate-400 border-b border-slate-200 bg-slate-100 py-1">
                  {char}
                </div>
                <div className="w-full text-center font-bold text-slate-800 text-base md:text-lg py-1 h-8 md:h-10 flex items-center justify-center">
                  {cipherKey[char]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The Puzzle */}
      <div className="flex-grow flex flex-col justify-center gap-y-12">
        <div className="flex flex-wrap gap-x-8 gap-y-8 leading-loose">
          {words.map((word, wIdx) => (
            <div key={wIdx} className="flex flex-wrap gap-1 md:gap-2">
              {word.split('').map((char, cIdx) => {
                const encodedChar = cipherKey[char] || char;
                const isPuzzlePiece = !!cipherKey[char];

                return (
                  <div key={cIdx} className="flex flex-col items-center">
                     {/* The Encoded Symbol/Coordinate */}
                    <div className={`font-bold text-indigo-900 mb-1 h-8 flex items-end justify-center ${isCoordinateMode ? 'text-sm md:text-base w-10 md:w-12' : 'text-2xl md:text-3xl w-8'}`}>
                      {encodedChar}
                    </div>
                    {/* The Input Box */}
                    {isPuzzlePiece ? (
                      <div className={`border-2 border-slate-400 rounded-md bg-white ${isCoordinateMode ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`}></div>
                    ) : (
                      <div className={`flex items-center justify-center font-bold text-slate-800 ${isCoordinateMode ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`}>
                        {char}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-slate-300 text-xs">
        Generado con NeuroCripto
      </div>
    </div>
  );
};
