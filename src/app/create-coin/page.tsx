import CreateToken from '@/components/CreateToken';

export default function CreateCoin() {
  return (
    <div className="min-h-screen bg-trash-green flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-trash-yellow">Create Your $GOR Meme Coin</h1>
      <CreateToken />
    </div>
  );
}