
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Puzzle, 
  Settings, 
  Download, 
  Save, 
  Library, 
  RefreshCw, 
  Wand2, 
  Type, 
  Globe2, 
  Smile,
  Grid3X3,
  PlayCircle,
  Rows3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

import { CipherKey, CipherMode, SavedCryptogram, ViewState } from './types';
import { INITIAL_TEXT } from './constants';
import { generateKey, sanitizeFilename } from './utils/cipherUtils';
import { generatePracticeText } from './services/geminiService';
import { KeyEditor } from './components/KeyEditor';
import { WorksheetPreview } from './components/WorksheetPreview';
import { InteractivePlayer } from './components/InteractivePlayer';

const STORAGE_KEY = 'neurocripto_saved_puzzles';
const WARNING_KEY = 'neurocripto_storage_warning_seen';

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.EDITOR);
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [mode, setMode] = useState<CipherMode>('SYMBOLS');
  const [cipherKey, setCipherKey] = useState<CipherKey>({});
  const [savedItems, setSavedItems] = useState<SavedCryptogram[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyEditor, setShowKeyEditor] = useState(false);
  const [showStorageWarning, setShowStorageWarning] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedItems(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored puzzles", e);
      }
    }
    regenerateKey(mode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  const regenerateKey = (selectedMode: CipherMode) => {
    const newKey = generateKey(selectedMode);
    setCipherKey(newKey);
    setMode(selectedMode);
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    const result = await generatePracticeText(aiTopic);
    setText(result);
    setIsGenerating(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('worksheet-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`criptograma_${sanitizeFilename(text)}.pdf`);
    } catch (err) {
      console.error("Error creating PDF", err);
      alert("Hubo un error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  const executeSave = () => {
    const newItem: SavedCryptogram = {
      id: Date.now().toString(),
      title: text.slice(0, 20) + (text.length > 20 ? '...' : ''),
      originalText: text,
      cipherKey: { ...cipherKey },
      mode,
      createdAt: Date.now()
    };
    setSavedItems([newItem, ...savedItems]);
    setView(ViewState.LIBRARY);
    setShowStorageWarning(false);
  };

  const handleSaveToLibrary = () => {
    const hasSeenWarning = localStorage.getItem(WARNING_KEY);
    
    if (!hasSeenWarning) {
      setShowStorageWarning(true);
    } else {
      executeSave();
    }
  };

  const confirmFirstSave = () => {
    localStorage.setItem(WARNING_KEY, 'true');
    executeSave();
  };

  const loadFromLibrary = (item: SavedCryptogram) => {
    setText(item.originalText);
    setCipherKey(item.cipherKey);
    setMode(item.mode);
    setView(ViewState.EDITOR);
  };

  const deleteFromLibrary = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este criptograma?")) {
      setSavedItems(savedItems.filter(i => i.id !== id));
    }
  };
  
  const playFromLibrary = (item: SavedCryptogram) => {
    loadFromLibrary(item);
    setView(ViewState.PLAYER);
  };

  // Render Logic
  if (view === ViewState.PLAYER) {
    return (
        <div className="min-h-screen bg-slate-100 font-sans py-6 px-4">
            <InteractivePlayer 
                text={text} 
                cipherKey={cipherKey} 
                mode={mode}
                onExit={() => setView(ViewState.EDITOR)} 
            />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.EDITOR)}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">NeuroCripto</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setView(ViewState.EDITOR)}
              className={`px-3 md:px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                view === ViewState.EDITOR ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setView(ViewState.LIBRARY)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                view === ViewState.LIBRARY ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Biblioteca</span>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-1">{savedItems.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === ViewState.LIBRARY ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-800">Criptogramas Guardados</h2>
               <p className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full font-bold">Local Storage Activo</p>
            </div>
            {savedItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-400">No has guardado ningún criptograma todavía.</p>
                <button 
                  onClick={() => setView(ViewState.EDITOR)}
                  className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                  Crear uno nuevo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase">
                        {item.mode === 'COORDINATES_ROWS' ? 'FILAS A-D' : item.mode}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 font-mono bg-slate-50 p-2 rounded flex-grow">
                      {item.originalText}
                    </p>
                    <div className="flex justify-between gap-2 border-t pt-4 border-slate-100 mt-auto">
                      <button 
                        onClick={() => deleteFromLibrary(item.id)}
                        className="text-red-500 text-sm hover:bg-red-50 px-3 py-2 rounded"
                      >
                        Eliminar
                      </button>
                      <div className="flex gap-2">
                        <button 
                            onClick={() => loadFromLibrary(item)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm font-medium px-3 py-2 rounded hover:bg-slate-50"
                        >
                            Editar
                        </button>
                        <button 
                            onClick={() => playFromLibrary(item)}
                            className="bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded hover:bg-indigo-700 flex items-center gap-1"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Jugar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar: Controls */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Text Input Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-indigo-500" />
                  Texto
                </h3>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                  placeholder="Escribe aquí el texto a cifrar..."
                />
                
                {/* AI Generator */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Generar con IA (Gemini)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Tema (ej: espacio, dinosaurios)"
                      className="flex-grow p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiTopic}
                      className="bg-emerald-500 text-white p-2 rounded-md hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cipher Configuration */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  Configuración de Clave
                </h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => regenerateKey('LETTERS')}
                    className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${mode === 'LETTERS' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Type className="w-4 h-4" />
                    Letras
                  </button>
                  <button
                    onClick={() => regenerateKey('SYMBOLS')}
                    className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${mode === 'SYMBOLS' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Smile className="w-4 h-4" />
                    Símbolos
                  </button>
                  <button
                    onClick={() => regenerateKey('COORDINATES')}
                    className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${mode === 'COORDINATES' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Tabla
                  </button>
                  <button
                    onClick={() => regenerateKey('COORDINATES_ROWS')}
                    className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${mode === 'COORDINATES_ROWS' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Rows3 className="w-4 h-4" />
                    Filas A-D
                  </button>
                  <button
                    onClick={() => regenerateKey('CYRILLIC')}
                    className={`col-span-2 p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${mode === 'CYRILLIC' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Globe2 className="w-4 h-4" />
                    Cirílico
                  </button>
                </div>

                <div className="space-y-2">
                   <button 
                    onClick={() => regenerateKey(mode)}
                    className="w-full py-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                   >
                     <RefreshCw className="w-4 h-4" />
                     Regenerar Aleatoriamente
                   </button>
                   
                   {!['COORDINATES', 'COORDINATES_ROWS'].includes(mode) && (
                    <button 
                        onClick={() => setShowKeyEditor(!showKeyEditor)}
                        className="w-full py-2 flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        {showKeyEditor ? 'Ocultar Editor Manual' : 'Editar Clave Manualmente'}
                    </button>
                   )}
                </div>

                {showKeyEditor && !['COORDINATES', 'COORDINATES_ROWS'].includes(mode) && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <KeyEditor currentKey={cipherKey} onKeyChange={setCipherKey} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3">
                 <button 
                  onClick={() => setView(ViewState.PLAYER)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                 >
                   <PlayCircle className="w-5 h-5" />
                   Jugar Ahora (Interactivo)
                 </button>
                 <button 
                  onClick={handleDownloadPDF}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                 >
                   <Download className="w-5 h-5" />
                   Descargar PDF
                 </button>
                 <button 
                  onClick={handleSaveToLibrary}
                  className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                 >
                   <Save className="w-5 h-5" />
                   Guardar en Biblioteca
                 </button>
              </div>

            </div>

            {/* Right Side: Preview */}
            <div className="lg:col-span-8">
              <div className="sticky top-24">
                 <div className="bg-slate-800 rounded-t-xl p-3 flex justify-between items-center text-white px-6">
                    <span className="font-bold text-sm tracking-wide opacity-80">VISTA PREVIA DE IMPRESIÓN</span>
                 </div>
                 <div className="overflow-auto max-h-[calc(100vh-12rem)] rounded-b-xl border border-t-0 border-slate-300 shadow-2xl">
                    <div id="worksheet-preview">
                       <WorksheetPreview text={text} cipherKey={cipherKey} />
                    </div>
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Storage Warning Modal */}
      {showStorageWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-amber-50 p-6 flex items-center gap-4 border-b border-amber-100">
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Sobre el guardado local</h3>
                <p className="text-amber-700 text-sm font-medium">Información importante de la biblioteca</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-slate-600 leading-relaxed">
                Tus criptogramas se guardarán en la memoria de este navegador (<span className="font-mono text-indigo-600 font-bold">LocalStorage</span>). Antes de continuar, ten en cuenta lo siguiente:
              </p>
              
              <div className="grid gap-4">
                <div className="flex gap-3 bg-emerald-50 p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-emerald-800 font-bold text-sm">Ventajas</h4>
                    <ul className="text-xs text-emerald-700 mt-1 space-y-1 list-disc list-inside">
                      <li>Guardado instantáneo sin cuentas.</li>
                      <li>Totalmente gratuito y privado.</li>
                      <li>Disponible aunque no tengas internet.</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3 bg-red-50 p-4 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-bold text-sm">Limitaciones</h4>
                    <ul className="text-xs text-red-700 mt-1 space-y-1 list-disc list-inside">
                      <li>Solo accesible desde este navegador y PC.</li>
                      <li>Si borras el historial o caché, se perderán.</li>
                      <li>No se sincroniza entre tus dispositivos.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={confirmFirstSave}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  Comprendo y deseo guardar
                </button>
                <button 
                  onClick={() => setShowStorageWarning(false)}
                  className="w-full py-3 bg-white text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
