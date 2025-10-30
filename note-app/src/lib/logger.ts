/**
 * Centralized error logging and monitoring system
 */

export interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'security';
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

class Logger {
  private logs: LogEvent[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs in memory

  /**
   * Log an event
   * @param level - Log level (info, warn, error, security)
   * @param message - Log message
   * @param context - Additional context data
   */
  log(level: LogEvent['level'], message: string, context?: Record<string, unknown>): void {
    const event: LogEvent = {
      level,
      message,
      context,
      timestamp: Date.now(),
    };

    // Add to in-memory log
    this.logs.push(event);

    // Keep only recent logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate method
    const consoleMethod = level === 'security' ? 'warn' : level;
    const prefix = `[${level.toUpperCase()}]`;

    if (context) {
      console[consoleMethod](prefix, message, context);
    } else {
      console[consoleMethod](prefix, message);
    }

    // In production, send critical logs to logging service
    if (import.meta.env.PROD && (level === 'error' || level === 'security')) {
      this.sendToLoggingService(event).catch(err => {
        // Failed to send log - silently fail to avoid recursion
        console.error('Failed to send log to service:', err);
      });
    }
  }

  /**
   * Log info level message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error level message
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log security-related event
   */
  security(message: string, context?: Record<string, unknown>): void {
    this.log('security', message, context);
  }

  /**
   * Get all logs or filter by level
   * @param level - Optional level to filter by
   * @returns Array of log events
   */
  getLogs(level?: LogEvent['level']): LogEvent[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Get recent logs (last N logs)
   * @param count - Number of recent logs to return
   * @returns Array of recent log events
   */
  getRecentLogs(count: number = 50): LogEvent[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs within a time range
   * @param startTime - Start timestamp (milliseconds)
   * @param endTime - End timestamp (milliseconds)
   * @returns Array of log events in range
   */
  getLogsByTimeRange(startTime: number, endTime: number): LogEvent[] {
    return this.logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   * @returns JSON string of all logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as a file
   */
  downloadLogs(): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Send log event to external logging service
   * In production, integrate with services like Sentry, LogRocket, etc.
   * @param event - Log event to send
   */
  private async sendToLoggingService(event: LogEvent): Promise<void> {
    // TODO: Implement integration with logging service
    // Example for future backend integration:
    /*
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch {
      // Silently fail - don't throw to avoid recursion
    }
    */

    // For now, just store in localStorage for persistence across sessions
    try {
      const existingLogs = localStorage.getItem('app-error-logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(event);

      // Keep only last 100 error logs in localStorage
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('app-error-logs', JSON.stringify(logs));
    } catch {
      // LocalStorage might be full - ignore
    }
  }

  /**
   * Get statistics about logged events
   * @returns Statistics object
   */
  getStatistics(): {
    total: number;
    byLevel: Record<LogEvent['level'], number>;
    lastHour: number;
  } {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const stats = {
      total: this.logs.length,
      byLevel: {
        info: 0,
        warn: 0,
        error: 0,
        security: 0,
      },
      lastHour: 0,
    };

    for (const log of this.logs) {
      stats.byLevel[log.level]++;
      if (log.timestamp >= oneHourAgo) {
        stats.lastHour++;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const logger = new Logger();

// Make logger available in development console
if (import.meta.env.DEV) {
  (window as unknown as { logger: Logger }).logger = logger;
}
