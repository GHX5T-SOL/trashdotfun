<div align="center">
  <img src="https://i.ibb.co/HfPWfpMP/Trashdot-fun.png" alt="TrashdotFun Logo" width="300" height="auto">
  
  # 🗑️ TrashdotFun - Garbage Token Launchpad

Welcome to **TrashdotFun**, the trashiest token launchpad on the Gorbagana Chain! Built with a cartoony, Oscar the Grouch-inspired theme, this platform makes creating meme coins as fun as diving into a garbage can.

## 🌐 **Live Demo**
**🚀 Deployed at**: [https://trashdotfun.netlify.app/](https://trashdotfun.netlify.app/)

## ✨ Features

### 🎨 **Cartoony Garbage Theme**
- **Oscar the Grouch** inspired design with trash-green color scheme
- Animated floating trash elements and bouncing animations
- Custom trash-themed loading spinners and UI components
- Glass morphism effects with backdrop blur

### 🚀 **Token Creation**
- **Easy token creation** with a beautiful, intuitive interface
- **Social media integration** - add Telegram, X (Twitter), and Website links
- **IPFS logo upload** with automatic metadata generation
- **Full Metaplex support** for rich token metadata
- **Gorbagana Chain** integration with optimized RPC

### 💰 **Launchpad Features**
- **Platform statistics** dashboard with real-time data
- **Trending tokens** table with price changes and volume
- **Network status** monitoring for Gorbagana Chain
- **Quick action buttons** for common operations
- **Responsive design** that works on all devices

### 🔐 **Wallet Integration**
- **Persistent wallet connect button** in the header
- **Phantom and Solflare** wallet support
- **Auto-connect** functionality
- **Transaction status** tracking with custom timeouts

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Blockchain**: Solana Web3.js and SPL Token
- **Metadata**: Metaplex with IPFS storage
- **Network**: Gorbagana Chain (GOR testnet)
- **Deployment**: Netlify with automatic deployments

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (required for Solana dependencies)
- Yarn or npm
- Solana wallet (Phantom, Solflare)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GHX5T-SOL/trashdotfun.git
   cd trashdotfun
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Run the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Network Configuration

The platform is configured to use the **Gorbagana Chain** with:
- **RPC Endpoint**: `https://rpc.gorbagana.wtf/`
- **Explorer**: [trashscan.io](https://trashscan.io)
- **Token Program**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- **Metaplex**: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

## 🎯 Usage

### Creating a Token

1. **Connect your wallet** using the button in the top-right header
2. **Navigate to Create Token** page
3. **Fill in token details**:
   - Name and Symbol
   - Initial supply and decimals
   - Optional logo upload
   - Social media links (Telegram, X, Website)
   - Description
4. **Click Create Token** and confirm the transaction
5. **View your token details** with mint address and explorer links

### Token Features

- **Automatic metadata creation** with IPFS storage
- **Social link integration** for community building
- **Copy-to-clipboard** functionality for easy sharing
- **Direct explorer links** for verification

## 🎨 Customization

### Colors
The theme uses a custom color palette defined in `tailwind.config.ts`:
- `trash-green`: `#1a3c34` - Main background
- `trash-yellow`: `#f4ca16` - Accent color
- `trash-brown`: `#8B4513` - Secondary accent
- `garbage-blue`: `#4682B4` - Accent blue

### Animations
Custom CSS animations include:
- `animate-float` - Floating motion
- `animate-glow` - Glowing effects
- `animate-trash-bounce` - Bouncing with rotation
- `animate-wiggle` - Wiggle motion

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://rpc.gorbagana.wtf/
NEXT_PUBLIC_EXPLORER_URL=https://trashscan.io
```

### RPC Proxy
The platform includes a CORS proxy at `/api/rpc` to avoid cross-origin issues when connecting to the Gorbagana RPC.

## 🚀 Deployment

### Netlify (Current)
1. **Automatic Deployment**: Connected to GitHub with auto-deploy on push
2. **Environment Variables**: Configured in Netlify dashboard
3. **Build Command**: `yarn build`
4. **Publish Directory**: `.next`

### Manual Deployment
```bash
yarn build
yarn start
```

### Local Development
```bash
yarn dev
# Open http://localhost:3000
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Guidelines
- Follow the existing code style and theme
- Add new animations and trash-themed elements
- Test on Gorbagana testnet before submitting
- Update documentation for new features

## 📱 Social Links

- **Telegram**: [@trashdotfun](https://t.me/trashdotfun)
- **X (Twitter)**: [@trashdotfun_](https://x.com/trashdotfun_)
- **Website**: [trashdotfun.com](https://trashdotfun.com)
- **Live Demo**: [https://trashdotfun.netlify.app/](https://trashdotfun.netlify.app/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Oscar the Grouch** for the trashy inspiration
- **Gorbagana Chain** team for the amazing network
- **Metaplex Foundation** for the metadata standards
- **Solana Labs** for the blockchain infrastructure

---

**Remember**: In the world of crypto, one person's trash is another person's treasure! 🗑️✨
