<div align="center">
  <img src="https://i.ibb.co/HfPWfpMP/Trashdot-fun.png" alt="TrashdotFun Logo" width="300" height="auto">
  
  # 🗑️ TrashdotFun - Gorbagana Chain Token Launchpad
  
  **Create $GOR meme coins in the trashiest way!** 🎭
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GHX5T-SOL/trashdotfun)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
  [![Solana](https://img.shields.io/badge/Solana-1.98.2-purple)](https://solana.com/)
</div>

---

## 🚀 **Live Launchpad**

**🌐 Production URL**: [https://trashdotfun.vercel.app](https://trashdotfun.vercel.app)

---

## ✨ **Features**

- **🎯 Token Creation**: Create SPL tokens with custom names, symbols, and supply
- **🔗 Gorbagana Chain Integration**: Built specifically for the Gorbagana Chain (Solana fork)
- **👛 Wallet Integration**: Support for Phantom, Backpack, and other Solana wallets
- **🎨 Dark Theme**: Sleek, modern UI with Oscar the Grouch trash/garbage aesthetic
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **⚡ Fast & Secure**: Backend RPC proxy architecture for optimal performance

## 🔧 **Technical Architecture**

### **Blockchain Integration**
- **Network**: Gorbagana Chain (Solana fork)
- **RPC Architecture**: `Gorbagana RPC → Your Backend → Frontend` (CORS resolved!)
- **Token Program ID**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- **Associated Token Program**: `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`

### **Frontend Stack**
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom trash theme
- **Wallet Integration**: Solana Wallet Adapter
- **Deployment**: Vercel

### **Backend Architecture**
- **API Routes**: Next.js API routes for RPC proxying
- **CORS Handling**: Custom backend proxy to avoid CORS issues
- **Error Handling**: Comprehensive error handling and user feedback

## 🎨 **Design Theme**

The app features a unique Oscar the Grouch trash/garbage aesthetic:

- **🗑️ Trash Green**: `#1a3c34` (Dark green for Oscar's vibe)
- **💛 Trash Yellow**: `#f4ca16` (Bright yellow for trash can lids)
- **⚫ Dark Mode**: Sleek, modern interface with high contrast

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn or npm
- Solana wallet (Phantom, Solflare, etc.)
- **IPFS Storage**: Get free decentralized storage at [Storacha Network](https://console.storacha.network/) (formerly Web3.Storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trashdotfun.git
   cd trashdotfun
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```bash
   # Gorbagana Chain RPC
   NEXT_PUBLIC_GOR_RPC_URL=https://rpc.gorbagana.wtf/
   
   # IPFS Storage (Storacha Network)
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_did_key_here
   ```
   
   **Note**: Storacha Network uses UCANs (User Controlled Authorization Networks) with DID keys instead of JWT tokens. Get your free DID key at [console.storacha.network](https://console.storacha.network/).

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 **Usage Guide**

### **1. Connect Wallet**
- Click the wallet button to connect your Solana wallet
- Supported wallets: Phantom, Backpack, Solflare, and others

### **2. Create Token**
- Navigate to "Create a Coin Now" button
- Fill in token details:
  - **Token Name** (e.g., "TrashCoin")
  - **Token Symbol** (e.g., "TRASH") 
  - **Total Supply** (e.g., 1000000)
  - **Description** (optional)

### **3. Mint & Confirm**
- Click "Create Token" and approve the transaction
- Wait for confirmation on the Gorbagana Chain
- View your token with the provided mint address

---

## 🌐 **Gorbagana Chain Information**

- **Network**: Gorbagana Chain (Solana fork)
- **Explorer**: [docs.gorbagana.wtf](https://docs.gorbagana.wtf)
- **Community**: [Telegram](https://t.me/gorbagana) | [Twitter](https://twitter.com/Gorbagana_chain)
- **RPC Endpoint**: `https://rpc.gorbagana.wtf/`

---

## 🔍 **Token Verification**

After creating a token, you can:
- **View on Explorer**: Check the mint address on Gorbagana Explorer
- **Wallet Integration**: See the token in your connected wallet
- **Transaction History**: Verify all transaction signatures provided

---

## 🚧 **Current Limitations & Future Features**

### **✅ Implemented**
- Basic SPL token creation
- Wallet connection and integration
- Backend RPC proxy (CORS resolved)
- Responsive dark theme UI
- Transaction confirmation handling

### **🔮 Coming Soon**
- [ ] Logo upload and IPFS storage
- [ ] Metaplex metadata integration
- [ ] Token marketplace/listing
- [ ] Bonding curve mechanics (like Pump.fun)
- [ ] Advanced tokenomics options
- [ ] Community features and social elements

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

**Wallet Connection Issues**
- Ensure you have a Solana wallet installed
- Check that you're on the Gorbagana Chain network
- Verify your wallet has some $GOR for transaction fees

**Token Creation Fails**
- Check your wallet balance (need SOL for transaction fees)
- Ensure all required fields are filled
- Check the browser console for error messages

**RPC Connection Issues**
- The backend proxy should handle CORS automatically
- Check that your environment variables are set correctly
- Verify the application is properly deployed

---

## 📱 **Supported Wallets**

- **👻 Phantom Wallet**
- **🎒 Backpack Wallet**
- **🔥 Solflare**
- **🔑 Other Solana wallet adapters**

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### **Development Guidelines**
- Follow the existing code style
- Add proper error handling
- Include TypeScript types
- Test on both local and production environments

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 **Support & Community**

- **🌐 Live Site**: [https://trashdotfun.vercel.app](https://trashdotfun.vercel.app)
- **📱 Telegram**: [@trashdotfun](https://t.me/trashdotfun)
- **🐦 Twitter**: [@trashdotfun_](https://x.com/trashdotfun_)
- **🐛 Issues**: [GitHub Issues](https://github.com/GHX5T-SOL/trashdotfun/issues)
- **📚 Documentation**: [Gorbagana Docs](https://docs.gorbagana.wtf)

---

## 🌟 **Acknowledgments**

- **Gorbagana Chain** for building an amazing Solana fork
- **Solana Labs** for the incredible blockchain technology
- **Next.js Team** for the amazing React framework
- **Oscar the Grouch** for the trash aesthetic inspiration 🗑️

---

<div align="center">
  
  **Built with 🗑️ for the Gorbagana Chain community!**
  
  [![Star on GitHub](https://img.shields.io/github/stars/GHX5T-SOL/trashdotfun?style=social)](https://github.com/GHX5T-SOL/trashdotfun)
  [![Fork on GitHub](https://img.shields.io/github/forks/GHX5T-SOL/trashdotfun?style=social)](https://github.com/GHX5T-SOL/trashdotfun)
  
</div>
