import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth'; 

// ==========================================
// 1. IMPORTACIÓN DE VISTAS Y COMPONENTES
// ==========================================

// Componentes Globales de Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas de Contenido Estático/Público
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas Protegidas y Dinámicas
import DashboardPage from './pages/DashboardPage';
import StreamPage from './pages/StreamPage'; 
import BuyCoinsPage from './pages/BuyCoinsPage'; 
import OverlayPage from './pages/OverlayPage'; 

// ==========================================
// 2. ENRUTADOR PRINCIPAL (APP ROUTER)
// ==========================================

const AppRouter: React.FC = () => {
  // Obtenemos el estado de navegación y el usuario actual del contexto
  const { page, setPage, user } = useAuth();

  // --- DETECCIÓN DE URL EXTERNA (OBS) ---
  // Este efecto permite que si se accede directamente por URL (ej: para poner en OBS),
  // la aplicación sepa qué renderizar sin depender de la navegación interna.
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/overlay/')) {
      setPage(path.substring(1)); // Elimina el '/' inicial y actualiza el estado
    }
  }, [setPage]);

  // --- FLAGS DE ESTADO DE UI ---
  // Detectamos si es overlay para quitar el layout (Header/Footer/Fondo)
  const isOverlayPage = page.startsWith('overlay/');
  // Detectamos si es stream page para usar ancho completo (Theater Mode)
  const isStreamPage = page.startsWith('stream/');
  
  // --- CONTROLADOR DE VISTAS (RENDERIZADO CONDICIONAL) ---
  const renderPage = () => {
    
    // A. Protección de Rutas (Auth Guard)
    // Si el usuario intenta acceder a rutas privadas sin estar logueado, se redirige al Login.
    if ((page === 'dashboard' || page.startsWith('stream/') || page === 'buy-coins') && !user) {
      return <LoginPage />; 
    }

    // B. Rutas Dinámicas (Con Parámetros)
    // Parsea la URL para extraer el nombre de usuario (ej: stream/usuario123)
    if (page.startsWith('stream/')) {
      const username = page.split('/')[1];
      return <StreamPage username={username} />;
    }

    if (page.startsWith('overlay/')) {
      const username = page.split('/')[1];
      return <OverlayPage username={username} />;
    }
    
    // C. Rutas Estáticas
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'terms':
        return <TermsPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'buy-coins':
        return <BuyCoinsPage />;
      default:
        return <HomePage />;
    }
  };

  // ==========================================
  // 3. GESTIÓN DE LAYOUTS
  // ==========================================

  // Layout Especial: Overlay (Transparente para OBS)
  // Retorna solo el componente sin estilos globales ni contenedores.
  if (isOverlayPage) {
    return renderPage();
  }

  // Layout Estándar: Aplicación Web
  // Incluye Header, Footer y estructura de contenedor oscuro.
  return (
    // Estilo base oscuro similar a plataformas de streaming (#0b0e0f)
    
    <div className="min-h-screen bg-[#0b0e0f] text-white flex flex-col">
      <Header />
      <main className={isStreamPage ? "w-full" : "container mx-auto px-4 flex-grow"}>
        {renderPage()}
      </main>
      {!isStreamPage && <Footer />}
    </div>
  );
};

// ==========================================
// 4. PUNTO DE ENTRADA (ROOT)
// ==========================================

function App() {
  return (
    // Proveedor de Autenticación Global
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
