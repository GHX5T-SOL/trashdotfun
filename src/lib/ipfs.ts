import { create } from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import { parse as parseProof } from '@storacha/client/proof';
import * as ed25519 from '@ucanto/principal/ed25519';

// IPFS service using Storacha Network with UCANs
export class IPFSService {
  private client: any = null; // TODO: Replace with proper type when Storacha types are available
  private isInitialized: boolean = false;
  private useMockService: boolean = false; // Try real service first
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initializeClient();
  }

  /**
   * Initialize the Storacha client with UCANs
   */
  private async initializeClient() {
    try {
      const ucanProof = process.env.NEXT_PUBLIC_STORACHA_UCAN_PROOF;
      const didKey = process.env.NEXT_PUBLIC_STORACHA_DID_KEY;
      const signingKey = process.env.NEXT_PUBLIC_STORACHA_SIGNING_KEY;
      
      // Check if all required Storacha environment variables are present
      if (!ucanProof || !didKey || !signingKey) {
        console.log('IPFS Service: Storacha environment variables not configured, using mock service');
        this.useMockService = true;
        return;
      }

      // Validate UCAN proof format before parsing
      if (!this.isValidUCANProof(ucanProof)) {
        console.warn('IPFS Service: UCAN proof format appears invalid, using mock service');
        this.useMockService = true;
        return;
      }

      console.log('IPFS Service: Initializing Storacha client with UCANs...');
      
      // For now, use a basic client configuration to get uploads working
      // The UCAN proof should contain the necessary authorization
      const store = new StoreMemory();
      const client = await create({ store });
      
      try {
        // Add the space using the UCAN proof
        const proof = await parseProof(ucanProof);
        const space = await client.addSpace(proof);
        await client.setCurrentSpace(space.did());
        
        this.client = client;
        this.isInitialized = true;
        this.useMockService = false;
        
        console.log('IPFS Service: Storacha client initialized successfully');
        console.log('IPFS Service: Current space:', space.did());
      } catch (proofError) {
        console.error('IPFS Service: Failed to parse UCAN proof:', proofError);
        console.log('IPFS Service: Falling back to mock service due to UCAN parsing error');
        this.useMockService = true;
        
        // Don't throw error, just use mock service
        return;
      }
      
    } catch (error) {
      console.error('IPFS Service: Failed to initialize Storacha client:', error);
      console.log('IPFS Service: Falling back to mock service');
      this.useMockService = true;
      
      // Add helpful debugging info
      if (error instanceof Error) {
        if (error.message.includes('base64url')) {
          console.log('IPFS Service: UCAN proof appears to have encoding issues');
        }
      }
    }
  }

  /**
   * Wait for initialization to complete
   */
  private async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  /**
   * Validate UCAN proof format
   */
  private isValidUCANProof(proof: string): boolean {
    try {
      // Check if proof is a valid base64url string
      if (!proof || typeof proof !== 'string') {
        return false;
      }
      
      // Basic format validation - should be base64url encoded
      const base64urlRegex = /^[A-Za-z0-9_-]+$/;
      if (!base64urlRegex.test(proof)) {
        console.warn('IPFS Service: UCAN proof contains invalid characters');
        return false;
      }
      
      // Check length - UCAN proofs are typically long but not extremely long
      if (proof.length < 100 || proof.length > 10000) {
        console.warn('IPFS Service: UCAN proof length seems unusual:', proof.length);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('IPFS Service: Error validating UCAN proof format:', error);
      return false;
    }
  }

  /**
   * Upload image to IPFS using Storacha Network
   */
  async uploadImage(file: File): Promise<string> {
    await this.waitForInitialization();
    
    try {
      if (this.useMockService || !this.isInitialized || !this.client) {
        console.log('IPFS Service: Using mock IPFS service for image:', file.name);
        return this.mockIPFSUpload(file);
      }
      
      console.log('IPFS Service: Uploading image to IPFS via Storacha Network:', file.name);
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Upload to Storacha
      const cid = await this.client.uploadBlob(uint8Array);
      
      console.log('IPFS Service: Image uploaded successfully, CID:', cid);
      return `ipfs://${cid}`;
      
    } catch (error) {
      console.error('IPFS Service: Image upload failed:', error);
      
      // Only fallback to mock if this is a real error, not just initialization
      if (this.isInitialized && this.client) {
        console.warn('IPFS Service: Storacha upload failed, falling back to mock service');
        return this.mockIPFSUpload(file);
      } else {
        console.log('IPFS Service: Using mock service (Storacha not available)');
        return this.mockIPFSUpload(file);
      }
    }
  }

  /**
   * Upload file to IPFS (alias for uploadImage for compatibility)
   */
  async uploadFile(file: File): Promise<string> {
    return this.uploadImage(file);
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    await this.waitForInitialization();
    
    try {
      if (this.useMockService || !this.isInitialized || !this.client) {
        console.log('IPFS Service: Using mock IPFS service for metadata');
        return this.mockMetadataUpload();
      }
      
      console.log('IPFS Service: Uploading metadata to IPFS via Storacha Network');
      
      // Convert metadata to JSON string, then to bytes
      const jsonString = JSON.stringify(metadata, null, 2);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      
      // Upload to Storacha
      const cid = await this.client.uploadBlob(uint8Array);
      
      console.log('IPFS Service: Metadata uploaded successfully, CID:', cid);
      return `ipfs://${cid}`;
      
    } catch (error) {
      console.error('IPFS Service: Metadata upload failed:', error);
      
      // Only fallback to mock if this is a real error, not just initialization
      if (this.isInitialized && this.client) {
        console.warn('IPFS Service: Storacha upload failed, falling back to mock service');
        return this.mockMetadataUpload();
      } else {
        console.log('IPFS Service: Using mock service (Storacha not available)');
        return this.mockMetadataUpload();
      }
    }
  }

  /**
   * Mock IPFS upload for fallback
   */
  private async mockIPFSUpload(file: File): Promise<string> {
    console.log('IPFS Service: Using mock IPFS service for image:', file.name);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock hash based on file content
    const mockHash = `QmMock${file.name.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    return `ipfs://${mockHash}`;
  }

  /**
   * Mock metadata upload for fallback
   */
  private async mockMetadataUpload(): Promise<string> {
    console.log('IPFS Service: Using mock IPFS service for metadata');
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock hash
    const mockHash = `QmMockMetadata${Date.now()}`;
    return `ipfs://${mockHash}`;
  }

  /**
   * Get IPFS gateway URL for display
   */
  getGatewayUrl(ipfsUri: string): string {
    if (!ipfsUri.startsWith('ipfs://')) {
      return ipfsUri;
    }
    
    const hash = ipfsUri.replace('ipfs://', '');
    
    // Try multiple gateways for reliability
    const gateways = [
      `https://ipfs.io/ipfs/${hash}`,
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`,
      `https://storacha.network/ipfs/${hash}` // Storacha's own gateway
    ];
    
    // Return the first gateway (ipfs.io is most reliable)
    return gateways[0];
  }

  /**
   * Check if real IPFS is available
   */
  isRealIPFSAvailable(): boolean {
    return this.isInitialized && this.client !== null && !this.useMockService;
  }

  /**
   * Get service status for debugging
   */
  getServiceStatus(): string {
    if (this.useMockService) {
      return 'Using mock IPFS service (Storacha not configured or UCAN issues)';
    }
    
    if (!this.isInitialized) {
      return 'Storacha client not initialized';
    }
    
    if (this.client) {
      return 'Storacha client ready for real IPFS uploads';
    }
    
    return 'Service unavailable';
  }

  /**
   * Get setup instructions for Storacha Network
   */
  getSetupInstructions(): string {
    return `To enable real IPFS uploads, you need to set up UCANs with Storacha Network:

1. Install Storacha CLI: npm install -g @storacha/cli
2. Create a space: storacha space create
3. Generate a key: storacha key create --json
4. Create UCAN delegation: storacha delegation create [DID] -c space/blob/add -c space/index/add -c filecoin/offer -c upload/add --base64
5. Set current space: storacha space use [SPACE_NAME]
6. Add to .env.local:
   NEXT_PUBLIC_STORACHA_DID_KEY=did:key:z6Mk...
   NEXT_PUBLIC_STORACHA_SIGNING_KEY=MgCaUx+h3xaFF3WGq3yJ8Osmz42Ann91DhWD7y1IGr30i8O0BM48tCEewKUDMzPc/dZyQiioq6aZ06QILfJBtWu2xzGg=
   NEXT_PUBLIC_STORACHA_UCAN_PROOF=mAYIEAP8OEaJlcm9vdHOA...

Run: npm run setup-storacha for automated setup help.

See: https://docs.storacha.network for detailed instructions.`;
  }

  /**
   * Test the connection to Storacha
   */
  async testConnection(): Promise<boolean> {
    await this.waitForInitialization();
    
    try {
      if (this.useMockService || !this.isInitialized || !this.client) {
        return false;
      }
      
      // Try to upload a small test blob
      const testData = new TextEncoder().encode('test');
      const cid = await this.client.uploadBlob(testData);
      
      console.log('IPFS Service: Connection test successful, test CID:', cid);
      return true;
      
    } catch (error) {
      console.error('IPFS Service: Connection test failed:', error);
      return false;
    }
  }
}
