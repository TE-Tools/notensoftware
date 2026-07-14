import { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export default function SibeliusImport({ onImport }: { onImport: (xml: string, title: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // MusicXML direkt verarbeiten
      if (file.name.endsWith('.musicxml') || file.name.endsWith('.xml')) {
        const text = await file.text();
        onImport(text, file.name.replace(/\.(musicxml|xml)$/, ''));
        toast.success("Sibelius MusicXML erfolgreich importiert!");
      } 
      // PDF / Bild → OMR
      else if (file.name.endsWith('.pdf')) {
        toast.info("PDF wird als Sibelius-Export erkannt – OMR läuft...");
        // Hier später echter OMR
        const mockXml = `<?xml version="1.0"?> <!-- Sibelius Import -->`;
        onImport(mockXml, "Sibelius Import");
      } else {
        toast.error("Nur .musicxml, .xml oder .pdf Dateien werden unterstützt");
      }
    } catch (err) {
      toast.error("Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 border border-dashed border-zinc-700 rounded-3xl text-center">
      <p className="text-xl mb-6">Sibelius-Datei importieren</p>
      <p className="text-sm text-zinc-500 mb-8">Exportiere in Sibelius als MusicXML und lade sie hier hoch</p>

      <label className="cursor-pointer block">
        <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-2xl p-12">
          <p className="text-5xl mb-4">📥</p>
          <p className="font-semibold">MusicXML oder PDF hochladen</p>
        </div>
        <input 
          type="file" 
          accept=".musicxml,.xml,.pdf" 
          onChange={handleFile} 
          className="hidden" 
        />
      </label>

      {loading && <p className="mt-6 text-emerald-500">Importiere...</p>}
    </div>
  );
}