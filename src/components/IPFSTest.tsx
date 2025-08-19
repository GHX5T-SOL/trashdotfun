'use client';

import React, { useState, useEffect } from 'react';
import { IPFSService } from '../lib/ipfs';

export default function IPFSTest() {
  const [ipfsService] = useState(() => new IPFSService());
  const [status, setStatus] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(ipfsService.getServiceStatus());
  }, [ipfsService]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addResult('Starting IPFS diagnostics...');
      
      // Check service status
      const serviceStatus = ipfsService.getServiceStatus();
      addResult(`Service Status: ${serviceStatus}`);
      
      // Check if real IPFS is available
      const isRealAvailable = ipfsService.isRealIPFSAvailable();
      addResult(`Real IPFS Available: ${isRealAvailable}`);
      
      // Test connection if available
      if (isRealAvailable) {
        addResult('Testing Storacha connection...');
        const connectionTest = await ipfsService.testConnection();
        addResult(`Connection Test: ${connectionTest ? 'SUCCESS' : 'FAILED'}`);
      }
      
      // Test mock upload
      addResult('Testing mock upload...');
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResult = await ipfsService.uploadFile(testFile);
      addResult(`Mock Upload Result: ${mockResult}`);
      
      addResult('Diagnostics completed!');
      
    } catch (error) {
      addResult(`Error during diagnostics: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getSetupInstructions = () => {
    return ipfsService.getSetupInstructions();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">IPFS Service Diagnostics</h2>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Status</h3>
        <p className="text-gray-600">{status}</p>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isTesting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          {isTesting ? 'Running Tests...' : 'Run Diagnostics'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Test Results</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Setup Instructions</h3>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{getSetupInstructions()}</pre>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Note:</strong> The IPFS service will automatically fall back to mock mode if:</p>
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Environment variables are missing</li>
          <li>UCAN proof is invalid or malformed</li>
          <li>Storacha client fails to initialize</li>
          <li>Any upload operation fails</li>
        </ul>
      </div>
    </div>
  );
}
