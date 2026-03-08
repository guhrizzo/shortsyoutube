export interface VideoAnalysis {
  id: string
  title: string
  duration: number
  thumbnail: string
  hooks: Hook[]
  segments: Segment[]
}

export interface Hook {
  id: string
  startTime: number
  endTime: number
  text: string
  confidence: number
  viralScore: number
}

export interface Segment {
  id: string
  startTime: number
  endTime: number
  transcript: string
  engagementScore: number
}