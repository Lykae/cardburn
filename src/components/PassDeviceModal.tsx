type Props = {
  playerName: string;
  onReady: () => void;
};

export default function PassDeviceModal({ playerName, onReady }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">
      <div className="rounded-xl bg-white p-6">
        <h2 className="text-xl font-bold">Pass Device</h2>
        <p>Pass the device to {playerName}</p>
        <button onClick={onReady}>Ready</button>
      </div>
    </div>
  );
}
