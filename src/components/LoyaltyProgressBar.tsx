import React, { useState, useEffect, useCallback } from 'react'; 
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { io } from 'socket.io-client'; 

interface LoyaltyProgressBarProps {
  streamerUsername: string;
}

interface LoyaltyStats {
  points: number;
  level: number;
  pointsForNextLevel: number | null;
}

const LoyaltyProgressBar: React.FC<LoyaltyProgressBarProps> = ({ streamerUsername }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoyalty = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getLoyaltyStats(streamerUsername);
      setStats(data);
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  }, [streamerUsername, user]);

  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  useEffect(() => {
    if (!user) return;
    const socket = io('https://kickclone-api.onrender.com');
    socket.emit('joinRoom', streamerUsername);
    socket.on('newGift', fetchLoyalty);
    socket.on('levelUp', fetchLoyalty);
    socket.on('newMessage', (msg: any) => {
        if (msg.username === user.username) fetchLoyalty();
    });
    return () => { socket.disconnect(); };
  }, [fetchLoyalty, user, streamerUsername]); 

  if (isLoading || !user || !stats) return null;
  
  const { points, level, pointsForNextLevel } = stats;

  let percentage = 0;
  let progressText = "MAX";

  if (pointsForNextLevel) {
    percentage = Math.max(0, Math.min(100, (points / pointsForNextLevel) * 100));
    const displayPoints = Math.min(points, pointsForNextLevel);
    progressText = `${displayPoints} / ${pointsForNextLevel}`;
  } else {
    percentage = 100;
  }

  return (
    <div className="bg-[#191b1f] p-4 rounded-xl border border-[#24272c] shadow-sm mb-4">
      <div className="flex justify-between items-end mb-2">
        <div>
            <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tu Progreso</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white italic">NIVEL {level}</span>
                <span className="text-xs font-mono text-[#53FC18] font-bold">{points} PTS TOTALES</span>
            </div>
        </div>
        <div className="text-right">
            <span className="text-xs text-gray-400 font-medium">{progressText} PTS para Nivel {level + 1}</span>
        </div>
      </div>
      
      {/* Barra de fondo */}
      <div className="w-full bg-[#0b0e0f] rounded-full h-3 overflow-hidden border border-[#24272c] relative">
        {/* Barra de relleno */}
        <div 
          className="bg-[#53FC18] h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(83,252,24,0.4)]" 
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Patrón de líneas (opcional, decorativo) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')]"></div>
      </div>
    </div>
  );
};

export default LoyaltyProgressBar;