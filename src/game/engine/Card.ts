import { v4 } from "uuid";

export class Card {
  id: string;
  suit: string;
  src: string;
  value: number;

  constructor(suit: string, src: string, value: number) {
    this.id = v4();
    this.suit = suit;
    this.src = src;
    this.value = value;
  }
}

export const CARD_RANK = {
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  ACE: 12,
  JOKER: 13,
};