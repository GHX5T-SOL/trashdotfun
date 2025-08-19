#!/usr/bin/env node

/**
 * Storacha Network Setup Script for TrashdotFun
 * This script helps you set up UCANs (User Controlled Authorization Networks) for IPFS uploads
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗑️  TrashdotFun - Storacha Network Setup');
console.log('==========================================\n');

console.log('This script will help you set up Storacha Network for IPFS logo uploads.\n');

// Check if storacha CLI is installed
try {
  execSync('storacha --version', { stdio: 'ignore' });
  console.log('✅ Storacha CLI is already installed\n');
} catch (error) {
  console.log('❌ Storacha CLI is not installed. Installing now...\n');
  
  try {
    console.log('Installing Storacha CLI globally...');
    execSync('npm install -g @storacha/cli', { stdio: 'inherit' });
    console.log('✅ Storacha CLI installed successfully\n');
  } catch (installError) {
    console.log('❌ Failed to install Storacha CLI. Please install manually:');
    console.log('   npm install -g @storacha/cli\n');
    process.exit(1);
  }
}

console.log('📋 Setup Steps:\n');

console.log('1. Create a Storacha Space:');
console.log('   storacha space create\n');

console.log('2. Generate a signing key:');
console.log('   storacha key create --json\n');

console.log('3. Create a UCAN delegation:');
console.log('   storacha delegation create [YOUR_DID] -c space/blob/add -c space/index/add -c filecoin/offer -c upload/add --base64\n');

console.log('4. Set your current space:');
console.log('   storacha space use [SPACE_NAME]\n');

console.log('5. Update your .env.local file with:');
console.log('   NEXT_PUBLIC_STORACHA_DID_KEY=did:key:z6Mk...');
console.log('   NEXT_PUBLIC_STORACHA_UCAN_PROOF=mAYIEAP8OEaJlcm9vdHOA...\n');

console.log('📚 For detailed instructions, visit: https://docs.storacha.network\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('📁 Found .env.local file');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_STORACHA_DID_KEY=') && !envContent.includes('NEXT_PUBLIC_STORACHA_DID_KEY=did:key:z6Mkef3VN44ceNyfkwLk2CegQcBTpzComfN4WWfvmNudcGHQ')) {
    console.log('✅ Storacha DID key is configured');
  } else {
    console.log('❌ Storacha DID key is not configured (or using placeholder value)');
  }
  
  if (envContent.includes('NEXT_PUBLIC_STORACHA_UCAN_PROOF=') && !envContent.includes('NEXT_PUBLIC_STORACHA_UCAN_PROOF=mAYIEAP8OEaJlcm9vdHOA...')) {
    console.log('✅ Storacha UCAN proof is configured');
  } else {
    console.log('❌ Storacha UCAN proof is not configured (or using placeholder value)');
  }
} else {
  console.log('📁 No .env.local file found. Create one with your Storacha credentials.\n');
  
  const envTemplate = `# Storacha Network Configuration
NEXT_PUBLIC_STORACHA_DID_KEY=did:key:z6Mk...
NEXT_PUBLIC_STORACHA_UCAN_PROOF=mAYIEAP8OEaJlcm9vdHOA...

# Other configuration
NEXT_PUBLIC_RPC_ENDPOINT=https://rpc.gorbagana.wtf/
NEXT_PUBLIC_EXPLORER_URL=https://trashscan.io
`;

  console.log('📝 Here\'s a template for your .env.local file:');
  console.log('```');
  console.log(envTemplate);
  console.log('```');
}

console.log('\n🎯 After setup, your IPFS uploads will work with real decentralized storage!');
console.log('   No more mock uploads - real IPFS hashes for your token logos.\n');
