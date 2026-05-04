import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!backendUrl) {
      return NextResponse.json(
        { detail: 'NEXT_PUBLIC_API_URL is not configured in this deployment.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data: unknown = responseText;

    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      // Keep the raw text body if the upstream did not return JSON.
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          detail: 'Upstream login request failed',
          upstream_status: response.status,
          upstream_body: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in auth login proxy:', error);
    return NextResponse.json(
      {
        detail: 'Internal server error while forwarding login request',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
