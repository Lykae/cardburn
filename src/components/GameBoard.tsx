import { useGame } from "../game/logic/useGame";
import joker from "../assets/joker.png";
import { useState } from "react";

export default function GameBoard() {
  const game = useGame();

  const [openPile, setOpenPile] = useState<"discard" | "exile" | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number>(2);
  const [showPassScreen, setShowPassScreen] = useState(false);

  const inGame = !!game.currentEnemy;

  const currentPlayer = game.currentPlayer;

  function startGame() {
    game.startGame(selectedPlayers);
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-950 text-white flex flex-col justify-between">
      {/* ================= START SCREEN ================= */}
      {!inGame && (
        <div className="h-full flex flex-col justify-center items-center gap-6">
          <h1 className="text-2xl font-bold">Select Players</h1>

          <div className="flex gap-3">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedPlayers(n)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedPlayers === n
                    ? "bg-teal-600 border-teal-300"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {n} Players
              </button>
            ))}
          </div>

          <button
            className="bg-green-600 px-6 py-3 rounded-xl font-semibold shadow"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      )}

      {/* ================= GAME UI ================= */}
      {inGame && (
        <>
          {/* TOP BAR */}
          <div className="h-12 absolute top-2 left-2 flex gap-2 font-semibold z-40">
            <button
              onClick={() => setOpenPile("discard")}
              className="bg-teal-900/60 rounded-lg border border-teal-500 px-2 py-1"
            >
              Discard: {game.discard.length}
            </button>

            <button
              onClick={() => setOpenPile("exile")}
              className="bg-teal-900/60 rounded-lg border border-teal-500 px-2 py-1"
            >
              Exile: {game.exile.length}
            </button>

            {/* CURRENT PLAYER INDICATOR */}
            <button className="px-2 py-1 bg-purple-900/60 border border-purple-500 rounded-lg">
              P{game.currentPlayerIndex + 1} Turn
            </button>
          </div>

          {/* JOKERS */}
          <div className="flex gap-2 justify-end p-2">
            {game.jokers.map((active: boolean, i: number) => (
              <div
                key={i}
                onClick={() => game.useJoker(i)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border cursor-pointer ${
                  active
                    ? "bg-teal-900/60 border-teal-500"
                    : "bg-gray-800 opacity-40"
                }`}
              >
                <img className="p-1" src={joker} />
              </div>
            ))}
          </div>

          {/* ENEMY */}
          <div className="text-center px-3 pb-2">
            {game.currentEnemy && (
              <div className="mt-2 inline-block bg-red-900/60 border border-red-500 rounded-xl p-3 shadow-lg">
                <p className="text-lg">HP: {game.currentEnemy.health}</p>
                <p className="text-sm">STR: {game.currentEnemy.strength}</p>
                <img
                  src={game.currentEnemy.src}
                  className="w-[32vh] mx-auto mt-1 rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* ACTION BUTTON */}
          <div className="px-3 flex justify-center">
            <button
              className="w-full lg:w-40 md:h-20 bg-teal-900/60 rounded-lg border border-teal-500 py-3 font-semibold shadow-lg"
              onClick={
                game.postAttackPhase ? game.confirmDiscardPayment : game.attack
              }
            >
              {game.postAttackPhase
                ? `Discard ${game.getDiscardSelectionValue()}/${game.discardRequirement}`
                : game.attackSelection.length === 0
                  ? "Yield"
                  : "Attack"}
            </button>
          </div>

          {/* HAND */}
          <div className="px-2 pb-2 flex justify-center">
            <div className="flex overflow-x-auto no-scrollbar pt-5 py-2 px-4">
              {currentPlayer.hand.map((card, index) => (
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
                    game.attackSelection.includes(card.id) ||
                    game.discardSelection.includes(card.id)
                      ? "-translate-y-4 ring-2 ring-yellow-400"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </>
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
              className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-semibold"
              onClick={game.returnToMenu}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* PASS DEVICE OVERLAY */}
      {showPassScreen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <h1 className="text-3xl font-bold text-center">
            Pass to Player {game.currentPlayerIndex + 1}
          </h1>
        </div>
      )}

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
                (card: any) => (
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
    </div>
  );
}
