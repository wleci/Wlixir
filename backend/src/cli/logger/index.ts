import signale from "signale";

/**
 * MessageLogger
 *
 * A wrapper around `signale` that provides scoped logging
 * with additional helpers like timers.
 */
class MessageLogger {
    private logger: signale.Signale;
    private timers = new Map<string, number>();

    /**
     * Create a new MessageLogger instance.
     * @param scopeName - Name of the scope for the logger (e.g., "API", "Database").
     */
    constructor(private scopeName: string) {
        this.configLogger();
        this.logger = signale.scope(this.scopeName);
    }

    /**
     * Configure global `signale` settings for all loggers.
     */
    private configLogger(): void {
        signale.config({
            displayFilename: false,
            displayTimestamp: true,
            displayDate: true,
            displayScope: true,
            displayBadge: true,
            displayLabel: true,
        });
    }

    // --- Standard log levels ---

    /**
     * Log an informational message.
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    info(message: string, ...args: any[]): void {
        this.logger.info(message, ...args);
    }

    /**
     * Log a success message.
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    success(message: string, ...args: any[]): void {
        this.logger.success(message, ...args);
    }

    /**
     * Log an error message.
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    error(message: string, ...args: any[]): void {
        this.logger.error(message, ...args);
    }

    /**
     * Log a warning message.
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    warn(message: string, ...args: any[]): void {
        this.logger.warn(message, ...args);
    }

    /**
     * Log a debug message.
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    debug(message: string, ...args: any[]): void {
        this.logger.debug(message, ...args);
    }

    /**
     * Log a generic message (no specific level).
     * @param message - The message to log.
     * @param args - Additional arguments to include.
     */
    log(message: string, ...args: any[]): void {
        this.logger.log(message, ...args);
    }

    // --- Simple timers ---

    /**
     * Start a timer with a given label.
     * Call `timeEnd(label)` to stop and log the duration.
     * @param label - Identifier for the timer.
     */
    time(label: string): void {
        this.timers.set(label, Date.now());
        this.debug(`⏱ start "${label}"`);
    }

    /**
     * Stop a timer and log the elapsed time in milliseconds.
     * If the timer does not exist, a warning is logged.
     * @param label - Identifier of the timer to stop.
     */
    timeEnd(label: string): void {
        const start = this.timers.get(label);
        if (start != null) {
            const ms = Date.now() - start;
            this.timers.delete(label);
            this.info(`⏱ "${label}" = ${ms}ms`);
        } else {
            this.warn(`Timer "${label}" does not exist`);
        }
    }
}

export default MessageLogger;
