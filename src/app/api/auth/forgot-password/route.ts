import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!backendUrl) {
      return NextResponse.json(
        { detail: 'NEXT_PUBLIC_API_URL is not configured in this deployment.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data: unknown = responseText;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      // keep raw text
    }

    if (!response.ok) {
      const upstreamDetail = (data && (data as any).detail) || (data && (data as any).message) || data || response.statusText;
      return NextResponse.json({ detail: upstreamDetail }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in forgot-password proxy:', error);
    return NextResponse.json({ detail: 'Internal server error while forwarding request', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export const runtime = 'edge';
