type FavoritesEvent = {
  workId?: string;
  action?: 'added' | 'removed';
};

type FavoritesListener = (event?: FavoritesEvent) => void;

const listeners = new Set<FavoritesListener>();

export const favoritesEvents = {
  subscribe(listener: FavoritesListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(event?: FavoritesEvent) {
    listeners.forEach((listener) => listener(event));
  },
};
