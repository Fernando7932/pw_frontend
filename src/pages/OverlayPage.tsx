import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

interface OverlayPageProps {
  username: string;
}

// Unificamos los tipos de alerta
interface AlertData {
  id: string; // ID único para la cola
  type: 'gift' | 'levelUp';
  user: string;
  detail: string; // Nombre del regalo o Nuevo Nivel
  image?: string; // Emoji o URL
}

const OverlayPage: React.FC<OverlayPageProps> = ({ username }) => {
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null);
  const [queue, setQueue] = useState<AlertData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Referencia para controlar si estamos procesando la cola
  const isProcessingRef = useRef(false);

  // 1. Conexión y Escucha de Eventos
  useEffect(() => {
    const socket = io('https://kickclone-api.onrender.com');
    socket.emit('joinRoom', username);

    // Escuchar Regalos
    socket.on('newGift', (data) => {
      addAlert({
        id: Date.now().toString() + Math.random(),
        type: 'gift',
        user: data.spectatorUsername,
        detail: data.giftName,
        image: '🎁'
      });
    });

    // Escuchar Subida de Nivel (Espectador)
    socket.on('levelUp', (data) => {
      addAlert({
        id: Date.now().toString() + Math.random(),
        type: 'levelUp',
        user: data.username,
        detail: `Nivel ${data.newLevel}`,
        image: '⭐'
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  // 2. Función para añadir a la cola
  const addAlert = (newAlert: AlertData) => {
    setQueue((prev) => [...prev, newAlert]);
  };

  // 3. Procesador de Cola (El "Motor")
  useEffect(() => {
    // Si ya estamos mostrando algo, o la cola está vacía, no hacemos nada
    if (isProcessingRef.current || queue.length === 0) return;

    // Iniciar proceso
    isProcessingRef.current = true;
    const nextAlert = queue[0];
    
    // Quitar de la cola
    setQueue((prev) => prev.slice(1));
    
    // Mostrar alerta
    setCurrentAlert(nextAlert);
    setIsVisible(true);

    // Ocultar después de 5 segundos
    setTimeout(() => {
      setIsVisible(false);
      
      // Esperar un poco más para la animación de salida antes de la siguiente
      setTimeout(() => {
        setCurrentAlert(null);
        isProcessingRef.current = false; // ¡Listo para la siguiente!
      }, 500); // 0.5s de transición de salida
      
    }, 5000); // Duración de la alerta

  }, [queue, isProcessingRef.current]); // Se ejecuta cada vez que la cola cambia

  if (!currentAlert) return null;

  // 4. Renderizado Condicional (Estilos diferentes según el tipo)
  const isGift = currentAlert.type === 'gift';
  const borderColor = isGift ? 'border-yellow-400' : 'border-indigo-400';
  const bgColor = isGift ? 'bg-indigo-600' : 'bg-purple-600';
  const titleText = isGift ? '¡Nuevo Regalo!' : '¡Subida de Nivel!';
  const textColor = isGift ? 'text-yellow-300' : 'text-white';

  return (
    <div className="h-screen w-screen flex items-end justify-center pb-20 bg-transparent overflow-hidden">
      
      {/* Contenedor con animación de entrada/salida */}
      <div 
        className={`
          ${bgColor} text-white px-8 py-6 rounded-2xl shadow-2xl border-4 ${borderColor}
          flex flex-col items-center transform transition-all duration-500
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90'}
        `}
      >
        <span className="text-6xl mb-2 animate-bounce">{currentAlert.image}</span>
        
        <h1 className={`text-4xl font-bold drop-shadow-md ${textColor}`}>
          {titleText}
        </h1>
        
        <p className="text-2xl mt-2 font-semibold text-center">
          <span className="text-yellow-200 font-bold">{currentAlert.user}</span>
          <span className="mx-2">{isGift ? 'envió' : 'alcanzó'}</span>
          <span className="bg-black/20 px-2 py-1 rounded">{currentAlert.detail}</span>
        </p>

        {/* Barra de progreso de tiempo (Opcional, puramente visual) */}
        {isVisible && (
          <div className="w-full bg-black/30 h-1 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 w-full animate-[shrink_5s_linear_forwards]"></div>
          </div>
        )}
      </div>

      {/* Estilos inline para la animación de la barra */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default OverlayPage;
