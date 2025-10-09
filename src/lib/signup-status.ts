export async function checkSignupStatus(): Promise<{ 
  enabled: boolean; 
  message?: string; 
}> {
  try {
    const response = await fetch('/api/signup-status');
    if (!response.ok) {
      // If endpoint doesn't exist or fails, assume signups are enabled
      return { enabled: true };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // If there's any error, assume signups are enabled
    console.warn('Failed to check signup status:', error);
    return { enabled: true };
  }
}

export function isSignupsDisabled(): boolean {
  return process.env.NEXT_PUBLIC_SIGNUPS_DISABLED === 'true';
}