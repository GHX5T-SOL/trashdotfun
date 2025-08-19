'use client';

import React, { useState } from 'react';
import { IPFSService } from '../lib/ipfs';

export default function IPFSTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [ipfsService] = useState(() => new IPFSService());

  const testIPFSConnection = async () => {
    setIsTesting(true);
    setTestResult('Testing IPFS connection...');
    
    try {
      const isAvailable = ipfsService.isRealIPFSAvailable();
      const status = ipfsService.getServiceStatus();
      
      if (isAvailable) {
        const connectionTest = await ipfsService.testConnection();
        
        if (connectionTest) {
          setTestResult('✅ IPFS Service: Connected and working! Real uploads enabled.');
        } else {
          setTestResult('❌ IPFS Service: Client initialized but connection test failed.');
        }
      } else {
        setTestResult(`❌ IPFS Service: ${status}`);
      }
    } catch (error) {
      setTestResult(`❌ IPFS Service: Error during test - ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testImageUpload = async () => {
    setIsTesting(true);
    setTestResult('Testing image upload...');
    
    try {
      // Create a test image file
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f4ca16';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#1a3c34';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 25, 55);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
          const result = await ipfsService.uploadImage(testFile);
          
          if (result.startsWith('ipfs://')) {
            const gatewayUrl = ipfsService.getGatewayUrl(result);
            setTestResult(`✅ Test upload successful!\nCID: ${result}\nGateway: ${gatewayUrl}`);
          } else {
            setTestResult(`❌ Upload failed: ${result}`);
          }
        }
        setIsTesting(false);
      }, 'image/png');
      
    } catch (error) {
      setTestResult(`❌ Upload test failed: ${error}`);
      setIsTesting(false);
    }
  };

  const testMetadataUpload = async () => {
    setIsTesting(true);
    setTestResult('Testing metadata upload...');
    
    try {
      const testMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'This is a test token for IPFS verification',
        image: 'ipfs://QmTestImage',
        attributes: [],
        properties: {
          files: [],
          category: 'test',
          creators: [],
          social: {
            telegram: 'https://t.me/test',
            twitter: 'https://x.com/test',
            website: 'https://test.com'
          }
        }
      };
      
      const result = await ipfsService.uploadMetadata(testMetadata);
      
      if (result.startsWith('ipfs://')) {
        const gatewayUrl = ipfsService.getGatewayUrl(result);
        setTestResult(`✅ Metadata upload successful!\nCID: ${result}\nGateway: ${gatewayUrl}`);
      } else {
        setTestResult(`❌ Metadata upload failed: ${result}`);
      }
    } catch (error) {
      setTestResult(`❌ Metadata test failed: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const showSetupInstructions = () => {
    const instructions = ipfsService.getSetupInstructions();
    setTestResult(`📋 Setup Instructions:\n\n${instructions}`);
  };

  return (
    <div className="glass rounded-2xl p-6 border-2 border-green-600">
      <h3 className="text-2xl font-bold text-trash-yellow mb-6 text-center">
        🔗 IPFS Service Test
      </h3>
      
      <div className="space-y-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-green-200 mb-2">Service Status</div>
          <div className="text-sm text-green-300">
            {ipfsService.getServiceStatus()}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-green-200 mb-2">Real IPFS Available</div>
          <div className={`text-lg font-bold ${ipfsService.isRealIPFSAvailable() ? 'text-green-400' : 'text-red-400'}`}>
            {ipfsService.isRealIPFSAvailable() ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testIPFSConnection}
          disabled={isTesting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          🔍 Test Connection
        </button>
        
        <button
          onClick={testImageUpload}
          disabled={isTesting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          🖼️ Test Image Upload
        </button>
        
        <button
          onClick={testMetadataUpload}
          disabled={isTesting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          📄 Test Metadata Upload
        </button>
        
        <button
          onClick={showSetupInstructions}
          disabled={isTesting}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          📋 Setup Instructions
        </button>
      </div>
      
      {testResult && (
        <div className="bg-green-900/30 rounded-xl p-4 border border-green-600">
          <div className="text-sm text-green-200 whitespace-pre-wrap">
            {testResult}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-green-300">
        <p>💡 Tip: Run <code className="bg-green-800/50 px-2 py-1 rounded">node scripts/setup-storacha.js</code> for automated setup help</p>
      </div>
    </div>
  );
}
