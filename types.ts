
export enum View {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  LIVE = 'LIVE',
  INSIGHT = 'INSIGHT'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
