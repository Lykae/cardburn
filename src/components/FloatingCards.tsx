import { useEffect, useMemo, useState } from "react";

export default function FloatingCards() {
  const [shuffledCards] = useState(() => {
    const cards = [
      "0_0.png",
      "0_1.png",
      "0_2.png",
      "0_3.png",
      "0_4.png",
      "0_5.png",
      "0_6.png",
      "0_7.png",
      "0_8.png",
      "0_9.png",
      "0_10.png",
      "0_11.png",
      "0_12.png",
      "0_13.png",
      "1_0.png",
      "1_1.png",
      "1_2.png",
      "1_3.png",
      "1_4.png",
      "1_5.png",
      "1_6.png",
      "1_7.png",
      "1_8.png",
      "1_9.png",
      "1_10.png",
      "1_11.png",
      "1_12.png",
      "1_13.png",
      "2_0.png",
      "2_1.png",
      "2_2.png",
      "2_3.png",
      "2_4.png",
      "2_5.png",
      "2_6.png",
      "2_7.png",
      "2_8.png",
      "2_9.png",
      "2_10.png",
      "2_11.png",
      "2_12.png",
      "2_13.png",
      "3_0.png",
      "3_1.png",
      "3_2.png",
      "3_3.png",
      "3_4.png",
      "3_5.png",
      "3_6.png",
      "3_7.png",
      "3_8.png",
      "3_9.png",
      "3_10.png",
      "3_11.png",
      "3_12.png",
      "3_13.png",
      "4_0.png",
      "4_1.png",
      "4_2.png",
      "4_3.png",
      "4_4.png",
      "4_5.png",
      "4_6.png",
      "4_7.png",
      "4_8.png",
      "4_9.png",
      "4_10.png",
      "4_11.png",
      "4_12.png",
      "4_13.png",
    ];

    return [...cards].sort(() => Math.random() - 0.5);
  });

  function useWindowWidth() {
    const [width, setWidth] = useState(() =>
      typeof window === "undefined" ? 1024 : window.innerWidth,
    );

    useEffect(() => {
      const update = () => setWidth(window.innerWidth);
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, []);

    return width;
  }

  const width = useWindowWidth();

  const floatingCount = width < 640 ? 30 : width < 1024 ? 100 : 140;

  const floatingCards = useMemo(() => {
    const expanded: string[] = [];

    while (expanded.length < floatingCount) {
      expanded.push(...shuffledCards);
    }

    return expanded.slice(0, floatingCount);
  }, [floatingCount, shuffledCards]);

  return (
    <div className="absolute inset-0 opacity-10 rotate-[-10deg] scale-125">
      <div className="grid grid-cols-4 md:grid-cols-10 lg:grid-cols-15 gap-2 p-10">
        {floatingCards.map((img, i) => (
          <img
            key={i}
            src={`/cards/${img}`}
            className={`h-24 w-auto object-contain rounded-md animate-pulse opacity-${((40 - i) % 5) * 10}`}
          />
        ))}
      </div>
    </div>
  );
}
