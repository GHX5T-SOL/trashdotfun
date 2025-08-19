'use client';

import React from 'react';

export default function TokenStats() {
  // Mock data - in a real app, this would come from an API
  const stats = [
    { label: 'Total Tokens', value: '1,337', icon: '🪙', color: 'text-trash-yellow' },
    { label: 'Active Users', value: '420', icon: '👥', color: 'text-green-400' },
    { label: 'Total Volume', value: '$69M', icon: '📊', color: 'text-blue-400' },
    { label: 'Network Fee', value: '0.001 GOR', icon: '⚡', color: 'text-purple-400' },
  ];

  const trendingTokens = [
    { name: 'OscarCoin', symbol: 'OSCAR', change: '+420%', volume: '$2.1M' },
    { name: 'GarbageGold', symbol: 'GARB', change: '+69%', volume: '$1.8M' },
    { name: 'TrashToken', symbol: 'TRASH', change: '+1337%', volume: '$3.2M' },
    { name: 'RecycleCoin', symbol: 'RECYC', change: '+88%', volume: '$900K' },
  ];

  return (
    <div className="space-y-8">
      {/* Platform Statistics */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">
          🚀 Platform Statistics
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-600 hover:scale-105 transition-transform duration-300 card-hover"
            >
              <div className={`text-4xl mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-green-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Tokens */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">
          🔥 Trending Tokens
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-green-600">
                <th className="text-left p-4 text-green-200 font-bold">Token</th>
                <th className="text-left p-4 text-green-200 font-bold">Symbol</th>
                <th className="text-right p-4 text-green-200 font-bold">24h Change</th>
                <th className="text-right p-4 text-green-200 font-bold">Volume</th>
                <th className="text-center p-4 text-green-200 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {trendingTokens.map((token, index) => (
                <tr 
                  key={index}
                  className="border-b border-green-700/50 hover:bg-green-900/20 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-trash-yellow to-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{token.name}</div>
                        <div className="text-sm text-green-300">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-green-300">{token.symbol}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-bold ${
                      token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-white">{token.volume}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="bg-trash-yellow hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg transition-colors duration-200 hover:scale-105">
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center">
          <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105">
            View All Tokens
          </button>
        </div>
      </div>

      {/* Network Status */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">
          🌐 Network Status
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-600">
            <div className="text-4xl mb-3">🟢</div>
            <div className="text-xl font-bold text-white mb-2">Gorbagana Chain</div>
            <div className="text-sm text-green-200">Status: Online</div>
            <div className="text-xs text-green-300 mt-2">Block Height: 1,337,420</div>
          </div>
          
          <div className="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-600">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-xl font-bold text-white mb-2">Transaction Speed</div>
            <div className="text-sm text-green-200">~0.5 seconds</div>
            <div className="text-xs text-green-300 mt-2">TPS: 65,000+</div>
          </div>
          
          <div className="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-600">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-xl font-bold text-white mb-2">Network Fee</div>
            <div className="text-sm text-green-200">0.001 GOR</div>
            <div className="text-xs text-green-300 mt-2">~$0.0001 USD</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">
          ⚡ Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <button className="p-6 bg-gradient-to-br from-trash-yellow to-yellow-400 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-4xl mb-3">🚀</div>
            <div>Create Token</div>
          </button>
          
          <button className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-4xl mb-3">💱</div>
            <div>Swap Tokens</div>
          </button>
          
          <button className="p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-4xl mb-3">🏊</div>
            <div>Add Liquidity</div>
          </button>
          
          <button className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
            <div className="text-4xl mb-3">📊</div>
            <div>Analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
}
