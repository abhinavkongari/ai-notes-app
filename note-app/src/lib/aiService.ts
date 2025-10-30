import OpenAI from 'openai';
import { validateAIInput } from './validation.js';
import { aiRateLimiter } from './rateLimit.js';
import { logger } from './logger.js';

// Get API key from localStorage (user settings only)
function getAPIKey(): string {
  const stored = localStorage.getItem('ai-api-key');
  if (stored) return stored;

  throw new Error('NO_API_KEY');
}

// Initialize OpenAI client
function getClient(): OpenAI {
  const apiKey = getAPIKey();
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });
}

export interface AIError {
  code: 'NO_API_KEY' | 'NETWORK_ERROR' | 'INVALID_API_KEY' | 'RATE_LIMIT' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  originalError?: unknown;
}

// Wrap API calls with error handling
async function callAI(
  prompt: string,
  systemMessage: string,
  options?: { model?: string; maxTokens?: number }
): Promise<string> {
  try {
    // Validate input
    validateAIInput(prompt);

    // Check rate limit
    if (!aiRateLimiter.canMakeRequest()) {
      const resetTime = aiRateLimiter.getResetTime();
      const timeString = resetTime ? resetTime.toLocaleTimeString() : 'soon';
      const aiError: AIError = {
        code: 'RATE_LIMIT',
        message: `Rate limit exceeded. Please try again at ${timeString}. (10 requests per minute)`,
      };
      throw aiError;
    }

    // Record request for rate limiting
    aiRateLimiter.recordRequest();

    const client = getClient();
    const model = options?.model || 'gpt-4o-mini';
    const maxTokens = options?.maxTokens || 500;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    return content.trim();
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string; status?: number };

    // Handle validation errors
    if (err.code === 'EMPTY_INPUT' || err.code === 'TOO_LONG' || err.code === 'SUSPICIOUS_PATTERN') {
      logger.warn('AI input validation failed', {
        errorCode: err.code,
        errorMessage: err.message,
      });
      const aiError: AIError = {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Validation error',
        originalError: error,
      };
      throw aiError;
    }

    // Handle rate limit errors (from our rate limiter)
    if (err.code === 'RATE_LIMIT') {
      logger.warn('AI rate limit exceeded', {
        message: err.message,
      });
      throw error; // Already properly formatted
    }
    // Transform errors into our standard format
    if (err.message === 'NO_API_KEY') {
      logger.error('AI service called without API key');
      const aiError: AIError = {
        code: 'NO_API_KEY',
        message: 'No API key found. Please add your OpenAI API key in settings.',
        originalError: error,
      };
      throw aiError;
    }

    if (err.code === 'ENOTFOUND' || err.message?.includes('network')) {
      logger.error('AI service network error', {
        errorCode: err.code,
        errorMessage: err.message,
      });
      const aiError: AIError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
        originalError: error,
      };
      throw aiError;
    }

    if (err.status === 401 || err.message?.includes('API key')) {
      logger.security('Invalid API key used', {
        errorStatus: err.status,
        errorMessage: err.message,
      });
      const aiError: AIError = {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key. Please check your key in settings.',
        originalError: error,
      };
      throw aiError;
    }

    if (err.status === 429) {
      logger.warn('OpenAI API rate limit hit', {
        errorStatus: err.status,
        errorMessage: err.message,
      });
      const aiError: AIError = {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again later.',
        originalError: error,
      };
      throw aiError;
    }

    // Unknown error
    logger.error('Unexpected AI service error', {
      errorMessage: err.message,
      errorStatus: err.status,
      errorCode: err.code,
    });
    const aiError: AIError = {
      code: 'UNKNOWN',
      message: err.message || 'An unexpected error occurred.',
      originalError: error,
    };
    throw aiError;
  }
}

// ====================
// Public API Functions
// ====================

/**
 * Improve the writing quality of the given text
 */
export async function improveWriting(text: string): Promise<string> {
  const systemMessage = `You are a writing assistant. Improve the given text by enhancing clarity, grammar, and flow.
Keep the same meaning and tone. Return only the improved text, nothing else.`;

  return callAI(text, systemMessage, { maxTokens: Math.ceil(text.length * 1.5) });
}

/**
 * Fix grammar and spelling errors
 */
export async function fixGrammar(text: string): Promise<string> {
  const systemMessage = `You are a grammar checker. Fix all grammar, spelling, and punctuation errors in the given text.
Keep the same meaning and style. Return only the corrected text, nothing else.`;

  return callAI(text, systemMessage, { maxTokens: Math.ceil(text.length * 1.2) });
}

/**
 * Make the text shorter while preserving meaning
 */
export async function makeShorter(text: string): Promise<string> {
  const systemMessage = `You are an editor. Make the given text more concise without losing important information.
Remove redundancy and wordiness. Return only the shortened text, nothing else.`;

  return callAI(text, systemMessage, { maxTokens: Math.ceil(text.length * 0.7) });
}

/**
 * Expand the text with more details
 */
export async function makeLonger(text: string): Promise<string> {
  const systemMessage = `You are a writing assistant. Expand the given text with more details, examples, and elaboration.
Keep the same tone and meaning. Return only the expanded text, nothing else.`;

  return callAI(text, systemMessage, { maxTokens: Math.ceil(text.length * 2) });
}

/**
 * Change the tone of the text
 */
export async function changeTone(text: string, tone: 'professional' | 'casual' | 'friendly'): Promise<string> {
  const toneDescriptions = {
    professional: 'formal, business-appropriate, and polished',
    casual: 'relaxed, conversational, and informal',
    friendly: 'warm, approachable, and personable',
  };

  const systemMessage = `You are a writing assistant. Rewrite the given text in a ${toneDescriptions[tone]} tone.
Keep the same meaning and information. Return only the rewritten text, nothing else.`;

  return callAI(text, systemMessage, { maxTokens: Math.ceil(text.length * 1.3) });
}

/**
 * Summarize the note content
 */
export async function summarizeNote(content: string): Promise<string> {
  const systemMessage = `You are a summarization assistant. Create a concise summary of the given text.
Extract the key points and main ideas. Format as 3-5 bullet points. Return only the summary, nothing else.`;

  return callAI(content, systemMessage, { maxTokens: 300 });
}

/**
 * Continue writing based on context
 */
export async function continueWriting(context: string): Promise<string> {
  const systemMessage = `You are a writing assistant. Continue writing based on the given context.
Match the style and tone of the existing text. Write 1-2 sentences that naturally follow. Return only the continuation, nothing else.`;

  return callAI(context, systemMessage, { maxTokens: 150 });
}

/**
 * Test the API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await callAI('Hello', 'Respond with just "OK"', { maxTokens: 10 });
    return true;
  } catch {
    return false;
  }
}
