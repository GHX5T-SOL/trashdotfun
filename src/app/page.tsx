import Link from 'next/link';
import Image from 'next/image';
import TokenStats from '@/components/TokenStats';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-trash-green via-green-800 to-black"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-trash-yellow rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-300 rounded-full opacity-40 animate-spin"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Main Oscar Image */}
          <div className="mb-8 relative">
            <div className="relative inline-block">
              <img
                src="/oscar-hero.svg"
                alt="Oscar the Grouch"
                className="h-64 w-64 rounded-full border-4 border-trash-yellow shadow-2xl animate-trash-bounce"
              />
              {/* Floating trash elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-trash-yellow mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-trash-yellow via-yellow-400 to-orange-400">
              TrashdotFun!
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-green-200 mb-8 max-w-4xl mx-auto leading-relaxed px-4">
            Create your own <span className="text-trash-yellow font-bold">$GOR</span> meme coins on the{' '}
            <span className="text-green-300 font-semibold">Gorbagana Chain</span> in the trashiest way possible! 🗑️
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href="/create-coin">
              <button className="group relative bg-gradient-to-r from-trash-yellow to-yellow-400 text-black font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transition-all duration-300 shadow-2xl border-4 border-green-800 hover:border-green-600">
                <span className="relative z-10">🚀 Create a Coin Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
            
            <Link href="https://t.me/trashdotfun" target="_blank">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transition-all duration-300 shadow-2xl border-4 border-blue-700 hover:border-blue-500">
                📱 Join Our Community
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
            <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-600 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🪙</div>
              <h3 className="text-xl font-bold text-trash-yellow mb-2">Easy Token Creation</h3>
              <p className="text-green-200">Create your meme coin in minutes with our simple interface</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-600 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-trash-yellow mb-2">Gorbagana Network</h3>
              <p className="text-green-200">Built on the fastest and most efficient blockchain</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-600 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-trash-yellow mb-2">Rich Metadata</h3>
              <p className="text-green-200">Full Metaplex support with IPFS storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-900/80 to-trash-green/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <TokenStats />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-gray-900 to-black py-8 px-4 border-t-4 border-trash-yellow">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img
                src="/oscar.svg"
                alt="Oscar the Grouch"
                className="h-10 w-10 rounded-full border-2 border-trash-yellow"
              />
              <div>
                <h3 className="text-lg font-bold text-trash-yellow">TrashdotFun</h3>
                <p className="text-sm text-green-300">Garbage Token Launchpad</p>
              </div>
            </div>
            
            <div className="flex space-x-6">
              <a
                href="https://x.com/trashdotfun_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-trash-yellow hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2"
              >
                <span className="text-xl">𝕏</span>
                <span className="hidden sm:inline">Follow us on X</span>
              </a>
              <a
                href="https://t.me/trashdotfun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-trash-yellow hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2"
              >
                <span className="text-xl">📱</span>
                <span className="hidden sm:inline">Join our Telegram</span>
              </a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Powered by <span className="text-green-400">Gorbagana Chain</span> • 
              Explorer: <a href="https://trashscan.io" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">trashscan.io</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}