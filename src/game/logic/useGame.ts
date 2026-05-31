import { useRef, useState } from "react";
import { Deck } from "../engine/Deck";
import { CARD_RANK, Card } from "../engine/Card";

type Turn = "Player" | "Enemy";
type PlayMode = "normal" | "ace" | "burn";
type GameStatus = "menu" | "playing" | "won" | "lost";
type PlayerState = {
  hand: Card[];
};

export function useGame() {
  const deckRef = useRef(new Deck());

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  //const [playerHand, setPlayerHand] = useState<Card[]>([]);
  //const [playArea, setPlayArea] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [exile, setExile] = useState<Card[]>([]);

  const [enemyQueue, setEnemyQueue] = useState<any[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<any>(null);

  const [turn, setTurn] = useState<Turn>("Player");
  const [jokers, setJokers] = useState([true, true]);

  const [playMode, setPlayMode] = useState<PlayMode>("normal");
  const [hasAttacked, setHasAttacked] = useState(false);

  const [discardRequirement, setDiscardRequirement] = useState(0);
  const [discardSelection, setDiscardSelection] = useState<string[]>([]);
  const [postAttackPhase, setPostAttackPhase] = useState(false);
  const [attackSelection, setAttackSelection] = useState<string[]>([]);

  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");

  const currentPlayer = players[currentPlayerIndex];

  const setPlayersSafe = (updater: (p: PlayerState[]) => PlayerState[]) => {
    setPlayers((prev) => updater([...prev]));
  };

  const playerHand = currentPlayer?.hand ?? [];

  const [maxHandSize, setMaxHandSize] = useState<number>(8);

  // -----------------------------
  // INIT
  // -----------------------------
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

    //setPlayerHand(d.gameCards.splice(0, 8));
    setAttackSelection([]);
    setDiscard([]);
    setExile([]);

    setPlayMode("normal");
    setHasAttacked(false);
    setDiscardSelection([]);
    setDiscardRequirement(0);
    setPostAttackPhase(false);
  };

  // -----------------------------
  // HELPERS
  // -----------------------------
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

  const emptyHand = () => {
    setPlayersSafe((prev) => {
      const p = prev[currentPlayerIndex];
      p.hand = [];
      return prev;
    });
  };

  const returnToMenu = () => {
    deckRef.current = new Deck();

    setDiscard([]);
    setExile([]);

    setEnemyQueue([]);
    setCurrentEnemy(null);

    setJokers([true, true]);

    setPlayMode("normal");
    setHasAttacked(false);

    setDiscardRequirement(0);
    setDiscardSelection([]);
    setPostAttackPhase(false);
    setAttackSelection([]);

    setGameStatus("menu");
  };

  //const removeFromPlayArea = (id: string) => {
  //  if (postAttackPhase) return;
  //
  //  const card = playArea.find((c) => c.id === id);
  //  if (!card) return;
  //
  //  setPlayArea((prev) => prev.filter((c) => c.id !== id));
  //  setPlayerHand((prev) => [...prev, card]);
  //};

  // -----------------------------
  // DRAW
  // -----------------------------
  const drawCards = (n: number) => {
    const d = deckRef.current;

    setPlayers((prev) => {
      const next = prev.map((p) => ({
        ...p,
        hand: [...p.hand],
      }));

      let playerIterator = currentPlayerIndex;

      while (n > 0) {
        const player = next[playerIterator];

        let handSize = player.hand.length;
        if (playerIterator === currentPlayerIndex) {
          handSize -= attackSelection.length;
        }

        if (handSize < maxHandSize) {
          const card = d.gameCards.shift();
          if (!card) break;

          console.log("----");
          console.log("playerIterator", playerIterator);
          console.log("card", card);
          console.log("----");

          player.hand.push(card);
          n--;
        }

        let someoneCanDraw = false;
        next.forEach((p) => {
          if (p.hand.length < maxHandSize) {
            someoneCanDraw = true;
          }
        });

        if (!someoneCanDraw) break;

        playerIterator = (playerIterator + 1) % next.length;
      }

      return next;
    });
  };

  // -----------------------------
  // RULES
  // -----------------------------
  const canPlayCard = (card: Card) => {
    const active = getAttackCards();

    // ACE MODE
    if (hasAce(active)) {
      if (active.length >= 2) return false;
      if (card.value === 1) return false;
      return true;
    }

    // NORMAL
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

    if (card.suit === "Flames" && active.length >= 1) return true;

    return false;
  };

  // -----------------------------
  // PLAY CARD
  // -----------------------------
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

    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

  // -----------------------------
  // DISCARD SYSTEM
  // -----------------------------
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

  //const moveToDiscard = (cards: Card[]) => {
  //  setDiscard((prev) => [...prev, ...cards]);
  //};

  const confirmDiscardPayment = () => {
    if (!postAttackPhase) return;

    const selectedCards = getSelectedCards();

    const total = selectedCards.reduce((s, c) => s + c.value, 0);
    if (total < discardRequirement) return;

    //currentPlayer.hand.filter((c) => !discardSelection.includes(c.id));
    //
    //moveToDiscard(selectedCards);

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

    //setTurn("Player");
  };

  // -----------------------------
  // ATTACK
  // -----------------------------
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

    setPlayMode("normal");

    // SUIT EFFECTS
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

    setPlayersSafe((prev) => {
      prev[currentPlayerIndex] = {
        ...prev[currentPlayerIndex],
        hand: prev[currentPlayerIndex].hand.filter((c) => !attackIds.has(c.id)),
      };

      return prev;
    });

    setDiscard((old) => [...old, ...cardsToDiscard]);

    //currentPlayer.hand.filter((c) => !attackIds.has(c.id));
    //
    //moveToDiscard(cardsToDiscard);

    const remainingHand = playerHand.filter(
      (c) => !attackSelection.includes(c.id),
    );

    const remainingValue = remainingHand.reduce(
      (sum, card) => sum + card.value,
      0,
    );

    if (remainingValue <= 0) {
      setGameStatus("lost");
      return;
    }

    if (remainingValue <= updated.strength) {
      setGameStatus("lost");
      return;
    }

    setAttackSelection([]);

    // ENEMY DEATH
    if (updated.health <= 0) {
      const d = deckRef.current;

      if (updated.health === 0) {
        d.gameCards.unshift(updated);
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

      //setTurn("Player");
      endTurn();
      return;
    }

    // POST ATTACK DISCARD PHASE

    if (updated.strength <= 0) {
      setDiscardRequirement(0);
      setPostAttackPhase(false);
      endTurn();
      //setTurn("Enemy");
      return;
    }

    setDiscardRequirement(updated.strength);
    setPostAttackPhase(true);
    setDiscardSelection([]);
  };

  // -----------------------------
  // ENEMY TURN END
  // -----------------------------
  const enemyAttackPhase = () => {
    if (turn !== "Enemy") return;

    setDiscardRequirement(0);
    setDiscardSelection([]);
    setPostAttackPhase(false);
    setAttackSelection([]);
  };

  // -----------------------------
  // JOKER
  // -----------------------------
  const useJoker = (i: number) => {
    if (!jokers[i]) return;

    const discarded = playerHand;

    setDiscard((p) => [...p, ...discarded]);

    emptyHand();

    setJokers((p) => {
      const copy = [...p];
      copy[i] = false;
      return copy;
    });

    const d = deckRef.current;
    d.gameCards.push(...discarded);
    d.shuffle(d.gameCards);

    drawCards(maxHandSize);
  };

  // -----------------------------
  // API
  // -----------------------------
  return {
    discard,
    exile,

    currentEnemy,
    enemyQueue,

    turn,
    jokers,

    playMode,
    hasAttacked,

    startGame,
    attack,
    useJoker,
    enemyAttackPhase,

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
  };
}
