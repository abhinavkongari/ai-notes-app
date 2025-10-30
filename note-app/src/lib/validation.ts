/**
 * Input validation utilities for security
 */

export interface ValidationError {
  code: 'EMPTY_INPUT' | 'TOO_LONG' | 'SUSPICIOUS_PATTERN';
  message: string;
}

// Maximum text length for AI processing (10KB)
const MAX_TEXT_LENGTH = 10000;

// Patterns that might indicate prompt injection attempts
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /forget\s+(all\s+)?previous\s+(instructions|context)/i,
  /you\s+are\s+now/i,
  /system\s+prompt/i,
  /new\s+(instructions|role|task):/i,
  /disregard\s+(all\s+)?(previous|above)/i,
];

/**
 * Validate text input before sending to AI
 * @param text - The text to validate
 * @throws ValidationError if validation fails
 */
export function validateAIInput(text: string): void {
  // Check for empty input
  if (!text || text.trim().length === 0) {
    const error: ValidationError = {
      code: 'EMPTY_INPUT',
      message: 'Text cannot be empty',
    };
    throw error;
  }

  // Check length limit
  if (text.length > MAX_TEXT_LENGTH) {
    const error: ValidationError = {
      code: 'TOO_LONG',
      message: `Text is too long (max ${MAX_TEXT_LENGTH.toLocaleString()} characters, got ${text.length.toLocaleString()})`,
    };
    throw error;
  }

  // Check for suspicious patterns (log warning but don't block)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      console.warn('[Security] Suspicious pattern detected in input:', pattern);
      // We log but don't throw - allows legitimate use cases
      // In production with backend, you might want to log this for monitoring
    }
  }
}

/**
 * Sanitize text by trimming and normalizing whitespace
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
}

/**
 * Get character count for display purposes
 * @param text - The text to count
 * @returns Character count and whether it exceeds limit
 */
export function getTextStats(text: string): {
  length: number;
  isOverLimit: boolean;
  percentOfLimit: number;
} {
  const length = text.length;
  return {
    length,
    isOverLimit: length > MAX_TEXT_LENGTH,
    percentOfLimit: Math.round((length / MAX_TEXT_LENGTH) * 100),
  };
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @returns true if format is valid, false otherwise
 */
export function validateAPIKeyFormat(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' and have specific format
  const openAIPattern = /^sk-[a-zA-Z0-9-_]{20,}$/;
  return openAIPattern.test(apiKey);
}
