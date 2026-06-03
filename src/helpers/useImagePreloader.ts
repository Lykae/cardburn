// hooks/useImagePreloader.ts
import { useEffect, useState } from "react";

// assets/preloadImages.ts

const images = Array.from(
  { length: 5 * 14 },
  (_, i) => {
    const suit = Math.floor(i / 14);
    const value = i % 14;

    return `/cards/${suit}_${value}.png`;
  },
);

export function useImagePreloader() {
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let count = 0;

    Promise.all(
      images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();

            img.onload = () => {
              count++;
              setLoaded(count);
              resolve();
            };

            img.onerror = () => {
              count++;
              setLoaded(count);
              resolve();
            };

            img.src = src;
          }),
      ),
    );
  }, []);

  return {
    loaded,
    total: images.length,
    complete: loaded >= images.length,
    progress:
      images.length === 0 ? 100 : Math.round((loaded / images.length) * 100),
  };
}