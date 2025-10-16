import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessCode } = await request.json()
    
    // Server-side only variable - NOT exposed to client
    const VALID_ACCESS_CODE = process.env.ACCESS_CODE
    
    if (!VALID_ACCESS_CODE) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    if (accessCode === VALID_ACCESS_CODE) {
      // Generate a validation token (simple UUID)
      const validationToken = crypto.randomUUID()
      
      // Create response with cookie
      const response = NextResponse.json({ 
        success: true,
        message: 'Access code validated' 
      })
      
      // Set httpOnly cookie (expires in 10 minutes)
      response.cookies.set('access_validated', validationToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      })
      
      return response
    }
    return NextResponse.json(
      { error: 'Invalid access code' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
