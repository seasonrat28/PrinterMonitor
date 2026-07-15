import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('printerFavorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  }, []);

  const toggleFavorite = (ip) => {
    let updated;
    if (favorites.includes(ip)) {
      updated = favorites.filter(fav => fav !== ip);
    } else {
      updated = [...favorites, ip];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('printerFavorites', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save favorites', err);
    }
  };

  const isFavorite = (ip) => favorites.includes(ip);

  return { favorites, toggleFavorite, isFavorite };
};
