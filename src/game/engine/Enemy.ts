import { Card } from "./Card";

export class Enemy extends Card {
  health: number;
  strength: number;
  enemyLabel: string;

  constructor(suit: string, src: string, hp: number, str: number, label: string) {
    super(suit, src, 0);
    this.health = hp;
    this.strength = str;
    this.enemyLabel = label;
  }
}