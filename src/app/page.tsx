import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-trash-green flex flex-col items-center justify-between text-center">
      <div className="flex flex-col items-center justify-center flex-grow">
        <Image
          src="/oscar.png"
          alt="Oscar the Grouch"
          width={200}
          height={200}
          style={{ width: 'auto', height: 'auto' }} // Fix aspect ratio warning
          className="mb-6"
        />
        <h1 className="text-5xl font-bold text-trash-yellow mb-4">Welcome to trashdotfun!</h1>
        <p className="text-xl mb-8">Create your own $GOR meme coins on the Gorbagana Chain testnet!</p>
        <Link href="/create-coin">
          <button className="bg-trash-yellow text-black py-3 px-6 rounded-lg text-lg hover:bg-yellow-600">
            Create a Coin Now
          </button>
        </Link>
      </div>
      <footer className="w-full bg-gray-900 py-4">
        <div className="flex justify-center space-x-6">
          <a
            href="https://x.com/trashdotfun_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-trash-yellow hover:underline flex items-center"
          >
            <span className="mr-2">𝕏</span> Follow us on X
          </a>
          <a
            href="https://t.me/trashdotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-trash-yellow hover:underline flex items-center"
          >
            <span className="mr-2">📱</span> Join our Telegram
          </a>
        </div>
      </footer>
    </div>
  );
}