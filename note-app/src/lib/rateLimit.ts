/**
 * Client-side rate limiting for API calls
 */

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  isLimited: boolean;
}

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  /**
   * Create a new rate limiter
   * @param maxRequests - Maximum number of requests allowed in the time window
   * @param windowMs - Time window in milliseconds
   */
  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Clean up old requests outside the time window
   */
  private cleanup(): void {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
  }

  /**
   * Check if a new request can be made
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a new request
   * Should be called after successful request
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Get number of remaining requests in current window
   * @returns Number of requests remaining
   */
  getRemainingRequests(): number {
    this.cleanup();
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Get the time when the rate limit will reset
   * @returns Date when oldest request expires, or null if no requests
   */
  getResetTime(): Date | null {
    if (this.requests.length === 0) return null;

    const oldestRequest = Math.min(...this.requests);
    return new Date(oldestRequest + this.windowMs);
  }

  /**
   * Get current rate limit information
   * @returns Rate limit status information
   */
  getInfo(): RateLimitInfo {
    this.cleanup();
    const resetTime = this.getResetTime() || new Date(Date.now() + this.windowMs);

    return {
      remaining: this.getRemainingRequests(),
      resetTime,
      isLimited: !this.canMakeRequest(),
    };
  }

  /**
   * Reset the rate limiter (clear all recorded requests)
   * Useful for testing or manual reset
   */
  reset(): void {
    this.requests = [];
  }

  /**
   * Get a human-readable status message
   * @returns Status message
   */
  getStatusMessage(): string {
    const info = this.getInfo();

    if (info.isLimited) {
      const resetTime = info.resetTime.toLocaleTimeString();
      return `Rate limit exceeded. Please try again at ${resetTime}`;
    }

    return `${info.remaining} requests remaining`;
  }
}

// Export a singleton instance for AI requests
// Configured for 10 requests per minute
export const aiRateLimiter = new RateLimiter(10, 60000);

// Export the class for testing or custom instances
export { RateLimiter };
