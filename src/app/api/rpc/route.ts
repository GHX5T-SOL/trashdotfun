import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔗 RPC Proxy - Forwarding request to Gorbagana RPC');
    console.log('🔗 RPC Proxy - This ensures ALL calls go through: RPC server → my server → frontend');
    
    // Forward the request to Gorbagana RPC
    const response = await fetch('https://rpc.gorbagana.wtf/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'solana-client': 'js/0.0.0-development', // Standard Solana client header
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('🔗 RPC Proxy - Gorbagana RPC returned error:', response.status, response.statusText);
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('🔗 RPC Proxy - Successfully forwarded request and received response');
    
    // Return the RPC response with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, solana-client',
      },
    });

  } catch (error) {
    console.error('🔗 RPC Proxy Error:', error);
    return NextResponse.json(
      { 
        error: 'RPC request failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'All RPC calls must go through: RPC server → my server → frontend'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, solana-client',
        },
      }
    );
  }
}

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, solana-client',
    },
  });
}
