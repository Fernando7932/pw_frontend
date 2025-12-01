import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface LevelConfig {
  id: string;
  level: number;
  pointsRequired: number;
}

const LevelManager: React.FC = () => {
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newLevel, setNewLevel] = useState(2); 
  const [newPoints, setNewPoints] = useState(100);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchLevels = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSpectatorLevels();
      setLevels(data);
      
      if (data.length > 0) {
        const maxLevel = Math.max(...data.map((l: LevelConfig) => l.level));
        const maxPoints = Math.max(...data.map((l: LevelConfig) => l.pointsRequired));
        setNewLevel(maxLevel + 1);
        setNewPoints(maxPoints + 100);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (newLevel <= 1 || newPoints <= 0) {
      setCreateError("El nivel debe ser 2 o más, y los puntos > 0.");
      return;
    }

    const maxPoints = levels.length > 0 ? Math.max(...levels.map(l => l.pointsRequired)) : 0; 
    const maxLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) : 1;

    if (newLevel <= maxLevel) {
       setCreateError(`El siguiente nivel debe ser ${maxLevel + 1}.`);
       return;
    }

    if (newPoints <= maxPoints) {
      setCreateError(`Debe costar más de ${maxPoints} puntos.`);
      return;
    }

    setIsCreating(true);
    try {
      await api.createSpectatorLevel(newLevel, newPoints);
      setNewLevel(newLevel + 1); 
      setNewPoints(newPoints + 100); 
      await fetchLevels();
    } catch (err: any) {
      setCreateError(err.message);
    }
    setIsCreating(false);
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!window.confirm("¿Borrar nivel?")) return;
    try {
      await api.deleteSpectatorLevel(levelId);
      await fetchLevels();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-[#191b1f] p-6 rounded-lg border border-[#24272c] shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-bold text-white">Niveles de Espectador</h2>
      </div>
      
      {/* Formulario */}
      <form onSubmit={handleCreateLevel} className="bg-[#0b0e0f] p-4 rounded border border-[#24272c] mb-6">
        <h3 className="text-sm font-bold text-[#53FC18] uppercase tracking-wider mb-4">Nuevo Nivel</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">Nivel</label>
            <input
              type="number"
              min="2"
              value={newLevel}
              onChange={(e) => setNewLevel(Number(e.target.value))}
              className="w-full p-2 rounded bg-[#191b1f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors"
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">Puntos Req.</label>
            <input
              type="number"
              min="1"
              value={newPoints}
              onChange={(e) => setNewPoints(Number(e.target.value))}
              className="w-full p-2 rounded bg-[#191b1f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 bg-[#53FC18] text-black font-black uppercase text-sm rounded hover:bg-[#42ca13] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Guardando..." : "Añadir Nivel"}
        </button>
        {createError && <p className="text-red-500 text-xs mt-2 font-semibold">{createError}</p>}
      </form>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Niveles Activos</h3>
        {isLoading ? (
          <div className="text-[#53FC18] text-sm animate-pulse">Cargando...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-2">
            {/* Nivel Base */}
            <div className="flex justify-between items-center bg-[#0b0e0f]/50 p-3 rounded border border-[#24272c] opacity-60">
              <div className="flex items-center gap-3">
                <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded">NVL 1</span>
                <span className="text-sm text-gray-400 font-mono">0 PTS</span>
              </div>
              <span className="text-xs text-gray-600 uppercase font-bold">Default</span>
            </div>
            
            {levels.sort((a, b) => a.level - b.level).map((level) => (
              <div key={level.id} className="flex justify-between items-center bg-[#0b0e0f] p-3 rounded border border-[#24272c] group hover:border-[#53FC18] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="bg-[#53FC18] text-black text-xs font-black px-2 py-1 rounded">NVL {level.level}</span>
                  <span className="text-sm text-white font-mono font-bold">{level.pointsRequired} PTS</span>
                </div>
                <button
                  onClick={() => handleDeleteLevel(level.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                  title="Eliminar Nivel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelManager;