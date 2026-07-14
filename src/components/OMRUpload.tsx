import { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export default function OMRUpload({ onOMRComplete }: { onOMRComplete?: (xml: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `omr/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      toast.success("PDF hochgeladen – OMR läuft...");
      // Hier später echter OMR Worker aufrufen
      const mockXml = `<?xml version="1.0"?><score-partwise><part><measure><note><pitch><step>C</step></pitch></note></measure></part></score-partwise>`;
      onOMRComplete?.(mockXml);
    } catch (err) {
      toast.error("Fehler beim Upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-center">
      <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" id="omr" />
      <label htmlFor="omr" className="cursor-pointer block border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-3xl p-20">
        <p className="text-6xl mb-6">📄</p>
        <p className="text-xl">PDF oder Foto hochladen</p>
        <p className="text-sm text-zinc-500 mt-2">Wird in Noten umgewandelt</p>
      </label>
      {loading && <p className="mt-6 text-emerald-500">Verarbeitung läuft...</p>}
    </div>
  );
}