import { Card } from "./Card";
import { Enemy } from "./Enemy";

export class Deck {
  gameCards: Card[] = [];
  enemyJacks: Enemy[] = [];
  enemyQueens: Enemy[] = [];
  enemyKings: Enemy[] = [];

  suits = ["Spades", "Hearts", "Diamonds", "Clubs", "Flames"];

  enemyStats = {
    jack: { health: 20, str: 10 },
    queen: { health: 30, str: 15 },
    king: { health: 40, str: 20 },
  };

  // -----------------------------
  // IMAGE PATH GENERATOR
  // -----------------------------
  getCardSrc(suitIndex: number, value: number) {
    return `/cards/${suitIndex}_${value}.png`;
  }

  generateDecks() {
    this.suits.forEach((suit, suitIndex) => {
      // -----------------------------
      // NORMAL CARDS (1–8)
      // -----------------------------
      for (let v = 2; v <= 10; v++) {
        this.gameCards.push(
          new Card(
            suit,
            this.getCardSrc(suitIndex, v-2),
            v
          )
        );
      }

      // -----------------------------
      // ACE (12)
      // -----------------------------
      this.gameCards.push(
        new Card(
          suit,
          this.getCardSrc(suitIndex, 12),
          1
        )
      );

      // -----------------------------
      // MONARCHS (9–11 are special)
      // -----------------------------
      //this.gameCards.push(
      //  new Card(
      //    suit,
      //    this.getCardSrc(suitIndex, 9),
      //    10
      //  )
      //);
//
      //this.gameCards.push(
      //  new Card(
      //    suit,
      //    this.getCardSrc(suitIndex, 10),
      //    15
      //  )
      //);
//
      //this.gameCards.push(
      //  new Card(
      //    suit,
      //    this.getCardSrc(suitIndex, 11),
      //    20
      //  )
      //);

      // -----------------------------
      // ENEMIES (J/Q/K)
      // stored as 11/12/13 style images depending on your set
      // -----------------------------
      this.enemyJacks.push(
        new Enemy(
          suit,
          this.getCardSrc(suitIndex, 9),
          this.enemyStats.jack.health,
          this.enemyStats.jack.str,
          "Jack"
        )
      );

      this.enemyQueens.push(
        new Enemy(
          suit,
          this.getCardSrc(suitIndex, 10),
          this.enemyStats.queen.health,
          this.enemyStats.queen.str,
          "Queen"
        )
      );

      this.enemyKings.push(
        new Enemy(
          suit,
          this.getCardSrc(suitIndex, 11),
          this.enemyStats.king.health,
          this.enemyStats.king.str,
          "King"
        )
      );
    });
  }

  shuffle(deck: any[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}