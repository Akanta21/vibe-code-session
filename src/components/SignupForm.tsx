'use client';

import { useState } from 'react';
import Captcha from './Captcha';
import VibeGenerator from './VibeGenerator';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  linkedinProfile: string;
  hasExperience: boolean;
  toolsUsed: string;
  projectIdea: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  linkedinProfile?: string;
  projectIdea?: string;
  captcha?: string;
}

export default function SignupForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedinProfile: 'https://linkedin.com/in/',
    hasExperience: false,
    toolsUsed: '',
    projectIdea: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] =
    useState<number>(0);
  const [spamWarning, setSpamWarning] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [generatedVibe, setGeneratedVibe] = useState<string>('');
  const [isGeneratingVibe, setIsGeneratingVibe] = useState(false);
  const [submittedName, setSubmittedName] = useState<string>('');
  const [submittedFormData, setSubmittedFormData] = useState<FormData | null>(null);

  // Generate kebab-case LinkedIn URL from name
  const generateLinkedInURL = (name: string): string => {
    if (!name.trim()) return 'https://linkedin.com/in/';

    const kebabCase = name
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    return `https://linkedin.com/in/${kebabCase}`;
  };

  // Client-side spam detection
  const detectSpamClient = async (formData: FormData) => {
    const reasons: string[] = [];
    let score = 0;

    // Basic spam checks
    if (formData.name.length < 2 || formData.name.length > 50) {
      reasons.push('Invalid name length');
      score += 2;
    }

    if (
      formData.projectIdea.length < 10 ||
      formData.projectIdea.length > 500
    ) {
      reasons.push('Invalid project idea length');
      score += 2;
    }

    // Check for suspicious patterns
    const spamKeywords = ['spam', 'test', 'fake', 'bot', 'scam'];
    const textToCheck =
      `${formData.name} ${formData.projectIdea}`.toLowerCase();

    spamKeywords.forEach((keyword) => {
      if (textToCheck.includes(keyword)) {
        reasons.push(`Suspicious keyword: ${keyword}`);
        score += 3;
      }
    });

    return {
      isSpam: score >= 5,
      reasons,
      score,
    };
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Step 1: Personal Information
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[+]?[\d\s-()]{8,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    } else if (step === 2) {
      // Step 2: Project & Experience
      if (!formData.projectIdea.trim()) {
        newErrors.projectIdea =
          'Please tell us about your project idea';
      }
    } else if (step === 3) {
      // Step 3: Final verification
      if (
        formData.linkedinProfile.trim() &&
        !/^https:\/\/(?:www\.)?linkedin\.com\/in\/.+$/.test(
          formData.linkedinProfile
        )
      ) {
        newErrors.linkedinProfile =
          'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)';
      }
      if (!captchaVerified) {
        newErrors.captcha =
          'Please complete the security verification';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    // Validate all steps for final submission
    return validateStep(1) && validateStep(2) && validateStep(3);
  };

  const generateReference = (name: string, email: string): string => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const emailPart = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}_${emailPart}_${timestamp}`;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for rapid submissions (cooldown period)
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;

    if (timeSinceLastSubmission < 30000) {
      // 30 seconds cooldown
      setSpamWarning('Please wait 30 seconds between submissions');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSpamWarning('');
    setLastSubmissionTime(now);

    try {
      const reference = generateReference(
        formData.name,
        formData.email
      );

      // Add client-side spam detection
      const spamCheck = await detectSpamClient(formData);
      if (spamCheck.isSpam) {
        setSpamWarning(
          `Submission blocked: ${spamCheck.reasons.join(', ')}`
        );
        setSubmitStatus('error');
        return;
      }

      const response = await fetch('/api/telegram-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: { ...formData, reference },
          timestamp: now,
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmittedName(formData.name); // Store name before resetting form
        setSubmittedFormData({ ...formData }); // Store form data for vibe generation

        // Start AI vibe generation with cool UI
        setIsGeneratingVibe(true);

        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          linkedinProfile: 'https://linkedin.com/in/',
          hasExperience: false,
          toolsUsed: '',
          projectIdea: '',
        });
        setCaptchaVerified(false);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'rate_limited') {
          setSpamWarning(
            'Too many submissions. Please try again later.'
          );
        } else if (errorData.error === 'duplicate') {
          setSpamWarning(
            'You have already registered with this email/phone combination.'
          );
        } else if (errorData.error === 'spam_detected') {
          setSpamWarning(
            'Submission flagged as spam. Please review your information.'
          );
        } else {
          throw new Error('Failed to submit registration');
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    const updates: Partial<FormData> = { [field]: value };

    // Auto-generate LinkedIn URL when name changes (only if LinkedIn field is empty or still auto-generated)
    if (field === 'name' && typeof value === 'string') {
      const currentLinkedIn = formData.linkedinProfile;
      const baseURL = 'https://linkedin.com/in/';

      // Only update LinkedIn if it's empty or still appears to be auto-generated
      if (
        !currentLinkedIn ||
        currentLinkedIn === baseURL ||
        currentLinkedIn.startsWith(baseURL)
      ) {
        const previousName = formData.name;
        const previousGenerated = previousName
          ? generateLinkedInURL(previousName)
          : baseURL;

        // Only update if current LinkedIn matches the previously generated one
        if (
          !currentLinkedIn ||
          currentLinkedIn === baseURL ||
          currentLinkedIn === previousGenerated
        ) {
          updates.linkedinProfile = generateLinkedInURL(value);
        }
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVibeGenerationComplete = (vibeCode: string) => {
    setGeneratedVibe(vibeCode);
    setIsGeneratingVibe(false);
  };

  const handleVibeGenerationError = () => {
    setIsGeneratingVibe(false);
    // Keep generatedVibe empty to show error state
  };

  const downloadVibeCode = () => {
    if (!generatedVibe) return;

    const blob = new Blob([generatedVibe], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submittedName.replace(/\s+/g, '_')}_vibe_code.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-green-500/30">
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              🎉
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Registration Submitted!
            </h3>
            <p className="text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
              Thank you for registering! We've received your
              application and will send you payment details shortly.
            </p>
          </div>

          {/* AI Generated Vibe Code Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <span className="mr-2">🤖</span>
                Your AI-Generated Vibe Code
              </h4>
              {generatedVibe && (
                <button
                  onClick={downloadVibeCode}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download
                </button>
              )}
            </div>

            {isGeneratingVibe ? (
              submittedFormData && (
                <VibeGenerator
                  projectIdea={submittedFormData.projectIdea}
                  hasExperience={submittedFormData.hasExperience}
                  toolsUsed={submittedFormData.toolsUsed}
                  name={submittedFormData.name}
                  onComplete={handleVibeGenerationComplete}
                  onError={handleVibeGenerationError}
                />
              )
            ) : generatedVibe ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                  {generatedVibe}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-center">
                  Failed to generate vibe code. You can create one
                  manually using the format in our documentation.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="btn-primary"
              style={{
                background:
                  'linear-gradient(to right, #059669, #10b981)',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
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
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Full-screen loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60]">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
            <p className="text-white text-lg sm:text-xl font-semibold">
              Processing your registration...
            </p>
            <p className="text-gray-300 text-sm sm:text-base mt-2 sm:mt-3">
              Please wait, this may take a moment
            </p>
            <div className="mt-4 sm:mt-6 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-purple-500/30 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Join the Vibe! 🎨
            </h2>
            <div className="flex items-center mt-2 space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep
                      ? 'bg-purple-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-400 ml-2">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`text-xl sm:text-2xl transition-colors ${
              isSubmitting
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            currentStep === totalSteps
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
          className="space-y-4 sm:space-y-6"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleInputChange('name', e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange('email', e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange('phone', e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base ${
                    errors.phone
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                  placeholder="+65 9123 4567"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Company/Organization (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    handleInputChange('company', e.target.value)
                  }
                  className={`w-full px-3 sm:px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base ${
                    errors.company
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                  placeholder="Your company or organization"
                />
                {errors.company && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.company}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Project & Experience */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Your Project Idea
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    What would you like to build? * (Very Important to
                    get you started)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {[
                      'Productivity App',
                      'Game/Fun Tool',
                      'Social Platform',
                      'Data Visualizer',
                      'Creative Tool',
                      'Other',
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          if (formData.projectIdea === option) {
                            handleInputChange('projectIdea', '');
                          } else {
                            handleInputChange('projectIdea', option);
                          }
                        }}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                          formData.projectIdea === option
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={
                      formData.projectIdea.startsWith(
                        'Productivity App'
                      ) ||
                      formData.projectIdea.startsWith(
                        'Game/Fun Tool'
                      ) ||
                      formData.projectIdea.startsWith(
                        'Social Platform'
                      ) ||
                      formData.projectIdea.startsWith(
                        'Data Visualizer'
                      ) ||
                      formData.projectIdea.startsWith(
                        'Creative Tool'
                      ) ||
                      formData.projectIdea.startsWith('Other')
                        ? formData.projectIdea === 'Other'
                          ? ''
                          : formData.projectIdea
                        : formData.projectIdea
                    }
                    onChange={(e) =>
                      handleInputChange('projectIdea', e.target.value)
                    }
                    rows={3}
                    className={`w-full px-3 sm:px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-base ${
                      errors.projectIdea
                        ? 'border-red-500'
                        : 'border-gray-600'
                    }`}
                    placeholder="Tell us more about your idea... Keep it simple! Examples: 'Habit tracker with friends', 'Meme generator', 'Quick note organizer'"
                  />
                  {errors.projectIdea && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.projectIdea}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Experience Level
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                    Have you vibe-coded before?
                  </label>
                  <div className="flex gap-4 sm:gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        checked={formData.hasExperience === true}
                        onChange={() =>
                          handleInputChange('hasExperience', true)
                        }
                        className="mr-2 text-purple-500 focus:ring-purple-500 w-4 h-4"
                      />
                      <span className="text-gray-300 text-sm sm:text-base">
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        checked={formData.hasExperience === false}
                        onChange={() =>
                          handleInputChange('hasExperience', false)
                        }
                        className="mr-2 text-purple-500 focus:ring-purple-500 w-4 h-4"
                      />
                      <span className="text-gray-300 text-sm sm:text-base">
                        No
                      </span>
                    </label>
                  </div>
                </div>

                {formData.hasExperience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      What tools have you used?
                    </label>
                    <input
                      type="text"
                      value={formData.toolsUsed}
                      onChange={(e) =>
                        handleInputChange('toolsUsed', e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                      placeholder="e.g., React, Node.js, Python, Figma..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Final Details & Verification */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Optional Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={(e) =>
                        handleInputChange(
                          'linkedinProfile',
                          e.target.value
                        )
                      }
                      className={`w-full px-3 sm:px-4 py-3 pr-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base ${
                        errors.linkedinProfile
                          ? 'border-red-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="https://linkedin.com/in/your-name"
                    />
                    <div className="absolute right-3 top-3 text-blue-400">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.linkedinProfile && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.linkedinProfile}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    💡 Auto-generated from your name - edit as needed
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> | </span>📋
                    Will be included in your event namecard for
                    networking
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Security Verification
                </h3>
                <Captcha
                  onVerify={setCaptchaVerified}
                  className="mb-3 sm:mb-4"
                />
                {errors.captcha && (
                  <p className="text-red-400 text-sm">
                    {errors.captcha}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="border-t border-gray-700 pt-4 sm:pt-6">
            <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-purple-500/30">
              <div className="flex items-center mb-2">
                <span className="text-xl sm:text-2xl mr-2">💰</span>
                <span className="text-base sm:text-lg font-semibold text-white">
                  Event Fee: $10 SGD
                </span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Payment details will be sent to you after registration
                review. Includes meals, swag, and networking!
              </p>
            </div>

            {(submitStatus === 'error' || spamWarning) && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  {spamWarning ||
                    'Failed to submit registration. Please try again.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto sm:min-w-[120px] px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center ${
                    isSubmitting
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <span className="mr-2">←</span>
                  <span>Previous</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:flex-1 px-4 sm:px-6 py-3.5 sm:py-4 rounded-lg transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center relative overflow-hidden ${
                  isSubmitting
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{
                  background: isSubmitting
                    ? 'linear-gradient(to right, #6b7280, #6b7280)'
                    : 'linear-gradient(135deg, #059669, #10b981, #34d399)',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: 'white',
                  boxShadow: isSubmitting 
                    ? 'none' 
                    : '0 4px 15px rgba(16, 185, 129, 0.3), 0 0 20px rgba(5, 150, 105, 0.2)',
                }}
              >
                {/* Animated shimmer effect for non-submitting state */}
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                )}
                
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
                    <span className="hidden sm:inline">Processing Registration...</span>
                    <span className="sm:hidden">Processing...</span>
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <span className="mr-2 text-lg">🚀</span>
                    <span className="hidden sm:inline">Register for Vibe Coding</span>
                    <span className="sm:hidden">Register Now</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">Continue</span>
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`w-full sm:w-auto sm:min-w-[100px] px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base border border-gray-600 ${
                  isSubmitting
                    ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
