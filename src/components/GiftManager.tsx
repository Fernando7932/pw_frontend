import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Gift {
  id: string;
  name: string;
  cost: number;
  points: number;
}

const GiftManager: React.FC = () => {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState(0);
  const [newPoints, setNewPoints] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchGifts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.getGifts(user.username);
      setGifts(data);
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGifts();
  }, [user]); 

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newCost <= 0 || newPoints <= 0) {
      setCreateError("Nombre, costo y puntos son requeridos y deben ser > 0.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      await api.createGift(newName, newCost, newPoints);
      setNewName('');
      setNewCost(0);
      setNewPoints(0);
      await fetchGifts();
    } catch (err: any) {
      setCreateError(err.message);
    }
    setIsCreating(false);
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!window.confirm("¿Borrar regalo?")) return;
    try {
      await api.deleteGift(giftId);
      await fetchGifts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-[#191b1f] p-6 rounded-lg border border-[#24272c] shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🎁</span>
        <h2 className="text-xl font-bold text-white">Gestionar Regalos</h2>
      </div>
      
      {/* Formulario Estilo Kick */}
      <form onSubmit={handleCreateGift} className="bg-[#0b0e0f] p-4 rounded border border-[#24272c] mb-6">
        <h3 className="text-sm font-bold text-[#53FC18] uppercase tracking-wider mb-4">Nuevo Regalo</h3>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">Nombre (ej. "Taco 🌮")</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 rounded bg-[#191b1f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">Costo</label>
              <input
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="w-full p-2 rounded bg-[#191b1f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1 uppercase">Puntos</label>
              <input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                className="w-full p-2 rounded bg-[#191b1f] border border-[#24272c] text-white focus:border-[#53FC18] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-2 bg-[#53FC18] text-black font-black uppercase text-sm rounded hover:bg-[#42ca13] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creando..." : "Crear Regalo"}
        </button>
        {createError && <p className="text-red-500 text-xs mt-2 font-semibold">{createError}</p>}
      </form>

      {/* Lista de Regalos */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Regalos Activos</h3>
        {isLoading ? (
          <div className="text-[#53FC18] text-sm animate-pulse">Cargando...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="space-y-2">
            {gifts.length > 0 ? (
              gifts.map((gift) => (
                <div key={gift.id} className="flex justify-between items-center bg-[#0b0e0f] p-3 rounded border border-[#24272c] group hover:border-[#53FC18] transition-colors">
                  <div>
                    <span className="font-bold text-white block">{gift.name}</span>
                    <div className="text-xs text-gray-400 flex gap-3 mt-1 font-mono">
                       <span>💰 {gift.cost}</span>
                       <span>✨ {gift.points} PTS</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGift(gift.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    title="Eliminar Regalo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-[#24272c] rounded">
                  <p className="text-gray-500 text-xs">No hay regalos creados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftManager;
