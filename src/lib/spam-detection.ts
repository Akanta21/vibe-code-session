// Spam detection utilities
export interface SpamCheckResult {
  isSpam: boolean;
  reasons: string[];
  score: number;
}

export function detectSpam(formData: {
  name: string;
  email: string;
  phone: string;
  projectIdea: string;
}): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;

  // Check for suspicious patterns in name
  if (formData.name.length < 2) {
    reasons.push('Name too short');
    score += 2;
  }

  if (formData.name.length > 50) {
    reasons.push('Name too long');
    score += 1;
  }

  if (!/^[a-zA-Z\s'-]+$/.test(formData.name)) {
    reasons.push('Name contains invalid characters');
    score += 3;
  }

  if (formData.name.toLowerCase().includes('spam')) {
    reasons.push('Suspicious name content');
    score += 5;
  }

  // Check for suspicious email patterns
  const emailDomain = formData.email.split('@')[1]?.toLowerCase();
  const suspiciousDomains = [
    'tempmail',
    '10minutemail',
    'guerrillamail',
    'mailinator',
    'throwaway',
  ];

  if (
    suspiciousDomains.some((domain) => emailDomain?.includes(domain))
  ) {
    reasons.push('Suspicious email domain');
    score += 4;
  }

  if (
    formData.email.includes('+') &&
    formData.email.split('+')[1]?.includes('@')
  ) {
    // Email aliases might be used for multiple registrations
    score += 1;
  }

  // Check phone number
  if (!/^[+]?[\d\s-()]{8,15}$/.test(formData.phone)) {
    reasons.push('Invalid phone format');
    score += 2;
  }

  // Check for repeated digits (suspicious)
  const phoneDigits = formData.phone.replace(/\D/g, '');
  if (phoneDigits.length >= 8) {
    const uniqueDigits = new Set(phoneDigits).size;
    if (uniqueDigits <= 3) {
      reasons.push('Phone number has too many repeated digits');
      score += 3;
    }
  }

  // Check project idea
  if (formData.projectIdea.length < 10) {
    reasons.push('Project idea too short');
    score += 2;
  }

  if (formData.projectIdea.length > 500) {
    reasons.push('Project idea too long');
    score += 1;
  }

  // Check for spam keywords
  const spamKeywords = [
    'spam',
    'test',
    'fake',
    'bot',
    'scam',
    'money',
    'crypto',
    'bitcoin',
  ];
  const projectLower = formData.projectIdea.toLowerCase();
  const foundSpamKeywords = spamKeywords.filter((keyword) =>
    projectLower.includes(keyword)
  );

  if (foundSpamKeywords.length > 0) {
    reasons.push(
      `Suspicious keywords: ${foundSpamKeywords.join(', ')}`
    );
    score += foundSpamKeywords.length * 2;
  }

  // Check for excessive repetition
  const words = formData.projectIdea.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();

  words.forEach((word) => {
    if (word.length > 3) {
      // Only count meaningful words
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  const maxRepetition = Math.max(...Array.from(wordCounts.values()));
  if (maxRepetition > 3) {
    reasons.push('Excessive word repetition');
    score += 2;
  }

  // Check for gibberish (high ratio of consonants to vowels)
  const consonants =
    formData.projectIdea.match(
      /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g
    )?.length || 0;
  const vowels =
    formData.projectIdea.match(/[aeiouAEIOU]/g)?.length || 0;

  if (consonants > 0 && vowels > 0) {
    const consonantRatio = consonants / (consonants + vowels);
    if (consonantRatio > 0.8) {
      reasons.push('Text appears to be gibberish');
      score += 3;
    }
  }

  return {
    isSpam: score >= 8, // Threshold for spam detection
    reasons,
    score,
  };
}

// Check for duplicate submissions (simple in-memory store)
const submissionStore = new Map<string, number>();

export function checkDuplicateSubmission(
  email: string,
  phone: string
): boolean {
  const key = `${email.toLowerCase()}_${phone.replace(/\D/g, '')}`;
  const now = Date.now();
  const lastSubmission = submissionStore.get(key);

  if (lastSubmission && now - lastSubmission < 24 * 60 * 60 * 1000) {
    // 24 hours
    return true;
  }

  submissionStore.set(key, now);

  // Clean up old entries
  if (submissionStore.size > 1000) {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 days
    const keysToDelete: string[] = []
    
    submissionStore.forEach((timestamp, key) => {
      if (timestamp < cutoff) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      submissionStore.delete(key)
    })
  }

  return false;
}
