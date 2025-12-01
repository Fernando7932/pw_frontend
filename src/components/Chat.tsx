import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface ChatMessage {
  username: string;
  level: number;
  text: string;
  timestamp: string;
}

interface ChatProps {
  roomName: string; 
}

const Chat: React.FC<ChatProps> = ({ roomName }) => {
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io('https://kickclone-api.onrender.com');
    socketRef.current = socket;

    socket.emit('joinRoom', roomName);

    socket.on('newMessage', (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on('authError', (error) => {
      console.error('Error chat:', error.message);
    });

    socket.on('newGift', (gift) => {
      const systemMessage: ChatMessage = {
        username: 'SISTEMA',
        level: 99, 
        text: `¡${gift.spectatorUsername} ha enviado un ${gift.giftName}!`,
        timestamp: gift.timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    socket.on('levelUp', (data) => {
      const systemMessage: ChatMessage = {
        username: 'SISTEMA',
        level: 99,
        text: `¡Felicidades ${data.username}! Has subido a Nivel ${data.newLevel}.`,
        timestamp: data.timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomName]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]); 

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !token) return;

    socketRef.current.emit('sendMessage', {
      roomName: roomName,
      message: newMessage,
      token: token 
    });

    setNewMessage('');
  };

  return (
    // Fondo oscuro para todo el panel de chat
    <div className="bg-[#0b0e0f] h-full flex flex-col overflow-hidden border-l border-[#24272c]">
      
      {/* Cabecera del Chat */}
      <div className="p-3 border-b border-[#24272c] bg-[#0b0e0f] flex justify-between items-center shadow-sm z-10">
        <span className="font-bold text-gray-300 text-sm uppercase tracking-wider">Chat del Stream</span>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-grow p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#24272c] scrollbar-track-transparent hover:scrollbar-thumb-[#32353b]"> 
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start gap-2 text-sm group">
            {/* Badge de Nivel */}
            <span className={`
              text-[10px] font-black px-1.5 py-0.5 rounded h-fit mt-0.5
              ${msg.username === 'SISTEMA' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-[#24272c] text-[#53FC18] border border-[#53FC18]/30'}
            `}>
              {msg.username === 'SISTEMA' ? 'SYS' : `${msg.level}`}
            </span>
            
            <div className="flex-1 break-words leading-relaxed">
              <span className={`font-bold mr-2 ${
                msg.username === 'SISTEMA' ? 'text-yellow-500' : 'text-gray-300 group-hover:text-white transition-colors'
              }`}>
                {msg.username}:
              </span>
              <span className={msg.username === 'SISTEMA' ? 'text-yellow-100 italic' : 'text-gray-400 group-hover:text-gray-200'}>
                {msg.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-[#0b0e0f] border-t border-[#24272c]">
        <form onSubmit={handleSendMessage} className="relative">
          <fieldset disabled={!user} className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={user ? "Enviar mensaje..." : "Inicia sesión para chatear"}
              className="w-full p-3 pr-12 rounded-lg bg-[#191b1f] border border-[#24272c] text-white placeholder-gray-600 focus:border-[#53FC18] focus:outline-none transition-colors font-medium text-sm"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1.5 p-1.5 bg-[#53FC18] text-black rounded hover:bg-[#42ca13] transition-colors disabled:opacity-0 disabled:cursor-default"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </fieldset>
          {!user && (
             <div className="text-center mt-2">
                <p className="text-xs text-gray-500">Debes estar logueado para participar</p>
             </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Chat;
