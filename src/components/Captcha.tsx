'use client'

import { useState, useEffect } from 'react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  className?: string
}

export default function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Generate random CAPTCHA text
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaText(result)
    setUserInput('')
    setIsVerified(false)
    onVerify(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setUserInput(value)
    
    if (value === captchaText) {
      setIsVerified(true)
      onVerify(true)
    } else {
      setIsVerified(false)
      onVerify(false)
    }
  }

  const handleRefresh = () => {
    if (attempts < 3) {
      generateCaptcha()
      setAttempts(prev => prev + 1)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Security Verification *
      </label>
      
      <div className="flex items-center gap-3">
        {/* CAPTCHA Display */}
        <div className="flex-1">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
            <div 
              className="text-2xl font-bold text-white tracking-widest select-none"
              style={{
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {captchaText}
            </div>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={attempts >= 3}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Refresh CAPTCHA"
        >
          🔄
        </button>
      </div>
      
      {/* Input Field */}
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Enter the code above"
        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
          userInput && !isVerified ? 'border-red-500' : 
          isVerified ? 'border-green-500' : 'border-gray-600'
        }`}
        maxLength={5}
        style={{ textTransform: 'uppercase' }}
      />
      
      {/* Status Messages */}
      {userInput && !isVerified && userInput.length === 5 && (
        <p className="text-red-400 text-sm">❌ Code doesn't match. Please try again.</p>
      )}
      
      {isVerified && (
        <p className="text-green-400 text-sm">✅ Verification successful!</p>
      )}
      
      {attempts >= 3 && (
        <p className="text-yellow-400 text-sm">⚠️ Maximum refresh attempts reached. Please contact support if you can't read the code.</p>
      )}
      
      <p className="text-gray-400 text-xs">
        This helps us prevent automated spam submissions.
      </p>
    </div>
  )
}