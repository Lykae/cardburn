import { useGame } from "../game/logic/useGame";
import joker from "../assets/joker.png";
import { useState } from "react";
import type { Card } from "../game/engine/Card";

export default function GameBoard() {
  const game = useGame();

  const [openPile, setOpenPile] = useState<"discard" | "exile" | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number>(2);
  const [showHelp, setShowHelp] = useState(false);

  const inGame = !!game.currentEnemy;

  const currentPlayer = game.currentPlayer;

  function startGame() {
    game.startGame(selectedPlayers);
  }

  return (
    <div className="h-dvh w-screen overflow-hidden bg-gray-950 text-white flex flex-col justify-between">
      {/* START SCREEN */}
      {!inGame && (
        <div className="h-full flex flex-col justify-center items-center gap-6">
          <h1 className="text-2xl font-bold">Select Players</h1>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedPlayers(n)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedPlayers === n
                    ? "bg-teal-900/60 border-teal-500"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {n} Players
              </button>
            ))}
          </div>

          <button
            className="bg-green-900/60 border-green-500 border px-6 py-3 rounded-xl font-semibold shadow"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      )}

      {/* ================= GAME UI ================= */}
      {inGame && (
        <div className="flex-1 m-2 flex flex-col justify-between">
          {/* TOP BAR */}
          <div className="h-12 md:h-15 md:text-xl flex justify-between gap-2 font-semibold z-40">
            <div className="flex gap-2 font-semibold z-40">
              <button
                onClick={() => setOpenPile("discard")}
                className="bg-teal-900/60 rounded-lg border border-teal-500 px-2 py-1"
              >
                Grave: {game.discard.length}
              </button>

              <button
                onClick={() => setOpenPile("exile")}
                className="bg-teal-900/60 rounded-lg border border-teal-500 px-2 py-1"
              >
                Exile: {game.exile.length}
              </button>

              <button className="bg-teal-900/60 rounded-lg border border-teal-500 px-2 py-1">
                Deck: {game.getDeckCount()}
              </button>
            </div>

            <div className="flex gap-2 font-semibold z-40">
              <button
                onClick={() => setShowHelp(true)}
                className="px-2 py-1 w-12 md:w-15 h-12 md:h-15 bg-purple-900/60 border border-purple-500 rounded-lg text-3xl"
              >
                ?
              </button>
              {/*}
              <button className="px-2 py-1 bg-purple-900/60 border border-purple-500 rounded-lg">
                P{game.currentPlayerIndex + 1} Turn
              </button>
              */}
            </div>
          </div>

          {/* ENEMY */}
          <div className="text-center px-3 pb-2">
            {game.currentEnemy && (
              <div className="mt-2 inline-block bg-red-900/60 border border-red-500 rounded-xl p-3 shadow-lg">

                <button className="absolute px-2 py-1 ml-15 md:ml-25 bg-red-900/60 border border-red-500 rounded-lg">
                  {game.getEnemyCount()}
                </button>
                <p className="text-lg md:text-2xl">
                  HP: {game.currentEnemy.health}
                </p>
                <p className="text-sm md:text-lg">
                  STR: {game.currentEnemy.strength}
                </p>
                <img
                  src={game.currentEnemy.src}
                  className="w-[32vh] mx-auto mt-1 rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <div className="px-3 flex justify-center gap-3">
            <button
              className="w-full md:text-2xl lg:w-[40vw] md:h-20 bg-teal-900/60 rounded-lg border border-teal-500 py-3 font-semibold shadow-lg"
              onClick={
                game.postAttackPhase ? game.confirmDiscardPayment : game.attack
              }
            >
              <div className="flex flex-row gap-1 justify-center">
                <div>P{game.currentPlayerIndex + 1}</div>

                <div>
                  {game.postAttackPhase
                    ? `Discard ${game.getDiscardSelectionValue()}/${game.discardRequirement}`
                    : game.attackSelection.length === 0
                      ? "Yield"
                      : "Attack"}
                </div>
              </div>
            </button>

            {/* JOKERS */}
            <div className="flex gap-2 justify-end">
              {game.jokers.map((active: boolean, i: number) => (
                <div
                  key={i}
                  onClick={() => game.useJoker(i)}
                  className={`w-12 h-12 p-2 md:w-20 md:h-20 flex items-center justify-center rounded-lg border cursor-pointer ${
                    active
                      ? "bg-purple-900/60 border-purple-500"
                      : "bg-gray-800 opacity-40"
                  }`}
                >
                  <img className="p-1" src={joker} />
                </div>
              ))}
            </div>
          </div>

          {/* HAND */}
          <div className="px-2 pb-2 flex justify-center">
            <div className="flex overflow-x-auto no-scrollbar pt-5 py-2 px-4">
              {currentPlayer.hand.map((card, index) => {
                const isSelected =
                  game.attackSelection.includes(card.id) ||
                  game.discardSelection.includes(card.id);

                const isPlayable = game.canPlayCard(card);

                return (
                  <img
                    key={card.id}
                    src={card.src}
                    onClick={() =>
                      game.postAttackPhase
                        ? game.toggleDiscardSelect(card)
                        : game.toggleAttackSelect(card)
                    }
                    className={`w-22 md:w-32 lg:w-40 aspect-2.5/3.5 object-cover rounded-lg border shadow-md shrink-0 hover:-translate-y-4 ${
                      index > 0 ? "-ml-8" : ""
                    } ${
                      isSelected ? "-translate-y-4 ring-2 ring-yellow-400" : ""
                    } ${
                      isPlayable && !isSelected && !game.postAttackPhase
                        ? "ring-2 ring-green-500/60 hover:ring-green-400"
                        : "ring-1 ring-black"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(game.gameStatus === "won" || game.gameStatus === "lost") && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-80 text-center shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              {game.gameStatus === "won" ? "Victory!" : "Defeat"}
            </h2>

            <p className="text-gray-300 mb-6">
              {game.gameStatus === "won"
                ? "You defeated all enemies."
                : "You could not pay the discard cost."}
            </p>

            <button
              className="w-full bg-green-900/60 border-green-500 border py-3 rounded-xl font-semibold"
              onClick={game.returnToMenu}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* PASS DEVICE OVERLAY
      {showPassScreen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <h1 className="text-3xl font-bold text-center">
            Pass to Player {game.currentPlayerIndex + 1}
          </h1>
        </div>
      )} */}

      {/* PILES MODAL */}
      {openPile && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setOpenPile(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-4 w-[90vw] max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-3 capitalize">{openPile}</h2>

            <div className="grid grid-cols-3 gap-2">
              {(openPile === "discard" ? game.discard : game.exile).map(
                (card: Card) => (
                  <img
                    key={card.id}
                    src={card.src}
                    className="w-full rounded border border-gray-700"
                  />
                ),
              )}
            </div>

            <button
              className="mt-4 w-full bg-gray-700 py-2 rounded"
              onClick={() => setOpenPile(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[90vw] max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">How to Play</h2>

            <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
              <p>
                <strong>Goal:</strong> Defeat all enemies by reducing their HP
                to 0.
              </p>

              <p>
                On your turn, select cards from your hand to perform an attack
                equal to their value. Every card also has an ability, which will
                be cast after attacking, unless it's the same suit as the enemy.
              </p>

              <p>
                Abilities get stronger as the value of the card played
                increases. You can also combo cards with the same value up to a
                combined value of 10 - their abilities will be combined. The
                same applies to the ace, which you can use combined with another
                card to trigger both abilities.
              </p>

              <p>
                <strong>Clubs: </strong> double damage. <br />
                <strong>Spades: </strong> reduce enemy strength. <br />
                <strong>Diamonds: </strong> draw cards. <br />
                <strong>Hearts: </strong> recover cards. <br />
                <strong>Flames: </strong> combine with card and exile both.{" "}
                <br />
              </p>

              <p>
                After attacking, discard cards with a combined value of the
                enemies strength or more.
              </p>

              <p>Joker discards your hand and draws to max hand size.</p>

              <p>
                Be careful: if you cannot pay discard costs or your hand is
                empty, you lose the game.
              </p>
            </div>

            <button
              className="mt-5 w-full bg-gray-700 py-2 rounded"
              onClick={() => setShowHelp(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
