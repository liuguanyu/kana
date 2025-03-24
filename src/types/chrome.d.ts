// Chrome扩展API类型声明
interface ChromeStorageArea {
  get(keys: string | string[] | object | null): Promise<any>;
  set(items: object): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

interface ChromeStorage {
  sync: ChromeStorageArea;
  local: ChromeStorageArea;
  session: ChromeStorageArea;
}

interface ChromeRuntime {
  sendMessage(message: any): Promise<any>;
  onMessage: {
    addListener(callback: (message: any, sender: any, sendResponse: Function) => void): void;
    removeListener(callback: Function): void;
  };
  onInstalled: {
    addListener(callback: (details: { reason: string; previousVersion?: string; }) => void): void;
  };
  getContexts: () => Promise<any[]>;
}

interface ChromeOffscreen {
  createDocument(options: {
    url: string;
    reasons: string[];
    justification: string;
  }): Promise<void>;
  hasDocument(options: {
    url: string;
  }): Promise<boolean>;
  closeDocument(): Promise<void>;
}

interface ChromeTts {
  speak(utterance: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
    onEvent?: (event: any) => void;
  }): void;
  stop(): void;
}

interface Chrome {
  storage: ChromeStorage;
  runtime: ChromeRuntime;
  tts: ChromeTts;
  offscreen: ChromeOffscreen;
}

declare const chrome: Chrome;
