import { useRef, useState } from "react";
import { Deck } from "../engine/Deck";
import { Card } from "../engine/Card";
import type { Enemy } from "../engine/Enemy";

type GameStatus = "menu" | "playing" | "won" | "lost";
type PlayerState = {
  hand: Card[];
};

export function useGame() {
  const deckRef = useRef(new Deck());

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [discard, setDiscard] = useState<Card[]>([]);
  const [exile, setExile] = useState<Card[]>([]);

  const [enemyQueue, setEnemyQueue] = useState<Enemy[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(null);

  const [jokers, setJokers] = useState([true, true]);

  const [hasAttacked, setHasAttacked] = useState(false);

  const [discardRequirement, setDiscardRequirement] = useState(0);
  const [discardSelection, setDiscardSelection] = useState<string[]>([]);
  const [postAttackPhase, setPostAttackPhase] = useState(false);
  const [attackSelection, setAttackSelection] = useState<string[]>([]);

  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");

  const currentPlayer = players[currentPlayerIndex];

  const setPlayersSafe = (updater: (p: PlayerState[]) => PlayerState[]) => {
    setPlayers((prev) =>
      updater(
        prev.map((p) => ({
          ...p,
          hand: [...p.hand],
        })),
      ),
    );
  };

  const playerHand = currentPlayer?.hand ?? [];

  const [maxHandSize, setMaxHandSize] = useState<number>(8);

  const startGame = (playerCount: number) => {
    setGameStatus("playing");
    const d = deckRef.current;

    d.generateDecks();
    d.shuffle(d.gameCards);

    const jacks = [...d.enemyJacks];
    const queens = [...d.enemyQueens];
    const kings = [...d.enemyKings];

    d.shuffle(jacks);
    d.shuffle(queens);
    d.shuffle(kings);

    const queue = [...jacks, ...queens, ...kings];

    let computedMaxHandSize = 8;

    if (playerCount === 2) computedMaxHandSize = 7;
    else if (playerCount === 3) computedMaxHandSize = 6;
    else if (playerCount === 4) computedMaxHandSize = 5;
    setMaxHandSize(computedMaxHandSize);

    const newPlayers: PlayerState[] = Array.from(
      { length: playerCount },
      () => ({
        hand: d.gameCards.splice(0, computedMaxHandSize),
      }),
    );

    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);

    setEnemyQueue(queue);
    setCurrentEnemy(queue.shift() || null);

    setAttackSelection([]);
    setDiscard([]);
    setExile([]);

    setHasAttacked(false);
    setDiscardSelection([]);
    setDiscardRequirement(0);
    setPostAttackPhase(false);
  };

  const hasAce = (cards: Card[]) => cards.some((c) => c.value === 1);

  const getSelectedCards = () =>
    playerHand.filter((c) => c && discardSelection.includes(c.id));

  const getDiscardSelectionValue = () => {
    let count = 0;
    getSelectedCards().forEach((card) => (count += card.value));
    return count;
  };

  const getAttackCards = () =>
    currentPlayer.hand.filter((c) => attackSelection.includes(c.id));

  const returnToMenu = () => {
    deckRef.current = new Deck();

    setDiscard([]);
    setExile([]);

    setEnemyQueue([]);
    setCurrentEnemy(null);

    setJokers([true, true]);

    setHasAttacked(false);

    setDiscardRequirement(0);
    setDiscardSelection([]);
    setPostAttackPhase(false);
    setAttackSelection([]);

    setGameStatus("menu");
  };

  const drawCards = (n: number) => {
    const d = deckRef.current;

    setPlayersSafe((prev) => {
      const next = prev.map((p) => ({
        ...p,
        hand: [...p.hand],
      }));

      let playerIterator = currentPlayerIndex;

      while (n > 0) {
        const player = next[playerIterator];

        let handSize = player.hand.length;
        if (playerIterator === currentPlayerIndex) {
          handSize = player.hand.filter(
            (c) => !attackSelection.includes(c.id),
          ).length;
        }

        if (handSize < maxHandSize) {
          const card = d.gameCards.shift();
          if (!card) break;

          player.hand.push(card);
          n--;
        }

        let someoneCanDraw = false;
        next.forEach((p, i) => {
          let handSize = p.hand.length;
          if (i === currentPlayerIndex) {
            handSize = p.hand.filter(
              (c) => !attackSelection.includes(c.id),
            ).length;
          }
          if (handSize < maxHandSize) {
            someoneCanDraw = true;
          }
        });

        if (!someoneCanDraw) break;

        playerIterator = (playerIterator + 1) % next.length;
      }

      return next;
    });
  };

  const canPlayCard = (card: Card) => {
    const active = getAttackCards();

    if (hasAce(active)) {
      if (active.length >= 2) return false;
      if (card.value === 1) return false;
      return true;
    } else if (card.value === 1) {
      if (active.length > 1) return false;
      return true;
    }

    if (active.length === 0) return true;

    const sameValue = active.every((c) => c.value === card.value);

    if (sameValue) {
      const sum = active.reduce((a, c) => a + c.value, 0);
      if (sum + card.value <= 10) return true;
    }

    if (
      active.some((c) => c.suit === "Flames") &&
      currentEnemy?.suit !== "Flames"
    ) {
      if (active.length >= 2) return false;
      return true;
    }

    if (
      card.suit === "Flames" &&
      active.length >= 1 &&
      currentEnemy?.suit !== "Flames"
    )
      return true;

    return false;
  };

  const toggleAttackSelect = (card: Card) => {
    if (postAttackPhase) return;

    setAttackSelection((prev) => {
      const isSelected = prev.includes(card.id);

      if (isSelected) {
        return prev.filter((id) => id !== card.id);
      }

      if (!canPlayCard(card)) return prev;

      return [...prev, card.id];
    });
  };

  const endTurn = () => {
    setAttackSelection([]);
    setDiscardSelection([]);

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    setCurrentPlayerIndex(nextPlayerIndex);
  };

  const toggleDiscardSelect = (card: Card) => {
    if (!postAttackPhase) return;

    setDiscardSelection((prev) => {
      const isSelected = prev.includes(card.id);

      if (isSelected) {
        return prev.filter((id) => id !== card.id);
      }

      const selectedCards = currentPlayer.hand.filter((c) =>
        prev.includes(c.id),
      );

      const currentSum = selectedCards.reduce((s, c) => s + c.value, 0);

      if (currentSum >= discardRequirement) return prev;

      return [...prev, card.id];
    });
  };

  const confirmDiscardPayment = () => {
    if (!postAttackPhase) return;

    const selectedCards = getSelectedCards();

    const total = selectedCards.reduce((s, c) => s + c.value, 0);
    if (total < discardRequirement) return;

    setPlayersSafe((prev) => {
      prev[currentPlayerIndex] = {
        ...prev[currentPlayerIndex],
        hand: prev[currentPlayerIndex].hand.filter(
          (c) => !discardSelection.includes(c.id),
        ),
      };

      return prev;
    });

    setDiscard((old) => [...old, ...selectedCards]);

    setDiscardRequirement(0);
    setDiscardSelection([]);
    setPostAttackPhase(false);
    setAttackSelection([]);
    endTurn();
  };

  const checkCanDiscard = () => {
    const remainingValue = playerHand.reduce(
      (sum, card) => sum + card.value,
      0,
    );

    return remainingValue > currentEnemy.strength;
  };

  const attack = () => {
    if (!currentEnemy) return;

    const resolvedCards = currentPlayer.hand.filter((c) =>
      attackSelection.includes(c.id),
    );

    let cardsToDiscard = [...resolvedCards];

    const damage = resolvedCards.reduce((s, c) => s + c.value, 0);

    const updated = {
      ...currentEnemy,
      health: currentEnemy.health - damage,
    };

    if (resolvedCards.length > 0) {
      if (
        resolvedCards.some(
          (c) => c.suit === "Diamonds" && currentEnemy?.suit !== "Diamonds",
        )
      ) {
        drawCards(damage);
      }

      if (
        resolvedCards.some(
          (c) => c.suit === "Hearts" && currentEnemy?.suit !== "Hearts",
        )
      ) {
        const pool = [...discard];
        const recovered: Card[] = [];

        for (let i = 0; i < damage && pool.length; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          recovered.push(pool.splice(idx, 1)[0]);
        }

        setDiscard(pool);
        deckRef.current.gameCards.push(...recovered);
        deckRef.current.shuffle(deckRef.current.gameCards);
      }

      if (
        resolvedCards.some(
          (c) => c.suit === "Spades" && currentEnemy?.suit !== "Spades",
        )
      ) {
        if (updated.strength - damage < 0) {
          updated.strength = 0;
        } else {
          updated.strength -= damage;
        }
      }

      if (
        resolvedCards.some(
          (c) => c.suit === "Clubs" && currentEnemy?.suit !== "Clubs",
        )
      ) {
        updated.health -= damage;
      }

      if (
        resolvedCards.some((c) => c.suit === "Flames") &&
        currentEnemy?.suit !== "Flames"
      ) {
        if (resolvedCards.length >= 2) {
          const exiled = resolvedCards.slice(0, 2);
          setExile((prev) => [...prev, ...exiled]);

          const exiledIds = new Set(exiled.map((c) => c.id));

          setPlayersSafe((prev) => {
            prev[currentPlayerIndex] = {
              ...prev[currentPlayerIndex],
              hand: prev[currentPlayerIndex].hand.filter(
                (c) => !exiledIds.has(c.id),
              ),
            };

            return prev;
          });

          cardsToDiscard = cardsToDiscard.filter((c) => !exiledIds.has(c.id));
        }
      }
    }

    setCurrentEnemy(updated);

    const attackIds = new Set(cardsToDiscard.map((c) => c.id));
    console.log("attackIds", attackIds);

    setPlayersSafe((prev) => {
      prev[currentPlayerIndex] = {
        ...prev[currentPlayerIndex],
        hand: prev[currentPlayerIndex].hand.filter((c) => !attackIds.has(c.id)),
      };

      return prev;
    });

    setDiscard((old) => [...old, ...cardsToDiscard]);

    setAttackSelection([]);

    if (updated.health <= 0) {
      const d = deckRef.current;

      if (updated.health === 0) {
        setTimeout(() => {
          d.gameCards.unshift(updated);
        }, 0);
      }

      setEnemyQueue((prev) => {
        const copy = [...prev];
        const next = copy.shift() || null;

        if (!next) {
          setCurrentEnemy(null);
          setGameStatus("won");
        } else {
          setCurrentEnemy(next);
        }

        return copy;
      });

      endTurn();
      return;
    }

    if (updated.strength <= 0) {
      setDiscardRequirement(0);
      setPostAttackPhase(false);
      endTurn();
      return;
    }

    setDiscardRequirement(updated.strength);
    setPostAttackPhase(true);
    setDiscardSelection([]);

    setTimeout(checkCanDiscard, 0);
  };

  const useJoker = (i: number) => {
    if (!jokers[i]) return;

    const d = deckRef.current;

    setPlayersSafe((prev) => {
      const next = [...prev];

      const player = next[currentPlayerIndex];

      const discarded = [...player.hand];

      setDiscard((p) => [...p, ...discarded]);

      d.gameCards.push(...discarded);
      d.shuffle(d.gameCards);

      player.hand = d.gameCards.splice(0, maxHandSize);

      return next;
    });

    setJokers((p) => {
      const copy = [...p];
      copy[i] = false;
      return copy;
    });
  };

  const getDeckCount = () => {
    return deckRef.current.gameCards.length;
  };

  const getPlayerCount = () => {
    return players.length;
  };

  return {
    discard,
    exile,

    currentEnemy,
    enemyQueue,

    jokers,

    hasAttacked,

    startGame,
    attack,
    useJoker,

    toggleDiscardSelect,
    confirmDiscardPayment,
    getDiscardSelectionValue,

    toggleAttackSelect,
    attackSelection,

    postAttackPhase,
    discardSelection,
    discardRequirement,

    gameStatus,
    returnToMenu,

    currentPlayerIndex,
    currentPlayer,
    endTurn,
    canPlayCard,
    getDeckCount,
    getPlayerCount,
  };
}
