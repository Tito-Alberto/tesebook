// Tipos para eventos de favoritos
type FavoritesEvent = {
  workId?: string;
  action?: 'added' | 'removed';
};

type FavoritesListener = (event?: FavoritesEvent) => void;

// Lista de ouvintes em memoria
const listeners = new Set<FavoritesListener>();

// Broker simples de eventos locais
export const favoritesEvents = {
  // Registra listener e retorna funcao para remover
  subscribe(listener: FavoritesListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  // Emite evento para todos os listeners
  emit(event?: FavoritesEvent) {
    listeners.forEach((listener) => listener(event));
  },
};
