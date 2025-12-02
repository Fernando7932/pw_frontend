import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import GiftManager from '../components/GiftManager';
import LevelManager from '../components/LevelManager';
import { io } from 'socket.io-client';

interface StreamInfo {
  title: string;
  streamKey: string;
  isLive: boolean;
  streamHours: number;
}

interface Notification {
  id: string;
  text: string;
  timestamp: Date;
  type: 'level' | 'system';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levelNotification, setLevelNotification] = useState<string | null>(null);

  // Inicializar notificaciones desde localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('dashboard_notifications');
    if (saved) {
      try {
        // Necesitamos revivir las fechas porque JSON.parse las deja como strings
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('dashboard_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Estado para rastrear el nivel anterior y detectar cambios
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  // Función para calcular nivel
  const calculateStreamerLevel = (hours: number) => {
    const HOURS_PER_LEVEL = 0.01; // Valor bajo para pruebas
    const level = Math.floor(hours / HOURS_PER_LEVEL) + 1;
    const nextLevelHours = level * HOURS_PER_LEVEL;
    const currentLevelBase = (level - 1) * HOURS_PER_LEVEL;
    const progress = hours - currentLevelBase;
    const totalToNext = nextLevelHours - currentLevelBase;
    const percentage = Math.min(100, (progress / totalToNext) * 100);

    return { level, nextLevelHours, percentage };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copiada al portapapeles');
  };

  useEffect(() => {
    const fetchStreamInfo = async () => {
      setError(null);
      try {
        const data = await api.getStreamInfo();
        setStreamInfo(data);

        // Lógica de detección de subida de nivel local
        if (data) {
          const { level } = calculateStreamerLevel(data.streamHours);

          // Si es la primera carga, solo guardamos el nivel
          if (prevLevel === null) {
            setPrevLevel(level);
          }
          // Si el nivel nuevo es mayor al anterior, notificamos
          else if (level > prevLevel) {
            const levelText = `¡Has subido a Nivel de Streamer ${level}!`;
            setLevelNotification(levelText);
            setTimeout(() => setLevelNotification(null), 10000);

            const newNotif: Notification = {
              id: Date.now().toString(),
              text: levelText,
              timestamp: new Date(),
              type: 'level'
            };
            setNotifications(prev => [newNotif, ...prev]);
            setPrevLevel(level);
          }
        }

      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStreamInfo();

    // Polling cada 5 segundos para actualizar horas y detectar nivel
    const intervalId = setInterval(fetchStreamInfo, 5000);

    return () => clearInterval(intervalId);
  }, [prevLevel]); // Dependencia prevLevel para comparar

  useEffect(() => {
    if (!user) return;

    const socket = io('https://kickclone-api.onrender.com');
    socket.emit('joinRoom', user.username);

    // Mantenemos socket para otros mensajes, pero la notificación de nivel la manejamos localmente
    socket.on('newMessage', (data) => {
      if (data.username === 'SISTEMA' && !data.text.includes('Has subido a Nivel de Streamer')) {
        // ... lógica para otros mensajes de sistema si los hubiera
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const overlayUrl = `${window.location.origin}/overlay/${user?.username}`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto relative bg-[#0b0e0f] min-h-full text-white">
      {/* Toast Flotante */}
      {levelNotification && (
        <div className="fixed top-24 right-4 z-50 animate-bounce">
          <div className="bg-[#191b1f] text-white p-4 rounded-xl shadow-2xl border-l-4 border-[#53FC18] flex items-start max-w-md">
            <span className="text-2xl mr-4">🎉</span>
            <div>
              <h4 className="font-bold text-lg uppercase tracking-wider text-[#53FC18]">¡Subiste de Nivel!</h4>
              <p className="text-sm font-medium mt-1 text-gray-300">{levelNotification}</p>
            </div>
            <button
              onClick={() => setLevelNotification(null)}
              className="ml-4 text-gray-500 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-black mb-8 text-white tracking-tight">Panel de Control <span className='text-gray-500 text-lg font-medium ml-2'>de {user?.username}</span></h1>
      {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 border border-red-500/50 text-sm font-bold text-center">{error}</p>}

      {streamInfo ? (
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Columna Izquierda: Configuración */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#191b1f] p-6 rounded-xl shadow-sm border border-[#24272c]">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white uppercase tracking-wide">
                  📡 Configuración de Transmisión
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block">Servidor RTMP</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[#0b0e0f] p-3 rounded text-[#53FC18] font-mono text-sm select-all overflow-x-auto border border-[#24272c]">
                        rtmp://34.68.66.89:1935/live
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block">Tu Clave de Transmisión</label>
                    <div className="">
                      <code className="block w-full bg-[#0b0e0f] p-3 rounded text-[#53FC18] font-mono text-sm break-all select-all border border-[#24272c]">
                        {streamInfo.streamKey}
                      </code>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Pega esta clave en OBS (Ajustes &gt; Emisión). No la compartas.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#24272c]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 font-bold">ESTADO DEL SERVIDOR</span>
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${streamInfo.isLive ? 'bg-[#53FC18]/10 text-[#53FC18] border-[#53FC18]/50' : 'bg-[#24272c] text-gray-500 border-transparent'}`}>
                        {streamInfo.isLive ? '🔴 En Vivo' : '⚫ Desconectado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#191b1f] p-6 rounded-xl shadow-sm border border-[#24272c]">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white uppercase tracking-wide">
                  🎨 Configuración de Alertas (Overlay)
                </h2>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Para mostrar las notificaciones de regalos y niveles en tu stream, añade esta URL como una fuente de <strong className="text-white">Navegador</strong> en OBS.
                </p>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 block">URL del Overlay</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-[#0b0e0f] p-3 rounded text-purple-400 font-mono text-sm select-all overflow-x-auto border border-[#24272c]">
                      {overlayUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(overlayUrl)}
                      className="bg-[#24272c] hover:bg-[#32353b] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wide transition-colors border border-[#24272c] hover:border-gray-600"
                    >
                      Copiar
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 uppercase font-bold">1920x1080 • Fondo Transparente</span>
                    <a
                      href={overlayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#53FC18] hover:underline font-bold flex items-center gap-1"
                    >
                      Probar en nueva pestaña ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Estadísticas y Notificaciones */}
            <div className="md:col-span-2 lg:col-span-1 space-y-6">

              {/* Tarjeta de Carrera */}
              <div className="bg-gradient-to-b from-[#191b1f] to-[#0b0e0f] p-6 rounded-xl shadow-sm border border-[#24272c] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-[#53FC18]">
                    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.001c-3.698 2.87-9.52 4.808-14.448 1.082a.75.75 0 01-.146-1.057c1.176-1.558 3.392-3.203 5.868-3.763-.836-.408-1.614-.92-2.29-1.524a.75.75 0 01.993-1.113c.616.55 1.33.995 2.107 1.304a15.64 15.64 0 013.123-3.036zM2.25 13.5a.75.75 0 000 1.5c.5 0 1.06.045 1.656.137a14.301 14.301 0 00-.621 1.576.75.75 0 001.383.59 12.77 12.77 0 011.23-2.483c.876-.072 1.842-.072 2.914.023a.75.75 0 10.22-1.484 14.653 14.653 0 00-2.81.018 17.247 17.247 0 01-1.906-1.67.75.75 0 00-1.164.948c.42.515.906.978 1.445 1.38C3.626 13.533 2.88 13.5 2.25 13.5z" clipRule="evenodd" />
                  </svg>
                </div>

                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white uppercase tracking-wide relative z-10">
                  🚀 Tu Carrera
                </h2>

                {(() => {
                  const { level, nextLevelHours, percentage } = calculateStreamerLevel(streamInfo.streamHours);
                  return (
                    <div className="space-y-6 relative z-10">
                      <div className="text-center">
                        <div className="inline-block p-4 rounded-full bg-[#0b0e0f] border-4 border-[#53FC18] shadow-[0_0_20px_rgba(83,252,24,0.2)]">
                          <span className="text-4xl font-black text-white">{level}</span>
                        </div>
                        <p className="text-[#53FC18] text-xs uppercase tracking-widest font-bold mt-3">Nivel de Streamer</p>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                          <span>{streamInfo.streamHours.toFixed(1)} HRS</span>
                          <span>{nextLevelHours} HRS</span>
                        </div>
                        <div className="w-full bg-[#0b0e0f] rounded-full h-2 overflow-hidden border border-[#24272c]">
                          <div
                            className="bg-[#53FC18] h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(83,252,24,0.5)]"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-3 font-medium">
                          Faltan <strong className="text-white">{(nextLevelHours - streamInfo.streamHours).toFixed(1)}</strong> horas para subir
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#24272c]">
                        <div className="bg-[#0b0e0f] p-3 rounded border border-[#24272c] text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                          <p className="text-lg font-mono font-bold text-white">{streamInfo.streamHours.toFixed(2)}<span className="text-xs text-gray-600 ml-1">h</span></p>
                        </div>
                        <div className="bg-[#0b0e0f] p-3 rounded border border-[#24272c] text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Canal</p>
                          <p className="text-sm font-bold text-white truncate">{streamInfo.title}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Notificaciones */}
              <div className="bg-[#191b1f] p-6 rounded-xl shadow-sm border border-[#24272c] h-80 flex flex-col">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-white uppercase tracking-wide">
                  <span>🔔 Avisos</span>
                  {notifications.length > 0 && (
                    <span className="bg-[#53FC18] text-black text-[10px] font-black px-1.5 py-0.5 rounded">{notifications.length}</span>
                  )}
                </h2>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="bg-[#0b0e0f] p-3 rounded border-l-2 border-[#53FC18] animate-fade-in">
                        <p className="text-xs text-gray-300 font-medium leading-snug">{notif.text}</p>
                        <p className="text-[10px] text-gray-600 mt-2 text-right font-mono uppercase">
                          {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                      <span className="text-2xl opacity-50">💤</span>
                      <p className="text-xs font-bold uppercase">Sin novedades</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="mt-4 w-full py-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest border-t border-[#24272c] transition-colors"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Gestores (Abajo) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-full">
              <GiftManager />
            </div>
            <div className="h-full">
              <LevelManager />
            </div>
          </div>

        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-[#53FC18] font-bold uppercase tracking-widest text-xs">Cargando panel...</div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
