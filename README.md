# TrashdotFun - Gorbagana Chain Token Launchpad

A meme coin launchpad for the Gorbagana Chain, featuring an Oscar the Grouch trash/garbage theme. Create your own $GOR tokens on the Gorbagana blockchain!

## 🚀 Features

- **Token Creation**: Create SPL tokens with custom names, symbols, and supply
- **Gorbagana Chain Integration**: Built specifically for the Gorbagana Chain (Solana fork)
- **Wallet Integration**: Support for Phantom, Backpack, and other Solana wallets
- **Dark Theme**: Sleek, modern UI with trash/garbage aesthetic
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Technical Details

- **Blockchain**: Gorbagana Chain (Solana fork)
- **RPC Endpoint**: `https://rpc.gorbagana.wtf/`
- **Token Program ID**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` (Same as Solana)
- **Associated Token Program**: `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom trash theme colors

## 📋 Prerequisites

- Node.js 18+ 
- Yarn package manager
- A Solana wallet (Phantom, Backpack, etc.)
- Some $GOR tokens for transaction fees

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trashdotfun-1
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_GOR_RPC_URL=https://rpc.gorbagana.wtf/
   ```

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Connect Wallet**: Click the wallet button to connect your Solana wallet
2. **Navigate to Create Coin**: Click "Create a Coin Now" button
3. **Fill Token Details**:
   - Token Name (e.g., "TrashCoin")
   - Token Symbol (e.g., "TRASH") 
   - Total Supply (e.g., 1000000)
   - Description (optional)
4. **Create Token**: Click "Create Token" and approve the transaction
5. **View Results**: Your token will be created with a mint address

## 🌐 Gorbagana Chain Information

- **Network**: Gorbagana Chain (Testnet)
- **Explorer**: [docs.gorbagana.wtf](https://docs.gorbagana.wtf)
- **Community**: [Telegram](https://t.me/gorbagana) | [Twitter](https://twitter.com/Gorbagana_chain)
- **RPC**: `https://rpc.gorbagana.wtf/`

## 🔍 Token Verification

After creating a token, you can:
- View it on the Gorbagana Explorer
- Check the mint address in your wallet
- Verify the transaction signatures provided

## 🎨 Customization

The app uses a custom trash theme with these colors:
- **Trash Green**: `#1a3c34` (Dark green for Oscar's vibe)
- **Trash Yellow**: `#f4ca16` (Bright yellow for trash can lids)

## 🚧 Known Limitations

- Logo upload functionality is planned for future updates
- Token metadata is stored locally (Metaplex integration planned)
- Currently supports basic SPL token creation

## 🔮 Future Features

- [ ] Logo upload and IPFS storage
- [ ] Metaplex metadata integration
- [ ] Token marketplace/listing
- [ ] Bonding curve mechanics (like Pump.fun)
- [ ] Advanced tokenomics options
- [ ] Community features and social elements

## 🐛 Troubleshooting

**Wallet Connection Issues**:
- Ensure you have a Solana wallet installed
- Check that you're on the Gorbagana Chain network
- Verify your wallet has some $GOR for transaction fees

**Token Creation Fails**:
- Check your wallet balance (need SOL for transaction fees)
- Ensure all required fields are filled
- Check the browser console for error messages

**RPC Connection Issues**:
- Verify the RPC endpoint is correct: `https://rpc.gorbagana.wtf/`
- Check your internet connection
- Try refreshing the page

## 📱 Supported Wallets

- Phantom Wallet
- Backpack Wallet
- Solflare
- Other Solana wallet adapters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Telegram**: [@trashdotfun](https://t.me/trashdotfun)
- **Twitter**: [@trashdotfun_](https://x.com/trashdotfun_)
- **Issues**: Create an issue on GitHub

---

**Built with 🗑️ for the Gorbagana Chain community!**
