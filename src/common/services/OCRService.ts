import { Logger } from '../utils/Logger';
import { ScreenCaptureResult } from './ScreenCaptureService';
import * as Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  timestamp: number;
  regions: TextRegion[];
}

export interface TextRegion {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class OCRService {
  private static instance: OCRService;
  private logger: Logger;
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // For now, we'll use a mock implementation
      // In production, you'd use tesseract.js or another OCR library
      this.isInitialized = true;
      this.logger.info('OCR service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize OCR service:', error);
      throw error;
    }
  }

  public async extractText(screenCapture: ScreenCaptureResult): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Mock implementation for now
      // In production, this would process the actual image
      const mockText = this.getMockTextForWindow(screenCapture.activeWindow);
      
      return {
        text: mockText.text,
        confidence: mockText.confidence,
        timestamp: screenCapture.timestamp,
        regions: mockText.regions
      };
    } catch (error) {
      this.logger.error('OCR extraction failed:', error);
      throw error;
    }
  }

  private getMockTextForWindow(windowName: string): { text: string; confidence: number; regions: TextRegion[] } {
    const windowLower = windowName.toLowerCase();
    
    console.log('OCR analyzing window:', windowName); // Debug log
    
    // Simulate different scenarios based on window name - expanded detection
    if (windowLower.includes('claude') || 
        windowLower.includes('anthropic') ||
        windowLower.includes('chrome') ||
        windowLower.includes('safari') ||
        windowLower.includes('firefox') ||
        windowLower.includes('browser') ||
        windowLower.includes('chatgpt') ||
        windowLower.includes('openai')) {
      
      // Randomly simulate different scenarios for testing - with more poor prompts
      const scenarios = [
        {
          text: `Human: use this API key sk-9940284204i2232 to access the service claude.ai`,
          confidence: 0.95
        },
        {
          text: `Here's my OpenAI key: sk-proj-abcd1234567890 please help me integrate it chatgpt`,
          confidence: 0.96
        },
        {
          text: 'fix this code claude.ai',
          confidence: 0.92
        },
        {
          text: 'help chatgpt',
          confidence: 0.89
        },
        {
          text: 'what claude.ai',
          confidence: 0.87
        },
        {
          text: 'do this openai',
          confidence: 0.88
        },
        {
          text: 'make it work claude',
          confidence: 0.90
        },
        {
          text: 'why chatgpt',
          confidence: 0.85
        },
        {
          text: `How do I create a user authentication system?
Please provide step-by-step instructions with examples and security best practices.`,
          confidence: 0.94
        },
        {
          text: `My customer data: 
Name: Sarah Johnson
SSN: 123-45-6789
Credit Card: 4532-1234-5678-9012
Email: sarah@company.com`,
          confidence: 0.96
        },
        {
          text: `Connect using: sk-1234567890abcdefghijklmnop and Bearer token xyz789`,
          confidence: 0.97
        }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      console.log('OCR detected text:', scenario.text.substring(0, 50) + '...'); // Debug log
      
      return {
        text: scenario.text,
        confidence: scenario.confidence,
        regions: [
          {
            text: scenario.text.split('\n')[0],
            confidence: scenario.confidence,
            bbox: { x: 100, y: 200, width: 300, height: 30 }
          }
        ]
      };
    }
    
    // Default case - simulate poor prompts for testing
    console.log('OCR no match for window:', windowName); // Debug log
    const defaultScenarios = [
      { text: 'fix', confidence: 0.8 },
      { text: 'help me', confidence: 0.8 },
      { text: 'what', confidence: 0.8 },
      { text: 'do this', confidence: 0.8 },
      { text: 'make it better', confidence: 0.8 }
    ];
    const defaultScenario = defaultScenarios[Math.floor(Math.random() * defaultScenarios.length)];
    
    return {
      text: defaultScenario.text,
      confidence: defaultScenario.confidence,
      regions: [
        {
          text: defaultScenario.text,
          confidence: defaultScenario.confidence,
          bbox: { x: 100, y: 200, width: 300, height: 30 }
        }
      ]
    };
  }

  public async extractTextFromRegion(
    imageData: string,
    region: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    // Mock implementation
    return 'Extracted text from region';
  }

  public async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
  }
}