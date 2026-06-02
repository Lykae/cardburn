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

  getCardSrc(suitIndex: number, value: number) {
    return `/cards/${suitIndex}_${value}.png`;
  }

  generateDecks() {
    this.suits.forEach((suit, suitIndex) => {
      for (let v = 2; v <= 10; v++) {
        this.gameCards.push(
          new Card(
            suit,
            this.getCardSrc(suitIndex, v-2),
            v
          )
        );
      }

      this.gameCards.push(
        new Card(
          suit,
          this.getCardSrc(suitIndex, 12),
          1
        )
      );

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

  shuffle(deck: Card[]) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}