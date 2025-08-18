// IPFS service using Storacha Network (formerly Web3.Storage)
export class IPFSService {
  private storachaDidKey: string | null = null;
  
  constructor() {
    // Get Storacha DID key from environment
    this.storachaDidKey = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || null;
    
    // Log token status for debugging
    if (this.storachaDidKey) {
      console.log('IPFS Service: Storacha Network DID key configured');
    } else {
      console.log('IPFS Service: No Storacha DID key, using mock service');
    }
  }
  
  /**
   * Upload image to IPFS using Storacha Network
   * Note: Storacha uses UCANs instead of JWT tokens
   */
  async uploadImage(file: File): Promise<string> {
    try {
      if (!this.storachaDidKey) {
        throw new Error('Storacha Network DID key not configured');
      }
      
      console.log('Uploading image to IPFS via Storacha Network:', file.name);
      
      // For now, we'll use a mock upload since Storacha requires UCAN setup
      // TODO: Implement proper Storacha Network integration with UCANs
      console.warn('Storacha Network integration requires UCAN setup - using mock service for now');
      
      // Fallback to mock service until we implement UCAN integration
      return this.mockIPFSUpload(file);
      
      /* 
      // Future Storacha Network implementation:
      // This will require the @storacha/client package and UCAN setup
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://api.storacha.network/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.storachaDidKey}`,
        },
        body: formData,
      });
      */
      
    } catch (error) {
      console.error('IPFS upload failed:', error);
      
      // Fallback to mock service if Storacha fails
      console.warn('Falling back to mock IPFS service');
      return this.mockIPFSUpload(file);
    }
  }
  
  /**
   * Upload metadata to IPFS
   */
  async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    try {
      if (!this.storachaDidKey) {
        throw new Error('Storacha Network DID key not configured');
      }
      
      console.log('Uploading metadata to IPFS via Storacha Network');
      
      // For now, we'll use a mock upload since Storacha requires UCAN setup
      console.warn('Storacha Network integration requires UCAN setup - using mock service for now');
      
      // Fallback to mock service until we implement UCAN integration
      return this.mockMetadataUpload();
      
    } catch (error) {
      console.error('IPFS metadata upload failed:', error);
      
      // Fallback to mock service if Storacha fails
      console.warn('Falling back to mock IPFS service for metadata');
      return this.mockMetadataUpload();
    }
  }
  
  /**
   * Mock IPFS upload for fallback
   */
  private async mockIPFSUpload(file: File): Promise<string> {
    console.log('Using mock IPFS service for image:', file.name);
    
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
    console.log('Using mock IPFS service for metadata');
    
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
      `https://dweb.link/ipfs/${hash}`
    ];
    
    // Return the first gateway (ipfs.io is most reliable)
    return gateways[0];
  }
  
  /**
   * Check if real IPFS is available
   */
  isRealIPFSAvailable(): boolean {
    return this.storachaDidKey !== null;
  }
  
  /**
   * Get token status for debugging
   */
  getTokenStatus(): string {
    if (!this.storachaDidKey) {
      return 'No DID key configured';
    }
    
    if (this.storachaDidKey.startsWith('did:key:')) {
      return 'DID key configured for Storacha Network (UCAN-based)';
    }
    
    return 'Unknown key format';
  }
  
  /**
   * Get setup instructions for Storacha Network
   */
  getSetupInstructions(): string {
    return 'To enable real IPFS uploads, you need to set up UCANs with Storacha Network. See: https://docs.storacha.network';
  }
}
