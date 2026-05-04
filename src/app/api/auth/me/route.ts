import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { detail: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { detail: 'NEXT_PUBLIC_API_URL is not configured in this deployment.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { detail: 'Internal server error while forwarding user info request' },
      { status: 500 }
    );
  }
}
