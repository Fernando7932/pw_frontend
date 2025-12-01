import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { api } from '../services/api';

// --- Definición de Tipos ---
export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  
  // --- Monedas Globales ---
  coins: number; 
  setCoins: (coins: number) => void; 
  refreshCoins: () => Promise<void>; 

  page: string; 
  setPage: (page: string) => void;
  login: (token: string, user: User) => Promise<void>; 
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0); 
  const [page, setPage] = useState('home'); 
  const [isLoading, setIsLoading] = useState(true); 

  // 1. Definimos 'logout' PRIMERO para poder usarla en otras funciones
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setCoins(0); 
    api.setToken(null); 
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser'); 
    setPage('home');
  }, []);

  // 2. Definimos 'refreshCoins' (Depende de 'logout')
  const refreshCoins = useCallback(async () => {
    // Si no hay token en storage, no intentamos refrescar
    if (!localStorage.getItem('authToken')) return;
    
    try {
      // console.log("Refrescando monedas del usuario...");
      const data = await api.getUserCoins(); 
      setCoins(data.coins); 
    } catch (e: any) {
      console.error("Error al refrescar monedas:", e.message);
      // Si el token es inválido, cerramos sesión
      if (e.message.includes("Token inválido") || e.message.includes("401")) {
        logout();
      }
    }
  }, [logout]); 

  // 3. Definimos 'login' (Depende de 'refreshCoins')
  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    api.setToken(newToken); 
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    
    await refreshCoins(); // Cargamos las monedas inmediatamente
    
    setPage('home'); // Redirige a home
  };

  // 4. Efecto de Carga Inicial (Depende de 'refreshCoins' y 'logout')
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          api.setToken(storedToken); 
          
          // Intentamos refrescar monedas para verificar que el token siga vivo
          await refreshCoins();
        } catch (e) {
          console.error("Error al cargar sesión:", e);
          logout(); // Si algo falla (JSON corrupto, etc), limpiamos
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [refreshCoins, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e0f] flex items-center justify-center text-white">
        <div className="animate-pulse text-[#53FC18] font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      coins, 
      setCoins, 
      refreshCoins, 
      login, 
      logout, 
      page, 
      setPage, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};