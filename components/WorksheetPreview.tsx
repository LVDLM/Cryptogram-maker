
import React from 'react';
import { CipherKey } from '../types';
import { ALPHABET_SPANISH, COORDINATE_ROWS } from '../constants';
import { getSymbolForChar, isAccented } from '../utils/cipherUtils';

interface WorksheetPreviewProps {
  text: string;
  cipherKey: CipherKey;
  tildeAssistant: boolean;
  id?: string;
}

export const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ text, cipherKey, tildeAssistant, id = "preview" }) => {
  const isCoordinateMode = (Object.values(cipherKey) as string[]).some(val => val.length >= 2 && /\d/.test(val));
  const maxCol = (Object.values(cipherKey) as string[]).reduce((max, val) => {
      const match = val.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0])) : max;
  }, 0);
  const isSandwichMode = isCoordinateMode && maxCol > 9;
  
  const words = text.toUpperCase().split(/\s+/);

  const getLetterAtCoordinate = (row: string, col: number) => {
    const coord = `${row}${col}`;
    return Object.keys(cipherKey).find(key => cipherKey[key] === coord) || "";
  };

  return (
    <div 
      id={id} 
      className="bg-white p-8 md:p-12 shadow-none w-full max-w-4xl mx-auto flex flex-col font-sans h-auto"
    >
      <div className="mb-6 border-b-2 border-slate-800 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wider">CRIPTOGRAMA</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {isCoordinateMode 
              ? "Busca las coordenadas en la tabla para descifrar el mensaje." 
              : "Descifra el mensaje oculto utilizando la clave."}
          </p>
        </div>
        <div className="text-right">
           <div className="w-32 h-6 border-b border-slate-400 mb-1"></div>
           <span className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</span>
        </div>
      </div>

      {/* Clave de Referencia - Más compacta */}
      <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center tracking-widest">
          {isCoordinateMode ? "TABLA DE REFERENCIA" : "CLAVE DE SUSTITUCIÓN"}
        </h3>
        
        {isCoordinateMode ? (
          <div className="overflow-x-auto flex justify-center">
            {isSandwichMode ? (
              <div className="min-w-max border border-slate-800 bg-white">
                 <div className="flex border-b border-slate-300">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 font-bold text-slate-900 border-r border-slate-800 text-xs">A</div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`A${col}`} className="w-7 h-8 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-sm font-bold text-slate-800">
                            {getLetterAtCoordinate('A', col)}
                        </div>
                    ))}
                 </div>
                 <div className="flex border-b border-slate-300 bg-slate-50">
                    <div className="w-8 h-6 bg-white border-r border-slate-800"></div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`Num${col}`} className="w-7 h-6 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-[10px] font-bold text-slate-400">
                            {col}
                        </div>
                    ))}
                 </div>
                 <div className="flex">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 font-bold text-slate-900 border-r border-slate-800 text-xs">D</div>
                    {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                        <div key={`D${col}`} className="w-7 h-8 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-sm font-bold text-slate-800">
                            {getLetterAtCoordinate('D', col)}
                        </div>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="min-w-max">
                <div className="flex mb-1">
                  <div className="w-8"></div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <div key={num} className="w-8 text-center font-bold text-[10px] text-slate-400 mx-0.5">{num}</div>
                  ))}
                </div>
                {COORDINATE_ROWS.map((rowLabel) => (
                  <div key={rowLabel} className="flex mb-1">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-slate-800 rounded-sm mr-1 text-xs">{rowLabel}</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                      <div key={`${rowLabel}${col}`} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-sm font-bold text-slate-800 text-sm mx-0.5">
                        {getLetterAtCoordinate(rowLabel, col)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-1">
            {ALPHABET_SPANISH.map((char) => (
              <div key={char} className="flex flex-col items-center border border-slate-200 bg-white w-7">
                <div className="w-full text-center text-[9px] text-slate-400 border-b border-slate-100 bg-slate-50 py-0.5">{char}</div>
                <div className="w-full text-center font-bold text-slate-800 text-sm py-1 h-7 flex items-center justify-center">{cipherKey[char]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Criptograma - Área de Juego Compacta */}
      <div className="flex-grow flex flex-col pt-2">
        <div className="flex flex-wrap gap-x-10 gap-y-12 leading-relaxed">
          {words.map((word, wIdx) => (
            <div key={wIdx} className="flex flex-wrap gap-1.5">
              {word.split('').map((char, cIdx) => {
                const encodedChar = getSymbolForChar(char, cipherKey);
                const isPuzzlePiece = /^[A-ZÑÁÉÍÓÚÜ]$/i.test(char);
                const hasTilde = isAccented(char);

                return (
                  <div key={cIdx} className="flex flex-col items-center relative">
                    {tildeAssistant && hasTilde && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-indigo-500 font-bold text-lg leading-none select-none">´</div>
                    )}
                    <div className={`font-bold text-slate-900 mb-1.5 h-7 flex items-center justify-center ${isCoordinateMode ? 'text-[11px] w-9' : 'text-xl w-7'}`}>
                      {encodedChar}
                    </div>
                    {isPuzzlePiece ? (
                      <div className={`border border-slate-400 rounded-sm bg-white shadow-sm ${isCoordinateMode ? 'w-9 h-9' : 'w-7 h-7'}`}></div>
                    ) : (
                      <div className={`flex items-center justify-center font-bold text-slate-800 ${isCoordinateMode ? 'w-9 h-9' : 'w-7 h-7'}`}>
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

      <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-300 text-[10px] italic">
        NeuroCripto - Adaptaciones para la Lectoescritura
      </div>
    </div>
  );
};
