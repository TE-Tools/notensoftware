import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Copy, Download, Printer, Save, Music } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { auth } from '../lib/firebase';
import { saveScore } from '../lib/firebase'; // falls du saveScore exportiert hast

interface EditorProps {
  initialXml?: string;
  title?: string;
}

export default function Editor({ initialXml, title }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [instrumentCount, setInstrumentCount] = useState(4);
  const [scoreTitle, setScoreTitle] = useState(title || "Meine Partitur");
  const [xmlData, setXmlData] = useState(initialXml || '');

  const createDemoXML = (count: number) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>`;
    for (let i = 1; i <= count; i++) {
      xml += `<score-part id="P${i}"><part-name>Instrument ${i}</part-name></score-part>`;
    }
    xml += `</part-list>`;
    for (let i = 1; i <= count; i++) {
      xml += `<part id="P${i}"><measure number="1"><attributes><divisions>4</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure></part>`;
    }
    xml += `</score-partwise>`;
    return xml;
  };

  const loadScore = (xml: string) => {
    if (!osmdRef.current) return;
    setXmlData(xml);
    osmdRef.current.load(xml).then(() => osmdRef.current?.render());
  };

  useEffect(() => {
    if (!containerRef.current) return;
    osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, { autoResize: true, drawTitle: true });
    loadScore(initialXml || createDemoXML(instrumentCount));
  }, [initialXml]);

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text(scoreTitle, 20, 20);
    pdf.save(`${scoreTitle}.pdf`);
    toast.success("PDF exportiert!");
  };

  const exportMIDI = () => toast.success("MIDI exportiert (Demo)");

  const saveToCloud = async () => {
    if (!auth.currentUser) return toast.error("Bitte einloggen");
    const success = await saveScore(auth.currentUser.uid, scoreTitle, xmlData);
    success ? toast.success("Gespeichert!") : toast.error("Fehler beim Speichern");
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 flex-wrap">
        <input type="text" value={scoreTitle} onChange={e => setScoreTitle(e.target.value)} className="bg-zinc-800 px-5 py-3 rounded-xl flex-1 min-w-[250px]" />
        
        <button onClick={saveToCloud} className="bg-blue-600 px-6 py-3 rounded-xl flex items-center gap-2"><Save size={20} /> Speichern</button>
        <button onClick={exportPDF} className="bg-emerald-600 px-6 py-3 rounded-xl flex items-center gap-2"><Download size={20} /> PDF</button>
        <button onClick={exportMIDI} className="bg-violet-600 px-6 py-3 rounded-xl flex items-center gap-2"><Music size={20} /> MIDI</button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label>Instrumente ({instrumentCount})</label>
        <input type="range" min="1" max="20" value={instrumentCount} onChange={e => setInstrumentCount(+e.target.value)} className="accent-emerald-500" />
      </div>

      <div className="border border-zinc-700 rounded-2xl bg-white overflow-hidden">
        <div ref={containerRef} className="min-h-[650px] p-4" />
      </div>
    </div>
  );
}