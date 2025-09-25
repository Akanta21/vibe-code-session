'use client'

import { useState, useRef, useEffect } from 'react'
import Captcha from './Captcha'

interface FormData {
  name: string
  email: string
  phone: string
  hasExperience: boolean
  toolsUsed: string
  projectIdea: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  projectIdea?: string
  captcha?: string
}

export default function SignupForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    hasExperience: false,
    toolsUsed: '',
    projectIdea: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0)
  const [spamWarning, setSpamWarning] = useState<string>('')
  
  const formRef = useRef<HTMLFormElement>(null)

  // Client-side spam detection
  const detectSpamClient = async (formData: FormData) => {
    const reasons: string[] = []
    let score = 0

    // Basic spam checks
    if (formData.name.length < 2 || formData.name.length > 50) {
      reasons.push('Invalid name length')
      score += 2
    }
    
    if (formData.projectIdea.length < 10 || formData.projectIdea.length > 500) {
      reasons.push('Invalid project idea length')
      score += 2
    }
    
    // Check for suspicious patterns
    const spamKeywords = ['spam', 'test', 'fake', 'bot', 'scam']
    const textToCheck = `${formData.name} ${formData.projectIdea}`.toLowerCase()
    
    spamKeywords.forEach(keyword => {
      if (textToCheck.includes(keyword)) {
        reasons.push(`Suspicious keyword: ${keyword}`)
        score += 3
      }
    })

    return {
      isSpam: score >= 5,
      reasons,
      score
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[+]?[\d\s-()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.projectIdea.trim()) {
      newErrors.projectIdea = 'Please tell us about your project idea'
    }

    if (!captchaVerified) {
      newErrors.captcha = 'Please complete the security verification'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateReference = (name: string, email: string): string => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
    const emailPart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    return `${cleanName}_${emailPart}_${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check for rapid submissions (cooldown period)
    const now = Date.now()
    const timeSinceLastSubmission = now - lastSubmissionTime
    
    if (timeSinceLastSubmission < 30000) { // 30 seconds cooldown
      setSpamWarning('Please wait 30 seconds between submissions')
      return
    }
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSpamWarning('')
    setLastSubmissionTime(now)

    try {
      const reference = generateReference(formData.name, formData.email)
      
      // Add client-side spam detection
      const spamCheck = await detectSpamClient(formData)
      if (spamCheck.isSpam) {
        setSpamWarning(`Submission blocked: ${spamCheck.reasons.join(', ')}`)
        setSubmitStatus('error')
        return
      }

      const response = await fetch('/api/telegram-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: { ...formData, reference },
          timestamp: now,
          userAgent: navigator.userAgent
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          hasExperience: false,
          toolsUsed: '',
          projectIdea: ''
        })
        setCaptchaVerified(false)
      } else {
        const errorData = await response.json()
        if (errorData.error === 'rate_limited') {
          setSpamWarning('Too many submissions. Please try again later.')
        } else if (errorData.error === 'duplicate') {
          setSpamWarning('You have already registered with this email/phone combination.')
        } else if (errorData.error === 'spam_detected') {
          setSpamWarning('Submission flagged as spam. Please review your information.')
        } else {
          throw new Error('Failed to submit registration')
        }
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-green-500/30">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-4">Registration Submitted!</h3>
            <p className="text-gray-300 mb-6">
              Thank you for registering! We've received your application and will send you payment details shortly.
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{
                background: 'linear-gradient(to right, #059669, #10b981)',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Join the Vibe! 🎨</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Personal Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="+65 9123 4567"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Experience Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Experience Assessment
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Have you vibe-coded before?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasExperience"
                    checked={formData.hasExperience === true}
                    onChange={() => handleInputChange('hasExperience', true)}
                    className="mr-2 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasExperience"
                    checked={formData.hasExperience === false}
                    onChange={() => handleInputChange('hasExperience', false)}
                    className="mr-2 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">No</span>
                </label>
              </div>
            </div>

            {formData.hasExperience && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What tools have you used?
                </label>
                <input
                  type="text"
                  value={formData.toolsUsed}
                  onChange={(e) => handleInputChange('toolsUsed', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., React, Node.js, Python, Figma..."
                />
              </div>
            )}
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Your Project Idea
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What idea do you want to build? *
              </label>
              <textarea
                value={formData.projectIdea}
                onChange={(e) => handleInputChange('projectIdea', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                  errors.projectIdea ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Describe your app idea... Keep it fun, simple, or quirky! Examples: playlist generator, snack tracker, quick scheduler"
              />
              {errors.projectIdea && <p className="text-red-400 text-sm mt-1">{errors.projectIdea}</p>}
            </div>
          </div>

          {/* Security Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Security Verification
            </h3>
            
            <Captcha 
              onVerify={setCaptchaVerified}
              className="mb-4"
            />
            {errors.captcha && <p className="text-red-400 text-sm">{errors.captcha}</p>}
          </div>

          {/* Submit Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="bg-purple-900/20 rounded-lg p-4 mb-6 border border-purple-500/30">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💰</span>
                <span className="text-lg font-semibold text-white">Event Fee: $10 SGD</span>
              </div>
              <p className="text-gray-300 text-sm">
                Payment details will be sent to you after registration review. Includes meals, swag, and networking!
              </p>
            </div>

            {(submitStatus === 'error' || spamWarning) && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  {spamWarning || 'Failed to submit registration. Please try again.'}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary glow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting 
                    ? 'linear-gradient(to right, #6b7280, #6b7280)'
                    : 'linear-gradient(to right, #059669, #10b981)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: 'white',
                }}
              >
                {isSubmitting ? 'Submitting...' : '🚀 Register for Vibe Coding'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}