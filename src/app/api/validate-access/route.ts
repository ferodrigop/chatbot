import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
      
      // Store in httpOnly cookie (expires in 10 minutes)
      const cookieStore = await cookies()
      cookieStore.set('access_validated', validationToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'Access code validated' 
      })
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
