
import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  AlertTriangle,
  Languages,
  Loader2
} from 'lucide-react';

import { CipherKey, CipherMode, SavedCryptogram, ViewState } from './types';
import { INITIAL_TEXT } from './constants';
import { generateKey, sanitizeFilename } from './utils/cipherUtils';
import { generatePracticeText } from './services/geminiService';
import { WorksheetPreview } from './components/WorksheetPreview';
import { InteractivePlayer } from './components/InteractivePlayer';

const STORAGE_KEY = 'neurocripto_saved_puzzles_v2';
const WARNING_KEY = 'neurocripto_storage_warning_seen';

const MODE_NAMES: Record<CipherMode, string> = {
  'LETTERS': 'LETRAS',
  'GREEK': 'GRIEGO',
  'CYRILLIC': 'CIRÍLICO',
  'SYMBOLS': 'SÍMBOLOS',
  'SYMBOLS_HARD': 'SÍMB. DIFÍCIL',
  'COORDINATES': 'COORDENADAS',
  'COORDINATES_ROWS': 'FILAS COORD.'
};

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.EDITOR);
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [mode, setMode] = useState<CipherMode>('SYMBOLS');
  const [cipherKey, setCipherKey] = useState<CipherKey>({});
  const [tildeAssistant, setTildeAssistant] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedCryptogram[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showStorageWarning, setShowStorageWarning] = useState(false);

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
  }, []);

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
    const element = document.getElementById('worksheet-to-export');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = pageWidth / (canvasWidth / 2);
      const imgHeightOnPdf = (canvasHeight / 2) * ratio;
      
      let heightLeft = imgHeightOnPdf;
      let position = 0;
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightOnPdf);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeightOnPdf;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightOnPdf);
        heightLeft -= pageHeight;
      }

      pdf.save(`criptograma_${sanitizeFilename(text)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Hubo un problema al generar el PDF. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  };

  const executeSave = () => {
    const newItem: SavedCryptogram = {
      id: Date.now().toString(),
      title: text.slice(0, 20) + (text.length > 20 ? '...' : ''),
      originalText: text,
      cipherKey: { ...cipherKey },
      mode,
      tildeAssistant,
      createdAt: Date.now()
    };
    setSavedItems([newItem, ...savedItems]);
    setView(ViewState.LIBRARY);
    setShowStorageWarning(false);
  };

  const handleSaveToLibrary = () => {
    const hasSeenWarning = localStorage.getItem(WARNING_KEY);
    if (!hasSeenWarning) setShowStorageWarning(true);
    else executeSave();
  };

  const loadFromLibrary = (item: SavedCryptogram) => {
    setText(item.originalText);
    setCipherKey(item.cipherKey);
    setMode(item.mode);
    setTildeAssistant(item.tildeAssistant || false);
    setView(ViewState.EDITOR);
  };

  if (view === ViewState.PLAYER) {
    return (
        <div className="min-h-screen bg-slate-100 font-sans py-6 px-4">
            <InteractivePlayer 
                text={text} 
                cipherKey={cipherKey} 
                mode={mode}
                tildeAssistant={tildeAssistant}
                onExit={() => setView(ViewState.EDITOR)} 
            />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.EDITOR)}>
            <div className="bg-indigo-600 p-2 rounded-lg"><Puzzle className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">NeuroCripto</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(ViewState.EDITOR)} className={`px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-colors ${view === ViewState.EDITOR ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900'}`}>Editor</button>
            <button onClick={() => setView(ViewState.LIBRARY)} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition-colors ${view === ViewState.LIBRARY ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900'}`}>
              <span>Biblioteca</span>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{savedItems.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {view === ViewState.LIBRARY ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Criptogramas Guardados</h2>
            {savedItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border-dashed border-2 border-slate-200 text-slate-400">Todavía no has guardado ningún trabajo.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter">{MODE_NAMES[item.mode]}</div>
                      {item.tildeAssistant && <div className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-1 rounded uppercase">Tildes</div>}
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 truncate">{item.title}</h3>
                    <p className="text-slate-400 text-xs mb-6 bg-slate-50 p-3 rounded flex-grow font-mono line-clamp-3">"{item.originalText}"</p>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                      <button onClick={() => loadFromLibrary(item)} className="text-slate-500 hover:text-indigo-600 text-xs font-bold px-3 py-2 uppercase">Editar</button>
                      <button onClick={() => {loadFromLibrary(item); setView(ViewState.PLAYER);}} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"><PlayCircle className="w-3.5 h-3.5" /> JUGAR</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Type className="w-4 h-4" /> Texto del mensaje</h3>
                <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700" placeholder="Escribe aquí el mensaje a cifrar..." />
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Tema para la IA..." className="flex-grow p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500" />
                    <button onClick={handleAiGenerate} disabled={isGenerating || !aiTopic} className="bg-emerald-500 text-white p-2.5 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors">{isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}</button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Tipo de Cifrado</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {(['LETTERS', 'SYMBOLS', 'SYMBOLS_HARD', 'GREEK', 'COORDINATES', 'COORDINATES_ROWS'] as CipherMode[]).map((m) => (
                    <button key={m} onClick={() => regenerateKey(m)} className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${mode === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                      {MODE_NAMES[m]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 mb-6">
                    <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900">Ayuda con Tildes</span>
                    </div>
                    <button 
                        onClick={() => setTildeAssistant(!tildeAssistant)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${tildeAssistant ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${tildeAssistant ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                <button onClick={() => regenerateKey(mode)} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors border border-slate-100 uppercase tracking-wider">Regenerar Clave</button>
              </div>

              <div className="space-y-3">
                 <button onClick={() => setView(ViewState.PLAYER)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"><PlayCircle className="w-5 h-5" /> Jugar en pantalla</button>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleDownloadPDF} 
                      disabled={isExporting}
                      className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /> : <Download className="w-5 h-5 text-indigo-600" />}
                        <span className="text-[10px] uppercase tracking-tighter">{isExporting ? 'Generando...' : 'PDF Imprimible'}</span>
                    </button>
                    <button onClick={handleSaveToLibrary} className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-slate-50 transition-colors">
                        <Save className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] uppercase tracking-tighter">Guardar</span>
                    </button>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="sticky top-24">
                 <div className="bg-slate-800 rounded-t-2xl p-3 text-white px-6 font-bold text-[10px] tracking-widest uppercase flex items-center justify-between">
                    <span>Previsualización del material</span>
                    <span className="text-slate-400 lowercase font-normal italic">Se exportará tal como se ve aquí</span>
                 </div>
                 <div className="overflow-auto max-h-[calc(100vh-12rem)] rounded-b-2xl border border-t-0 shadow-2xl bg-slate-100 p-6">
                    <div className="bg-white shadow-sm border border-slate-200 mx-auto max-w-none">
                       <WorksheetPreview id="worksheet-to-export" text={text} cipherKey={cipherKey} tildeAssistant={tildeAssistant} />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showStorageWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">¿Quieres guardar este criptograma?</h3>
                <p className="text-slate-500 mt-2 text-sm">Los datos se guardan en el almacenamiento local de tu navegador. Si borras las cookies o usas modo incógnito, desaparecerán.</p>
            </div>
            <div className="space-y-2">
                <button onClick={() => { localStorage.setItem(WARNING_KEY, 'true'); executeSave(); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">Confirmar y Guardar</button>
                <button onClick={() => setShowStorageWarning(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
