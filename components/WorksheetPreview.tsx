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
  
  const words = text.toUpperCase().trim().split(/\s+/);

  const getLetterAtCoordinate = (row: string, col: number) => {
    const coord = `${row}${col}`;
    return Object.keys(cipherKey).find(key => cipherKey[key] === coord) || "";
  };

  // Parámetros de escalado dinámico optimizados para impresión
  const boxSize = fontSize * 1.6; 
  const symbolContainerHeight = fontSize * 1.2; 
  const intraCellGap = fontSize * 0.7; 
  const tildeOffset = fontSize * 0.5;

  // Medida A4 estándar y límite de seguridad
  const PAGE_HEIGHT_MM = 297;
  const PAGE_LIMIT_INDICATOR_MM = 287; 

  return (
    <div 
      id={id} 
      className="bg-white shadow-none w-[210mm] mx-auto flex flex-col font-sans relative"
      style={{ 
        boxSizing: 'border-box', 
        minHeight: id === "worksheet-to-export" ? 'auto' : `${PAGE_HEIGHT_MM}mm`,
        paddingBottom: '40px'
      }}
    >
      {/* Guía visual de salto de página (No imprimible) - POSICIONADA EN LA LÍNEA DE CORTE */}
      <div 
        className="absolute left-0 w-full flex items-center no-print z-50 pointer-events-none select-none" 
        style={{ top: `${PAGE_LIMIT_INDICATOR_MM}mm` }}
        data-html2canvas-ignore="true"
      >
        <div className="flex-grow border-t-2 border-dashed border-red-600"></div>
        <div className="px-4 py-1 bg-white border-2 border-red-600 rounded-full shadow-md mx-2">
          <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap">
            Cambio de página
          </span>
        </div>
        <div className="flex-grow border-t-2 border-dashed border-red-600"></div>
      </div>

      {/* SECCIÓN CABECERA */}
      <div id={`${id}-header`} className="p-10 pb-4 bg-white w-full flex-shrink-0">
        <div className="mb-6 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-wider uppercase">Criptograma</h1>
            <p className="text-slate-500 text-[10px] mt-1 font-medium">
              {hideKey 
                ? "Desafío experto: Descifra el mensaje oculto sin la clave de ayuda."
                : (isCoordinateMode 
                  ? "Localiza las coordenadas en la tabla para descifrar el mensaje secreto." 
                  : "Utiliza la clave de sustitución para descubrir el mensaje oculto.")
              }
            </p>
          </div>
          <div className="text-right">
             <div className="w-40 h-5 border-b border-slate-400 mb-1"></div>
             <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Estudiante / Fecha</span>
          </div>
        </div>

        {!hideKey && (
          <div className="mb-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-5 text-center tracking-[0.3em]">
              {isCoordinateMode ? "TABLA DE REFERENCIA" : "CLAVE DE SUSTITUCIÓN"}
            </h3>
            
            <div className="flex justify-center">
              {isCoordinateMode ? (
                <div className="overflow-x-auto py-1">
                   {isSandwichMode ? (
                     <div className="min-w-max border-2 border-slate-800 bg-white rounded-sm overflow-hidden">
                        <div className="flex border-b-2 border-slate-800">
                           <div className="w-14 h-14 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-lg">A</div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`A${col}`} className="w-11 h-14 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-xl font-bold text-slate-800">
                                   {getLetterAtCoordinate('A', col)}
                               </div>
                           ))}
                        </div>
                        <div className="flex border-b border-slate-300 bg-slate-100/50">
                           <div className="w-14 h-6 bg-white border-r-2 border-slate-800"></div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`Num${col}`} className="w-11 h-6 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-[10px] font-black text-slate-400">
                                   {col}
                               </div>
                           ))}
                        </div>
                        <div className="flex">
                           <div className="w-14 h-14 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-lg">D</div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`D${col}`} className="w-11 h-14 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-xl font-bold text-slate-800">
                                   {getLetterAtCoordinate('D', col)}
                               </div>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="min-w-max">
                       <div className="flex mb-1">
                         <div className="w-14"></div>
                         {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                           <div key={num} className="w-14 text-center font-bold text-[10px] text-slate-400 mx-0.5">{num}</div>
                         ))}
                       </div>
                       {COORDINATE_ROWS.map((rowLabel) => (
                         <div key={rowLabel} className="flex mb-1">
                           <div className="w-14 h-14 flex items-center justify-center font-bold text-white bg-slate-800 rounded-sm mr-1 text-lg">{rowLabel}</div>
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                             <div key={`${rowLabel}${col}`} className="w-14 h-14 flex items-center justify-center bg-white border border-slate-300 rounded-sm font-bold text-slate-800 text-2xl mx-0.5">
                               {getLetterAtCoordinate(rowLabel, col)}
                             </div>
                           ))}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              ) : (
                <div className="grid grid-cols-9 gap-3 justify-center max-w-5xl w-full">
                  {ALPHABET_SPANISH.map((char) => (
                    <div key={char} className="flex flex-col items-center border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden min-w-[75px]">
                      <div className="w-full text-center text-[11px] font-black text-indigo-600 border-b border-slate-100 bg-indigo-50/50 py-2 uppercase">{char}</div>
                      <div className="w-full text-center font-bold text-slate-800 text-3xl py-3 h-16 flex items-center justify-center leading-none">
                        {cipherKey[char]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN CUERPO */}
      <div id={`${id}-body`} className="px-10 py-10 bg-white w-full">
        <div 
          className="flex flex-wrap justify-start items-start" 
          style={{ 
            gap: `${lineSpacing}px ${fontSize * 1.2}px`,
            lineHeight: '1'
          }}
        >
          {words.map((word, wIdx) => (
            <div key={wIdx} className="flex flex-wrap" style={{ gap: `${fontSize * 0.5}px` }}>
              {word.split('').map((char, cIdx) => {
                const encodedChar = getSymbolForChar(char, cipherKey);
                const isPuzzlePiece = /^[A-ZÑÁÉÍÓÚÜ]$/i.test(char);
                const hasTilde = isAccented(char);

                return (
                  <div 
                    key={cIdx} 
                    className="flex flex-col items-center relative" 
                    style={{ 
                      width: `${boxSize}px`,
                      boxSizing: 'border-box'
                    }}
                  >
                    {tildeAssistant && hasTilde && (
                        <div 
                          className="absolute text-indigo-500 font-bold leading-none select-none z-10 text-center w-full"
                          style={{ top: `-${tildeOffset}px`, fontSize: `${fontSize * 1.2}px` }}
                        >´</div>
                    )}
                    
                    {/* 1. Contenedor del Símbolo */}
                    <div 
                      className="flex items-center justify-center leading-none overflow-visible"
                      style={{ 
                        height: `${symbolContainerHeight}px`, 
                        width: '100%',
                        fontSize: isCoordinateMode ? `${fontSize * 0.75}px` : `${fontSize}px`
                      }}
                    >
                      <span className="text-slate-900 font-bold text-center block w-full leading-none">
                        {encodedChar}
                      </span>
                    </div>

                    {/* 2. ESPACIADOR FÍSICO */}
                    <div style={{ height: `${intraCellGap}px`, width: '1px' }}></div>

                    {/* 3. Contenedor de la Casilla */}
                    <div className="flex-shrink-0">
                      {isPuzzlePiece ? (
                        <div 
                          className="border-[2.5px] border-slate-300 rounded-2xl bg-white"
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN PIE DE PÁGINA */}
      <div id={`${id}-footer`} className="p-10 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-300 text-[8px] font-bold tracking-widest uppercase italic bg-white w-full flex-shrink-0">
        <span>&copy; NeuroCripto App</span>
        <span>Material Adaptado para Lectoescritura</span>
        <span>Neurocripto.io</span>
      </div>
    </div>
  );
};