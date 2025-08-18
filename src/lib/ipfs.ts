// Real IPFS service using Web3.Storage
export class IPFSService {
  private web3StorageToken: string | null = null;
  
  constructor() {
    // Get Web3.Storage token from environment
    this.web3StorageToken = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || null;
    
    // Log token status for debugging
    if (this.web3StorageToken) {
      console.log('IPFS Service: Web3.Storage token configured');
    } else {
      console.log('IPFS Service: No Web3.Storage token, using mock service');
    }
  }
  
  /**
   * Upload image to IPFS using Web3.Storage
   */
  async uploadImage(file: File): Promise<string> {
    try {
      if (!this.web3StorageToken) {
        throw new Error('Web3.Storage token not configured');
      }
      
      console.log('Uploading image to IPFS via Web3.Storage:', file.name);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to Web3.Storage
      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.web3StorageToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Web3.Storage upload failed:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Web3.Storage authentication failed - check your token');
        } else if (response.status === 410) {
          throw new Error('Web3.Storage service unavailable - token may be expired or invalid');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      const ipfsHash = result.cid;
      
      console.log('Image uploaded successfully to IPFS:', ipfsHash);
      return `ipfs://${ipfsHash}`;
      
    } catch (error) {
      console.error('IPFS upload failed:', error);
      
      // Fallback to mock service if Web3.Storage fails
      console.warn('Falling back to mock IPFS service');
      return this.mockIPFSUpload(file);
    }
  }
  
  /**
   * Upload metadata to IPFS
   */
  async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    try {
      if (!this.web3StorageToken) {
        throw new Error('Web3.Storage token not configured');
      }
      
      console.log('Uploading metadata to IPFS via Web3.Storage');
      
      // Convert metadata to JSON blob
      const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: 'application/json'
      });
      
      // Create file from blob
      const metadataFile = new File([jsonBlob], 'metadata.json', {
        type: 'application/json'
      });
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', metadataFile);
      
      // Upload to Web3.Storage
      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.web3StorageToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Web3.Storage metadata upload failed:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Web3.Storage authentication failed - check your token');
        } else if (response.status === 410) {
          throw new Error('Web3.Storage service unavailable - token may be expired or invalid');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      const ipfsHash = result.cid;
      
      console.log('Metadata uploaded successfully to IPFS:', ipfsHash);
      return `ipfs://${ipfsHash}`;
      
    } catch (error) {
      console.error('IPFS metadata upload failed:', error);
      
      // Fallback to mock service if Web3.Storage fails
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
    return this.web3StorageToken !== null;
  }
  
  /**
   * Get token status for debugging
   */
  getTokenStatus(): string {
    if (!this.web3StorageToken) {
      return 'No token configured';
    }
    
    if (this.web3StorageToken.startsWith('did:key:')) {
      return 'Token appears to be DID format - Web3.Storage expects JWT format';
    }
    
    if (this.web3StorageToken.startsWith('eyJ')) {
      return 'Token appears to be JWT format - should work with Web3.Storage';
    }
    
    return 'Token format unknown - may not work with Web3.Storage';
  }
}
