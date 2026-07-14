import { useState, useEffect } from 'react';
import { loadUserScores } from '../lib/firebase';
import { auth } from '../lib/firebase';

export default function Dashboard({ onLoad }: { onLoad: (xml: string, title: string) => void }) {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    if (auth.currentUser) {
      loadUserScores(auth.currentUser.uid).then(setScores);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-10">Meine Partituren</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scores.map(s => (
          <div key={s.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700">
            <h3 className="font-semibold text-xl">{s.title}</h3>
            <button onClick={() => onLoad(s.xml, s.title)} className="mt-4 text-emerald-500">Öffnen</button>
          </div>
        ))}
      </div>
    </div>
  );
}