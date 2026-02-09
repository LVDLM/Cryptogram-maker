import React from 'react';
import { CipherKey } from '../types';
import { ALPHABET_SPANISH, COORDINATE_ROWS } from '../constants';
import { getSymbolForChar, isAccented } from '../utils/cipherUtils';

interface WorksheetPreviewProps {
  text: string;
  cipherKey: CipherKey;
  tildeAssistant: boolean;
  fontSize: number;
  lineSpacing: number;
  hideKey?: boolean;
  id?: string;
}

export const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ 
  text, 
  cipherKey, 
  tildeAssistant, 
  fontSize, 
  lineSpacing, 
  hideKey = false,
  id = "preview" 
}) => {
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

  // Escalar tamaños basados en el fontSize base
  const boxSize = fontSize * 1.5; // Relación proporcional para las casillas
  const symbolFontSize = fontSize;
  const tildeOffset = fontSize * 0.4;

  return (
    <div 
      id={id} 
      className="bg-white p-10 md:p-14 shadow-none w-full max-w-[210mm] mx-auto flex flex-col font-sans h-auto min-h-[297mm]"
      style={{ boxSizing: 'border-box', overflow: 'hidden' }}
    >
      <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-wider uppercase">Criptograma</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {hideKey 
              ? "Desafío experto: Descifra el mensaje oculto sin la clave de ayuda."
              : (isCoordinateMode 
                ? "Instrucciones: Localiza las coordenadas en la tabla para descifrar el mensaje secreto." 
                : "Instrucciones: Utiliza la clave de sustitución para descubrir el mensaje oculto.")
            }
          </p>
        </div>
        <div className="text-right">
           <div className="w-48 h-6 border-b border-slate-400 mb-1"></div>
           <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Estudiante / Fecha</span>
        </div>
      </div>

      {/* Clave de Referencia - Condicional */}
      {!hideKey && (
        <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-[0.2em]">
            {isCoordinateMode ? "TABLA DE REFERENCIA" : "CLAVE DE SUSTITUCIÓN"}
          </h3>
          
          {isCoordinateMode ? (
            <div className="overflow-x-auto flex justify-center py-2">
              {isSandwichMode ? (
                <div className="min-w-max border-2 border-slate-800 bg-white shadow-md rounded-sm overflow-hidden">
                   <div className="flex border-b-2 border-slate-800">
                      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-sm">A</div>
                      {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                          <div key={`A${col}`} className="w-8 h-10 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-base font-bold text-slate-800">
                              {getLetterAtCoordinate('A', col)}
                          </div>
                      ))}
                   </div>
                   <div className="flex border-b border-slate-300 bg-slate-100/50">
                      <div className="w-10 h-6 bg-white border-r-2 border-slate-800"></div>
                      {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                          <div key={`Num${col}`} className="w-8 h-6 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-[10px] font-black text-slate-400">
                              {col}
                          </div>
                      ))}
                   </div>
                   <div className="flex">
                      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-sm">D</div>
                      {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                          <div key={`D${col}`} className="w-8 h-10 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-base font-bold text-slate-800">
                              {getLetterAtCoordinate('D', col)}
                          </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="min-w-max">
                  <div className="flex mb-1">
                    <div className="w-10"></div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <div key={num} className="w-10 text-center font-bold text-[10px] text-slate-400 mx-0.5">{num}</div>
                    ))}
                  </div>
                  {COORDINATE_ROWS.map((rowLabel) => (
                    <div key={rowLabel} className="flex mb-1">
                      <div className="w-10 h-10 flex items-center justify-center font-bold text-white bg-slate-800 rounded-sm mr-1 text-sm">{rowLabel}</div>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                        <div key={`${rowLabel}${col}`} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-300 rounded-sm font-bold text-slate-800 text-lg mx-0.5">
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
                <div key={char} className="flex flex-col items-center border border-slate-200 bg-white w-9 shadow-sm rounded-lg overflow-hidden">
                  <div className="w-full text-center text-[10px] font-black text-indigo-600 border-b border-slate-100 bg-indigo-50/30 py-1">{char}</div>
                  <div className="w-full text-center font-bold text-slate-800 text-xl py-1.5 h-10 flex items-center justify-center">{cipherKey[char]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Criptograma */}
      <div className="flex-grow flex flex-col pt-4">
        <div 
          className="flex flex-wrap justify-start items-start" 
          style={{ gap: `${lineSpacing}px ${fontSize * 1.5}px` }}
        >
          {words.map((word, wIdx) => (
            <div key={wIdx} className="flex flex-wrap" style={{ gap: `${fontSize * 0.2}px` }}>
              {word.split('').map((char, cIdx) => {
                const encodedChar = getSymbolForChar(char, cipherKey);
                const isPuzzlePiece = /^[A-ZÑÁÉÍÓÚÜ]$/i.test(char);
                const hasTilde = isAccented(char);

                return (
                  <div key={cIdx} className="flex flex-col items-center relative">
                    {tildeAssistant && hasTilde && (
                        <div 
                          className="absolute text-indigo-500 font-bold leading-none select-none"
                          style={{ top: `-${tildeOffset}px`, fontSize: `${fontSize * 0.8}px` }}
                        >´</div>
                    )}
                    <div 
                      className="font-bold text-slate-900 mb-2 flex items-end justify-center"
                      style={{ 
                        height: `${fontSize}px`, 
                        width: `${boxSize}px`,
                        fontSize: isCoordinateMode ? `${fontSize * 0.6}px` : `${symbolFontSize}px`
                      }}
                    >
                      {encodedChar}
                    </div>
                    {isPuzzlePiece ? (
                      <div 
                        className="border-2 border-slate-400 rounded-xl bg-white shadow-sm"
                        style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
                      ></div>
                    ) : (
                      <div 
                        className="flex items-center justify-center font-bold text-slate-800"
                        style={{ width: `${boxSize}px`, height: `${boxSize}px`, fontSize: `${fontSize}px` }}
                      >
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

      <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center text-slate-300 text-[9px] font-bold tracking-widest uppercase italic">
        <span>&copy; NeuroCripto App</span>
        <span>Material Adaptado para Lectoescritura</span>
        <span>Neurocripto.io</span>
      </div>
    </div>
  );
};