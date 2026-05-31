import type { Card } from "./Card";

export type Player = {
  id: string;
  name: string;
  hand: Card[];
};
