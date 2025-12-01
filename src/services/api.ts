// ==========================================
// 1. CONFIGURACIÓN Y TIPOS
// ==========================================

// URL base del Backend (Producción)
const API_URL = 'https://kickclone-api.onrender.com/api';

// Definición de la estructura del servicio API
type ApiService = {
  // Gestión de estado local (Token)
  token: string | null;
  setToken: (token: string | null) => void;

  // Métodos de Autenticación
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, username: string, password: string) => Promise<any>;

  // Método Core (Privado)
  _fetch: (endpoint: string, options?: RequestInit) => Promise<any>;

  // Métodos de Streaming (Visualización)
  getStreamInfo: () => Promise<any>;
  getLiveStreams: () => Promise<any>;
  getStreamInfoByUsername: (username: string) => Promise<any>;
  
  // Métodos de Economía y Gamificación (Espectador)
  getUserCoins: () => Promise<any>; 
  getLoyaltyStats: (streamerUsername: string) => Promise<any>; 
  getGifts: (streamerUsername: string) => Promise<any>; 
  sendGift: (giftId: string, toStreamerUsername: string) => Promise<any>;
  buyCoinsTest: (amount: number) => Promise<any>;

  // Métodos de Gestión (Streamer Dashboard)
  createGift: (name: string, cost: number, points: number) => Promise<any>;
  deleteGift: (giftId: string) => Promise<void>; 
  getSpectatorLevels: () => Promise<any>;
  createSpectatorLevel: (level: number, pointsRequired: number) => Promise<any>;
  deleteSpectatorLevel: (levelId: string) => Promise<void>; 
};

// ==========================================
// 2. IMPLEMENTACIÓN DEL SERVICIO
// ==========================================

export const api: ApiService = {
  token: null,

  // Guarda el token en memoria para usarlo en futuras peticiones
  setToken(token) {
    this.token = token;
  },

  /**
   * Wrapper genérico para fetch.
   * Se encarga de inyectar el token, headers comunes y manejar errores.
   */
  async _fetch(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Inyección automática del Token de Autenticación
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Manejo de respuestas sin contenido (HTTP 204)
    // Común en operaciones DELETE o UPDATE que no devuelven datos.
    if (response.status === 204) {
      return null; 
    }

    // Parseo de respuesta JSON
    const data = await response.json(); 

    // Manejo centralizado de errores de API
    if (!response.ok) {
      throw new Error(data.message || `Error en la petición a ${endpoint}`);
    }
    return data;
  },

  // ==========================================
  // 3. MÓDULO DE AUTENTICACIÓN
  // ==========================================

  login(email, password) {
    return this._fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email, username, password) {
    return this._fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  },

  // ==========================================
  // 4. MÓDULO DE STREAMING (CANALES)
  // ==========================================

  // Obtiene info del propio canal (Privado)
  getStreamInfo() {
    return this._fetch('/stream/me');
  },

  // Obtiene lista global de canales en vivo (Público)
  getLiveStreams() {
    return this._fetch('/streams/live');
  },

  // Obtiene datos de un canal específico para ver el directo (Público)
  getStreamInfoByUsername(username: string) {
    return this._fetch(`/stream/u/${username}`);
  },
  
  // ==========================================
  // 5. MÓDULO DE ECONOMÍA (ESPECTADOR)
  // ==========================================

  // Consulta saldo actual
  getUserCoins() {
    return this._fetch('/user/coins');
  },

  // Consulta progreso (nivel/puntos) en un canal específico
  getLoyaltyStats(streamerUsername: string) {
    return this._fetch(`/user/loyalty/${streamerUsername}`);
  },

  // Obtiene catálogo de regalos de un streamer
  getGifts(streamerUsername: string) {
    return this._fetch(`/gifts/${streamerUsername}`);
  },

  // Realiza la transacción de enviar un regalo
  sendGift(giftId: string, toStreamerUsername: string) {
    return this._fetch('/gifts/send', {
      method: 'POST',
      body: JSON.stringify({ giftId, toStreamerUsername })
    });
  },

  // Compra de monedas (Simulación para pruebas)
  buyCoinsTest(amount: number) {
    return this._fetch('/user/buy-coins-test', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  },

  // ==========================================
  // 6. MÓDULO DE GESTIÓN (STREAMER DASHBOARD)
  // ==========================================

  // --- Gestión de Regalos ---
  createGift(name: string, cost: number, points: number) {
    return this._fetch('/stream/gifts', {
      method: 'POST',
      body: JSON.stringify({ name, cost, points })
    });
  },

  async deleteGift(giftId: string): Promise<void> {
    await this._fetch(`/stream/gifts/${giftId}`, {
      method: 'DELETE'
    });
  },

  // --- Gestión de Niveles de Audiencia ---
  getSpectatorLevels() {
    return this._fetch('/stream/levels');
  },

  createSpectatorLevel(level: number, pointsRequired: number) {
    return this._fetch('/stream/levels', {
      method: 'POST',
      body: JSON.stringify({ level, pointsRequired })
    });
  },

  async deleteSpectatorLevel(levelId: string): Promise<void> {
    await this._fetch(`/stream/levels/${levelId}`, {
      method: 'DELETE'
    });
  },
};