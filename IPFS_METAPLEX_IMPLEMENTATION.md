# 🗑️ TrashdotFun - IPFS & Metaplex Implementation Plan

## 🚨 **Current Issues to Solve:**

1. **Transaction Expiration**: "Signature has expired: block height exceeded"
2. **Tokens Not Showing in Wallet**: Missing proper metadata
3. **No Logo Support**: Need IPFS integration for image storage
4. **Missing Metaplex Integration**: Tokens need on-chain metadata

## 🔧 **Solutions Implemented:**

### **1. Transaction Expiration Fix** ✅
- **Better Blockhash Management**: Get fresh blockhash for each transaction
- **Confirmation Level**: Use 'confirmed' instead of default
- **Error Handling**: Better timeout and retry mechanisms
- **Status Updates**: Clear user feedback during each step

### **2. Token Display Fix** 🔄
- **Current Status**: Basic SPL token creation (mint + ATA + minting)
- **Missing**: Metaplex metadata account creation
- **Result**: Tokens created but not visible in wallets

## 🌐 **IPFS Integration Plan:**

### **Phase 1: IPFS Setup**
```bash
# Install IPFS dependencies
yarn add ipfs-http-client @pinata/sdk
```

### **Phase 2: Image Upload Service**
```typescript
// src/lib/ipfs.ts
import { create } from 'ipfs-http-client';

export class IPFSService {
  private ipfs: any;
  
  constructor() {
    this.ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    });
  }
  
  async uploadImage(file: File): Promise<string> {
    const result = await this.ipfs.add(file);
    return `ipfs://${result.path}`;
  }
}
```

### **Phase 3: Pinata Integration (Alternative)**
```typescript
// src/lib/pinata.ts
import { PinataSDK } from '@pinata/sdk';

export class PinataService {
  private pinata: PinataSDK;
  
  constructor() {
    this.pinata = new PinataSDK({
      pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_JWT
    });
  }
  
  async uploadImage(file: File): Promise<string> {
    const result = await this.pinata.pinFileToIPFS(file);
    return `ipfs://${result.IpfsHash}`;
  }
}
```

## 🎭 **Metaplex Integration Plan:**

### **Phase 1: Install Metaplex Dependencies**
```bash
# Install Metaplex packages
yarn add @metaplex-foundation/mpl-token-metadata @metaplex-foundation/js
```

### **Phase 2: Create Metadata Account**
```typescript
// src/lib/metaplex.ts
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';

export class MetaplexService {
  static getMetadataAccount(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )[0];
  }
  
  static createMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ) {
    const metadataAccount = this.getMetadataAccount(mint);
    
    return createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAccount,
        mint,
        mintAuthority,
        payer,
        updateAuthority: mintAuthority,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name,
            symbol,
            uri, // IPFS URI for logo
            sellerFeeBasisPoints: 0,
            creators: [
              {
                address: mintAuthority,
                verified: true,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );
  }
}
```

### **Phase 3: Update Token Creation Flow**
```typescript
// Updated CreateToken component flow:
// 1. Create mint account
// 2. Upload logo to IPFS
// 3. Create metadata account with Metaplex
// 4. Create associated token account
// 5. Mint tokens
// 6. Link metadata to token
```

## 🎯 **Implementation Priority:**

### **High Priority (Week 1)**
1. ✅ **Transaction Expiration Fix** - COMPLETED
2. 🔄 **Metaplex Metadata Creation** - IN PROGRESS
3. 🔄 **IPFS Logo Upload** - PLANNED

### **Medium Priority (Week 2)**
1. **Token Verification on Trashscan.io**
2. **Wallet Display Testing**
3. **Error Handling Improvements**

### **Low Priority (Week 3)**
1. **Advanced Metadata Features**
2. **Collection Support**
3. **Creator Verification**

## 🔍 **Testing Strategy:**

### **Local Testing**
1. **Testnet Deployment**: Use Gorbagana testnet
2. **Wallet Integration**: Test with Phantom, Backpack
3. **Explorer Verification**: Check on trashscan.io

### **Production Testing**
1. **Transaction Success Rate**: Monitor expiration errors
2. **Token Visibility**: Verify tokens appear in wallets
3. **Metadata Display**: Check logo and info on explorers

## 📚 **Resources & Documentation:**

### **Gorbagana Chain**
- **Explorer**: [trashscan.io](https://trashscan.io)
- **RPC**: `https://rpc.gorbagana.wtf/`
- **Community**: [Telegram](https://t.me/gorbagana)

### **Metaplex**
- **Program ID**: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`
- **Documentation**: [docs.metaplex.com](https://docs.metaplex.com)

### **IPFS**
- **Infura IPFS**: [infura.io/ipfs](https://infura.io/ipfs)
- **Pinata**: [pinata.cloud](https://pinata.cloud)

## 🚀 **Next Steps:**

1. **Implement Metaplex metadata creation** in CreateToken component
2. **Add IPFS logo upload** functionality
3. **Test complete token creation flow** on Gorbagana testnet
4. **Verify token display** in wallets and on trashscan.io
5. **Deploy to production** once testing is successful

---

**Goal**: Create fully functional tokens that display properly in wallets and on the Gorbagana Chain explorer! 🗑️✨
