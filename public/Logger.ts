/**
 * Enhanced Logging Utility
 * 
 * Provides structured logging with different levels for development and production.
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

class Logger {
    private currentLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG

    setLevel(level: LogLevel): void {
        this.currentLevel = level
    }

    debug(message: string, ...args: any[]): void {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args)
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.currentLevel <= LogLevel.INFO) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args)
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.currentLevel <= LogLevel.WARN) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args)
        }
    }

    error(message: string, error?: any, ...args: any[]): void {
        if (this.currentLevel <= LogLevel.ERROR) {
            const errorMsg = error instanceof Error ? error.message : error
            console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, errorMsg, ...args)
        }
    }

    throttle(locomotiveId: string, action: string, data?: any): void {
        const dataStr = data !== undefined ? ` ${typeof data === 'string' ? data : JSON.stringify(data)}` : ''
        this.debug(`Throttle command - Loco: ${locomotiveId}, Action: ${action}${dataStr}`)
    }

    dcc(command: string, address?: number, data?: any): void {
        this.debug(`DCC command - ${command}`, { address, data })
    }

    usb(event: string, details?: any): void {
        this.info(`USB event - ${event}`, details)
    }
}

export const logger = new Logger()