'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-trash-green via-green-800 to-trash-green border-b-4 border-trash-yellow shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <img 
                  src="/oscar.svg" 
                  alt="TrashdotFun Logo" 
                  className="h-12 w-12"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-trash-yellow leading-tight">
                  TrashdotFun
                </h1>
                <p className="text-xs text-green-200 leading-tight">
                  Garbage Token Launchpad
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              <Link 
                href="/" 
                className="text-green-200 hover:text-trash-yellow font-medium transition-colors duration-200 hover:scale-105"
              >
                🏠 Home
              </Link>
              <Link 
                href="/create-coin" 
                className="text-green-200 hover:text-trash-yellow font-medium transition-colors duration-200 hover:scale-105"
              >
                🪙 Create Token
              </Link>
              <Link 
                href="https://t.me/trashdotfun" 
                target="_blank"
                className="text-green-200 hover:text-trash-yellow font-medium transition-colors duration-200 hover:scale-105"
              >
                📱 Telegram
              </Link>
              <Link 
                href="https://x.com/trashdotfun_" 
                target="_blank"
                className="text-green-200 hover:text-trash-yellow font-medium transition-colors duration-200 hover:scale-105"
              >
                𝕏 Twitter
              </Link>
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-trash-yellow hover:text-yellow-400 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Wallet Connect Button */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="text-right">
                <p className="text-xs text-green-200 mb-1">Connect Wallet</p>
                <p className="text-xs text-green-300">Gorbagana Network</p>
              </div>
            </div>
            <div className="wallet-adapter-button-wrapper">
              <WalletMultiButton className="!bg-trash-yellow !text-black !font-bold !px-4 !py-2 lg:!px-6 lg:!py-3 !rounded-xl !border-2 !border-green-800 hover:!bg-yellow-400 hover:!scale-105 transition-all duration-200 shadow-lg !text-sm lg:!text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-4 bg-gradient-to-br from-green-800 to-green-900 border-t border-green-600">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-green-200 hover:text-trash-yellow font-medium py-3 px-4 rounded-lg hover:bg-green-800/50 transition-all duration-200"
            >
              🏠 Home
            </Link>
            <Link 
              href="/create-coin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-green-200 hover:text-trash-yellow font-medium py-3 px-4 rounded-lg hover:bg-green-800/50 transition-all duration-200"
            >
              🪙 Create Token
            </Link>
            <Link 
              href="https://t.me/trashdotfun" 
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-green-200 hover:text-trash-yellow font-medium py-3 px-4 rounded-lg hover:bg-green-800/50 transition-all duration-200"
            >
              📱 Telegram
            </Link>
            <Link 
              href="https://x.com/trashdotfun_" 
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-green-200 hover:text-trash-yellow font-medium py-3 px-4 rounded-lg hover:bg-green-800/50 transition-all duration-200"
            >
              𝕏 Twitter
            </Link>
            
            {/* Mobile Wallet Connect */}
            <div className="pt-4 border-t border-green-600">
              <div className="text-center mb-3">
                <p className="text-xs text-green-200 mb-1">Connect Wallet</p>
                <p className="text-xs text-green-300">Gorbagana Network</p>
              </div>
              <div className="wallet-adapter-button-wrapper">
                <WalletMultiButton className="!w-full !bg-trash-yellow !text-black !font-bold !py-3 !rounded-xl !border-2 !border-green-800 hover:!bg-yellow-400 transition-all duration-200 shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Decorative trash elements */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-trash-yellow to-transparent opacity-60"></div>
    </header>
  );
}
