import { useRef, useState } from "react";
import { Deck } from "../engine/Deck";
import { CARD_RANK, Card } from "../engine/Card";

type Turn = "Player" | "Enemy";
type PlayMode = "normal" | "ace" | "burn";
type GameStatus = "menu" | "playing" | "won" | "lost";

export function useGame() {
  const deckRef = useRef(new Deck());

  const [playerHand, setPlayerHand] = useState<Card[]>([]);
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

  // -----------------------------
  // INIT
  // -----------------------------
  const startGame = () => {
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

    setEnemyQueue(queue);
    setCurrentEnemy(queue.shift() || null);

    setPlayerHand(d.gameCards.splice(0, 8));
    setAttackSelection([]);
    setDiscard([]);
    setExile([]);

    setTurn("Player");
    setPlayMode("normal");
    setHasAttacked(false);
    setDiscardSelection([]);
    setDiscardRequirement(0);
    setPostAttackPhase(false);
  };

  // -----------------------------
  // HELPERS
  // -----------------------------
  const hasAce = (cards: Card[]) =>
    cards.some((c) => c.value === CARD_RANK.ACE);

  const getSelectedCards = () =>
    playerHand.filter((c) => c && discardSelection.includes(c.id));

  const getDiscardSelectionValue = () => {
    let count = 0;
    getSelectedCards().forEach((card) => (count += card.value));
    return count;
  };

  const getHandValue = () =>
    playerHand.reduce((sum, card) => sum + card.value, 0);

  const getAttackCards = () =>
    playerHand.filter((c) => attackSelection.includes(c.id));

  const returnToMenu = () => {
    deckRef.current = new Deck();

    setPlayerHand([]);
    setDiscard([]);
    setExile([]);

    setEnemyQueue([]);
    setCurrentEnemy(null);

    setTurn("Player");
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
    const drawn = d.gameCards.splice(0, n);

    setPlayerHand((prev) => [...prev, ...drawn]);
  };

  // -----------------------------
  // RULES
  // -----------------------------
  const canPlayCard = (card: Card) => {
    const active = getAttackCards();

    if (turn !== "Player") return false;

    // ACE MODE
    if (hasAce(active)) {
      if (active.length >= 2) return false;
      if (card.value === CARD_RANK.ACE) return false;
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

    return false;
  };

  // -----------------------------
  // PLAY CARD
  // -----------------------------
  const toggleAttackSelect = (card: Card) => {
    if (postAttackPhase) return;
    if (turn !== "Player") return;

    const isSelected = attackSelection.includes(card.id);

    if (isSelected) {
      setAttackSelection((prev) => prev.filter((id) => id !== card.id));
      return;
    }

    if (!canPlayCard(card)) return;

    setAttackSelection((prev) => [...prev, card.id]);
  };

  // -----------------------------
  // DISCARD SYSTEM
  // -----------------------------
  const toggleDiscardSelect = (card: Card) => {
    if (!postAttackPhase) return;

    const isSelected = discardSelection.includes(card.id);

    if (isSelected) {
      setDiscardSelection((prev) => prev.filter((id) => id !== card.id));
      return;
    }

    // compute from CURRENT selection ONLY
    const selectedCards = playerHand.filter(
      (c) => c && discardSelection.includes(c.id),
    );

    const currentSum = selectedCards.reduce((s, c) => s + c.value, 0);

    if (currentSum >= discardRequirement) return;

    setDiscardSelection((prev) => [...prev, card.id]);
  };

  const moveToDiscard = (cards: Card[]) => {
    setDiscard((prev) => [...prev, ...cards]);
  };

  const confirmDiscardPayment = () => {
    if (!postAttackPhase) return;

    const selectedCards = getSelectedCards();

    const total = selectedCards.reduce((s, c) => s + c.value, 0);
    if (total < discardRequirement) return;

    setPlayerHand((prev) =>
      prev.filter((c) => !discardSelection.includes(c.id)),
    );

    moveToDiscard(selectedCards);

    setDiscardRequirement(0);
    setDiscardSelection([]);
    setPostAttackPhase(false);
    setAttackSelection([]);
    setHasAttacked(false);
    setTurn("Player");
  };

  // -----------------------------
  // ATTACK
  // -----------------------------
  const attack = () => {
    if (!currentEnemy || turn !== "Player") return;

    const resolvedCards = getAttackCards();

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
          setExile((prev) => [...prev, ...resolvedCards.slice(0, 2)]);

          const exiledIds = new Set(exiled.map((c) => c.id));

          cardsToDiscard = resolvedCards.filter((c) => !exiledIds.has(c.id));
        }
      }
    }

    setCurrentEnemy(updated);

    
    const attackIds = new Set(resolvedCards.map((c) => c.id));

    setPlayerHand((prev) => prev.filter((c) => !attackIds.has(c.id)));

    moveToDiscard(cardsToDiscard);

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

    if (remainingValue < updated.strength) {
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


      setTurn("Player");
      return;
    }

    // POST ATTACK DISCARD PHASE

    if (updated.strength <= 0) {
      setDiscardRequirement(0);
      setPostAttackPhase(false);
      setTurn("Enemy");
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
    setHasAttacked(false);
    setTurn("Player");
  };

  // -----------------------------
  // JOKER
  // -----------------------------
  const useJoker = (i: number) => {
    if (!jokers[i]) return;

    const discarded = playerHand;

    setDiscard((p) => [...p, ...discarded]);
    setPlayerHand([]);

    setJokers((p) => {
      const copy = [...p];
      copy[i] = false;
      return copy;
    });

    const d = deckRef.current;
    d.gameCards.push(...discarded);
    d.shuffle(d.gameCards);

    drawCards(8);
  };

  // -----------------------------
  // API
  // -----------------------------
  return {
    playerHand,
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
  };
}
