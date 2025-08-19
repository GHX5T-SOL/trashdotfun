'use client';

import React from 'react';
import CreateToken from '@/components/CreateToken';

export default function CreateCoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trash-green via-green-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-trash-yellow mb-4">
            🗑️ Create Your Token
          </h1>
          <p className="text-green-200 text-lg">
            Launch your token on Gorbagana Chain with our easy-to-use platform
          </p>
        </div>
        
        <CreateToken />
      </div>
    </div>
  );
}