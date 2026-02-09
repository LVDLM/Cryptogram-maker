import React, { useMemo } from 'react';
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
  
  // Constantes de diseño (en mm para precisión de impresión)
  const PAGE_WIDTH_MM = 210;
  const PAGE_LIMIT_MM = 287; // Línea roja
  const HORIZONTAL_PADDING_MM = 20; // 10mm cada lado (px approx)
  const AVAILABLE_WIDTH_MM = PAGE_WIDTH_MM - (HORIZONTAL_PADDING_MM);

  // Convertimos unidades de fuente a mm aproximados (1px ≈ 0.264mm)
  const pxToMm = (px: number) => px * 0.264583;
  
  const boxSizeMm = pxToMm(fontSize * 1.6);
  const charGapMm = pxToMm(fontSize * 0.5);
  const rowHeightMm = pxToMm(fontSize * 1.2 + fontSize * 0.7 + fontSize * 1.6) + pxToMm(lineSpacing);

  // Estimación de alturas de secciones fijas
  const headerHeightMm = hideKey ? 35 : (isCoordinateMode ? (isSandwichMode ? 75 : 85) : 75);
  const footerHeightMm = 20;

  // LÓGICA DE PAGINACIÓN Y LÍNEAS
  const paginatedLines = useMemo(() => {
    const words = text.toUpperCase().trim().split(/\s+/);
    const lines: any[][] = [];
    let currentLine: any[] = [];
    let currentLineWidth = 0;

    // 1. Agrupar palabras en líneas físicas basadas en el ancho
    words.forEach(word => {
      const wordChars = word.split('');
      const wordWidth = wordChars.length * boxSizeMm + (wordChars.length - 1) * charGapMm;
      const spaceWidth = charGapMm * 2; // Espacio entre palabras

      if (currentLineWidth + wordWidth > AVAILABLE_WIDTH_MM && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [word];
        currentLineWidth = wordWidth;
      } else {
        currentLine.push(word);
        currentLineWidth += (currentLine.length > 1 ? spaceWidth : 0) + wordWidth;
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);

    // 2. Distribuir líneas en bloques de "página"
    const pages: any[][] = [[]];
    let currentY = headerHeightMm;

    lines.forEach(line => {
      if (currentY + rowHeightMm > PAGE_LIMIT_MM - footerHeightMm) {
        pages.push([line]);
        currentY = headerHeightMm + rowHeightMm; // En export PDF el header se repite
      } else {
        pages[pages.length - 1].push(line);
        currentY += rowHeightMm;
      }
    });

    return pages;
  }, [text, fontSize, lineSpacing, isCoordinateMode, isSandwichMode, hideKey]);

  const getLetterAtCoordinate = (row: string, col: number) => {
    const coord = `${row}${col}`;
    return Object.keys(cipherKey).find(key => cipherKey[key] === coord) || "";
  };

  return (
    <div 
      id={id} 
      className="bg-white shadow-none w-[210mm] mx-auto flex flex-col font-sans relative"
      style={{ boxSizing: 'border-box' }}
    >
      {/* SECCIÓN CABECERA (Solo se muestra una vez en la previsualización del editor) */}
      <div id={`${id}-header`} className="p-10 pb-4 bg-white w-full flex-shrink-0">
        <div className="mb-6 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-wider uppercase">Criptograma</h1>
            <p className="text-slate-500 text-[10px] mt-1 font-medium italic">
              Desarrollado para la estimulación cognitiva y lectoescritura.
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
                     <div className="min-w-max border-2 border-slate-800 bg-white rounded-sm overflow-hidden scale-90">
                        <div className="flex border-b-2 border-slate-800">
                           <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-lg">A</div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`A${col}`} className="w-10 h-12 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-lg font-bold text-slate-800">
                                   {getLetterAtCoordinate('A', col)}
                               </div>
                           ))}
                        </div>
                        <div className="flex border-b border-slate-300 bg-slate-100/50">
                           <div className="w-12 h-5 bg-white border-r-2 border-slate-800"></div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`Num${col}`} className="w-10 h-5 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-[9px] font-black text-slate-400">
                                   {col}
                               </div>
                           ))}
                        </div>
                        <div className="flex">
                           <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 font-bold text-indigo-900 border-r-2 border-slate-800 text-lg">D</div>
                           {Array.from({length: 14}, (_, i) => i + 1).map(col => (
                               <div key={`D${col}`} className="w-10 h-12 flex items-center justify-center border-r border-slate-200 last:border-r-0 text-lg font-bold text-slate-800">
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

      {/* CUERPO PAGINADO */}
      <div id={`${id}-body`} className="w-full flex flex-col">
        {paginatedLines.map((pageLines, pIdx) => (
          <React.Fragment key={`p-${pIdx}`}>
            {/* Contenedor de líneas para esta página */}
            <div className="px-10 py-4 flex flex-col" style={{ gap: `${lineSpacing}px` }}>
              {pageLines.map((line, lIdx) => (
                <div key={`l-${lIdx}`} className="flex flex-wrap" style={{ gap: `${fontSize * 1.0}px` }}>
                  {line.map((word: string, wIdx: number) => (
                    <div key={`word-${wIdx}`} className="flex" style={{ gap: `${fontSize * 0.5}px` }}>
                      {word.split('').map((char, cIdx) => {
                        const encodedChar = getSymbolForChar(char, cipherKey);
                        const isPuzzlePiece = /^[A-ZÑÁÉÍÓÚÜ]$/i.test(char);
                        const hasTilde = isAccented(char);
                        
                        return (
                          <div 
                            key={`char-${cIdx}`} 
                            className="flex flex-col items-center relative" 
                            style={{ width: `${fontSize * 1.6}px` }}
                          >
                            {tildeAssistant && hasTilde && (
                                <div 
                                  className="absolute text-indigo-500 font-bold leading-none select-none text-center w-full"
                                  style={{ top: `-${fontSize * 0.5}px`, fontSize: `${fontSize * 1.2}px` }}
                                >´</div>
                            )}
                            <div 
                              className="flex items-center justify-center leading-none mb-[16px]"
                              style={{ height: `${fontSize * 1.2}px`, fontSize: isCoordinateMode ? `${fontSize * 0.75}px` : `${fontSize}px` }}
                            >
                              <span className="text-slate-900 font-bold text-center block w-full">{encodedChar}</span>
                            </div>
                            {isPuzzlePiece ? (
                              <div 
                                className="border-[2.5px] border-slate-300 rounded-2xl bg-white"
                                style={{ width: `${fontSize * 1.6}px`, height: `${fontSize * 1.6}px` }}
                              ></div>
                            ) : (
                              <div 
                                className="flex items-center justify-center font-bold text-slate-800"
                                style={{ width: `${fontSize * 1.6}px`, height: `${fontSize * 1.6}px`, fontSize: `${fontSize}px` }}
                              >{char}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Indicador de cambio de página (No se muestra después de la última página) */}
            {pIdx < paginatedLines.length - 1 && (
              <div 
                className="w-full flex items-center no-print z-50 pointer-events-none select-none my-4" 
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
            )}
          </React.Fragment>
        ))}
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