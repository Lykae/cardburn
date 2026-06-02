import { useGame } from "../game/logic/useGame";
import joker from "../assets/joker.png";
import { useState } from "react";
import type { Card } from "../game/engine/Card";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import StatPop from "./StatPop";

const uiTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function GameBoard() {
  const game = useGame();

  const [openPile, setOpenPile] = useState<"discard" | "exile" | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<number>(2);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const currentPlayer = game.currentPlayer;

  const playerThemes = [
    {
      bg: "bg-teal-900/60",
      border: "border-teal-500",
    },
    {
      bg: "bg-green-900/60",
      border: "border-green-500",
    },
    {
      bg: "bg-amber-900/60",
      border: "border-amber-500",
    },
    {
      bg: "bg-rose-900/60",
      border: "border-rose-500",
    },
  ];

  const theme = playerThemes[game.currentPlayerIndex % playerThemes.length];

  function startGame() {
    game.startGame(selectedPlayers);
  }

  return (
    <div className="h-dvh w-screen overflow-hidden bg-gray-950 text-white flex flex-col justify-between bg-">
      {/* START SCREEN */}
      {!game.currentEnemy && game.gameStatus === "menu" && (
        <div className="h-full flex flex-col justify-center items-center gap-6">
          <h1 className="text-2xl font-bold">Select Players</h1>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPlayers(n)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedPlayers === n
                    ? "bg-teal-900/60 border-teal-500"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {n} Players
              </motion.button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-green-900/60 border-green-500 border px-6 py-3 rounded-xl font-semibold shadow"
            onClick={startGame}
          >
            Start Game
          </motion.button>
        </div>
      )}

      {/* GAME UI */}
      <AnimatePresence>
        {game.gameStatus === "playing" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={uiTransition}
            className="flex-1 m-2 flex flex-col justify-between"
          >
            {/* TOP BAR */}
            <div className="h-12 md:h-15 md:text-xl flex justify-between gap-2 font-semibold z-40">
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenPile("discard")}
                  className="bg-purple-900/60 rounded-lg border border-purple-500 px-2 py-1"
                >
                  Grave: <AnimatedCounter value={game.discard.length} />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenPile("exile")}
                  className="bg-purple-900/60 rounded-lg border border-purple-500 px-2 py-1"
                >
                  Exile: <AnimatedCounter value={game.exile.length} />
                </motion.button>

                <motion.button className="bg-purple-900/60 rounded-lg border border-purple-500 px-2 py-1">
                  Deck: <AnimatedCounter value={game.getDeckCount()} />
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(true)}
                className="px-2 py-1 w-12 md:w-15 h-12 md:h-15 md:text-4xl bg-purple-900/60 border border-purple-500 rounded-lg text-2xl"
              >
                ☰
              </motion.button>
            </div>

            {/* ENEMY */}
            <AnimatePresence>
              {game.currentEnemy && (
                <motion.div
                  key="enemy"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={uiTransition}
                  className="text-center px-3 pb-2"
                >
                  <div className="mt-2 inline-block bg-red-900/60 border border-red-500 rounded-xl p-3 shadow-lg relative">
                    <div className="w-full flex justify-end">
                      <div className="absolute px-2 py-1 ml-15 md:ml-30 md:text-2xl lg:ml-25 bg-red-900/60 border border-red-500 rounded-lg">
                        <AnimatedCounter value={game.enemyQueue.length} />
                      </div>
                    </div>

                    <StatPop label="HP" value={game.currentEnemy.health} />

                    <StatPop label="STR" value={game.currentEnemy.strength} />

                    <motion.img
                      key={game.currentEnemy.src}
                      src={game.currentEnemy.src}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-[32dvh] h-[46dvh] mx-auto mt-1 rounded-lg border"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION BUTTON */}
            <div className="px-3 flex justify-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className={`${theme.bg} ${theme.border} w-full md:text-2xl lg:w-[40vw] md:h-20 rounded-lg border py-3 font-semibold shadow-lg`}
                onClick={
                  game.postAttackPhase
                    ? game.confirmDiscardPayment
                    : game.attack
                }
              >
                <div className="flex flex-row gap-1 justify-center">
                  {game.getPlayerCount() !== 1 && (
                    <div>P{game.currentPlayerIndex + 1}</div>
                  )}

                  <div>
                    {game.postAttackPhase
                      ? `Discard ${game.getDiscardSelectionValue()}/${game.discardRequirement}`
                      : game.attackSelection.length === 0
                        ? "Yield"
                        : "Attack"}
                  </div>
                </div>
              </motion.button>

              {/* JOKERS */}
              <div className="flex gap-2 justify-end">
                {game.jokers.map((active: boolean, i: number) => (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => game.useJoker(i)}
                    className={`w-12 h-12 p-2 md:w-20 md:h-20 flex items-center justify-center rounded-lg border cursor-pointer ${
                      active
                        ? "bg-purple-900/60 border-purple-500"
                        : "bg-gray-800 opacity-40"
                    }`}
                  >
                    <img className="p-1" src={joker} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* HAND */}
            <div className="px-2 pb-2 flex justify-center">
              <div className="flex overflow-x-auto no-scrollbar pt-5 py-2 px-4">
                <AnimatePresence>
                  {currentPlayer.hand.map((card: Card, index: number) => {
                    const isSelected =
                      game.attackSelection.includes(card.id) ||
                      game.discardSelection.includes(card.id);

                    const isPlayable = game.canPlayCard(card);

                    return (
                      <motion.img
                        key={card.id}
                        layout="position"
                        initial={{
                          opacity: 0,
                          y: 24,
                          scale: 0.96,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -16,
                          scale: 0.96,
                        }}
                        transition={{
                          type: "tween",
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          willChange: "transform, opacity",
                          transformOrigin: "center",
                          transition: "border-color 300ms ease",
                        }}
                        onClick={() =>
                          game.postAttackPhase
                            ? game.toggleDiscardSelect(card)
                            : game.toggleAttackSelect(card)
                        }
                        src={card.src}
                        className={`w-22 md:w-32 lg:w-40 aspect-2.5/3.5 object-cover rounded-lg border shadow-md shrink-0 ${
                          index > 0 ? "-ml-8" : ""
                        } ${
                          isSelected
                            ? "-translate-y-4 border border-yellow-400"
                            : ""
                        } ${
                          isPlayable && !isSelected && !game.postAttackPhase
                            ? "border border-green-400"
                            : game.postAttackPhase
                              ? "border border-blue-400"
                              : "border border-red-400"
                        }`}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER */}
      <AnimatePresence>
        {(game.gameStatus === "won" || game.gameStatus === "lost") && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-80 text-center shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-4">
                {game.gameStatus === "won" ? "Victory!" : "Defeat"}
              </h2>

              <p className="text-gray-300 mb-6">
                {game.gameStatus === "won"
                  ? "You defeated all enemies."
                  : "You could not pay the discard cost."}
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-900/60 border-green-500 border py-3 rounded-xl font-semibold"
                onClick={game.returnToMenu}
              >
                Back to Menu
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PILE MODAL */}
      <AnimatePresence>
        {openPile && (
          <motion.div
            key="pile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setOpenPile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENU */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-[90vw] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-3">
                <button
                  className="bg-red-900/60 border border-red-500 py-3 rounded-xl font-semibold"
                  onClick={() => {
                    setShowMenu(false);
                    game.returnToMenu();
                  }}
                >
                  Start Screen
                </button>

                <button
                  className="bg-purple-900/60 border border-purple-500 py-3 rounded-xl font-semibold"
                  onClick={() => {
                    setShowMenu(false);
                    setShowHelp(true);
                  }}
                >
                  How to Play
                </button>

                <button
                  className="bg-gray-900/60 border border-gray-500 py-3 rounded-xl"
                  onClick={() => setShowMenu(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HELP */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            key="help"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
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
                  On your turn, select cards from your hand to perform an
                  attack.
                </p>

                <p>
                  Abilities scale with card value and can combo up to 10 total.
                </p>

                <p>
                  <strong>Clubs:</strong> double damage <br />
                  <strong>Spades:</strong> reduce enemy strength <br />
                  <strong>Diamonds:</strong> draw cards <br />
                  <strong>Hearts:</strong> recover cards <br />
                  <strong>Flames:</strong> exile combo cards
                </p>
              </div>

              <button
                className="mt-5 w-full bg-gray-900/60 border border-gray-500 py-2 rounded-xl"
                onClick={() => setShowHelp(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
