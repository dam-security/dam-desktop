import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logFile: string;
  private maxLogSize = 10 * 1024 * 1024; // 10MB
  private maxLogFiles = 5;

  private constructor() {
    const userDataPath = app.getPath('userData');
    const logsDir = path.join(userDataPath, 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    this.logFile = path.join(logsDir, 'dam-desktop.log');
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formattedMessage = this.formatMessage(message, ...args);
    const logEntry = `[${timestamp}] [${levelName}] ${formattedMessage}`;

    // Log to console
    this.logToConsole(level, logEntry);

    // Log to file
    this.logToFile(logEntry);
  }

  private formatMessage(message: string, ...args: any[]): string {
    let formatted = message;
    
    if (args.length > 0) {
      formatted += ' ' + args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');
    }
    
    return formatted;
  }

  private logToConsole(level: LogLevel, message: string): void {
    // Skip console logging in production or if stdout is not available
    if (process.env.NODE_ENV === 'production' || !process.stdout || process.stdout.destroyed) {
      return;
    }

    try {
      switch (level) {
        case LogLevel.DEBUG:
          if (console.debug) console.debug(message);
          break;
        case LogLevel.INFO:
          if (console.info) console.info(message);
          break;
        case LogLevel.WARN:
          if (console.warn) console.warn(message);
          break;
        case LogLevel.ERROR:
          if (console.error) console.error(message);
          break;
      }
    } catch (error) {
      // Silently ignore console errors (e.g., EPIPE when output is redirected)
      // Continue with file logging only
    }
  }

  private logToFile(message: string): void {
    try {
      // Check if log rotation is needed
      this.rotateLogsIfNeeded();
      
      // Append to log file
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogsIfNeeded(): void {
    try {
      if (!fs.existsSync(this.logFile)) {
        return;
      }

      const stats = fs.statSync(this.logFile);
      if (stats.size >= this.maxLogSize) {
        this.rotateLogs();
      }
    } catch (error) {
      console.error('Failed to check log file size:', error);
    }
  }

  private rotateLogs(): void {
    try {
      const logDir = path.dirname(this.logFile);
      const logName = path.basename(this.logFile, '.log');
      
      // Rotate existing log files
      for (let i = this.maxLogFiles - 1; i >= 1; i--) {
        const oldFile = path.join(logDir, `${logName}.${i}.log`);
        const newFile = path.join(logDir, `${logName}.${i + 1}.log`);
        
        if (fs.existsSync(oldFile)) {
          if (i === this.maxLogFiles - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
      
      // Move current log to .1
      const firstRotated = path.join(logDir, `${logName}.1.log`);
      if (fs.existsSync(this.logFile)) {
        fs.renameSync(this.logFile, firstRotated);
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  public clearLogs(): void {
    try {
      const logDir = path.dirname(this.logFile);
      const files = fs.readdirSync(logDir);
      
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(logDir, file));
        }
      });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  public getLogFiles(): string[] {
    try {
      const logDir = path.dirname(this.logFile);
      const files = fs.readdirSync(logDir);
      
      return files
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(logDir, file))
        .sort((a, b) => {
          const statA = fs.statSync(a);
          const statB = fs.statSync(b);
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
    } catch (error) {
      console.error('Failed to get log files:', error);
      return [];
    }
  }

  public getLogContent(filePath?: string): string {
    try {
      const file = filePath || this.logFile;
      if (fs.existsSync(file)) {
        return fs.readFileSync(file, 'utf8');
      }
      return '';
    } catch (error) {
      console.error('Failed to read log file:', error);
      return '';
    }
  }
}