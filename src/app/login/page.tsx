'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MessageSquare, Lock, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [accessCode, setAccessCode] = useState('')
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  
  // Check for error in URL (from OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Session expired or invalid. Please enter the access code again.')
      setIsCodeValid(false)
    }
  }, [searchParams])

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsValidating(true)
    setError('')
    
    try {
      // Call server-side validation endpoint
      const res = await fetch('/api/validate-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode }),
      })
      
      if (res.ok) {
        setIsCodeValid(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid access code. Please try again.')
        setAccessCode('')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError('Error signing in: ' + error.message)
    }
  }

  return (
    <div className="fixed h-full w-full bg-muted flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isCodeValid ? (
              <CheckCircle2 size={48} className="text-green-500" />
            ) : (
              <Lock size={48} className="text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isCodeValid ? 'Welcome to AI Chat' : 'Access Required'}
          </CardTitle>
          <CardDescription>
            {isCodeValid
              ? 'Sign in to start chatting and save your conversation history'
              : 'Enter the access code to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCodeValid ? (
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isValidating || !accessCode}>
                <Lock size={16} className="mr-2" />
                {isValidating ? 'Validating...' : 'Verify Access Code'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 p-3 rounded-md">
                <CheckCircle2 size={16} />
                <span>Access verified! You can now sign in.</span>
              </div>
              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full"
                size="lg"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed h-full w-full bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
