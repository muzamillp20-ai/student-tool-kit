/**
 * AI Media Service - Provider-agnostic service for image and video generation
 * 
 * This service abstracts the AI provider implementation, allowing for easy
 * switching between different providers (Replicate, Stability AI, Runway, etc.)
 * 
 * Architecture:
 * UI → AI Media Service → AI Provider → Generation → Result
 */

// Types
export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  referenceImage?: File | null;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration: number; // in seconds (5, 10, 15, 30, 45, 60)
  aspectRatio?: string;
  referenceImage?: File | null;
}

export interface GenerationResult {
  success: boolean;
  data?: string; // URL or base64
  error?: string;
  jobId?: string; // For async video generation
}

export interface VideoStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  videoUrl?: string;
  error?: string;
}

// Provider interface - allows easy switching between AI providers
interface MediaProvider {
  generateImage(request: ImageGenerationRequest): Promise<GenerationResult>;
  generateVideo(request: VideoGenerationRequest): Promise<GenerationResult>;
  getVideoStatus(jobId: string): Promise<VideoStatusResult>;
}

// Demo provider for testing without API keys
class DemoMediaProvider implements MediaProvider {
  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call an actual AI image generation API
    // For demo purposes, we return a placeholder message
    return {
      success: false,
      error: 'Demo mode: Image generation requires API configuration. Please configure your AI provider in Settings.'
    };
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: false,
      error: 'Demo mode: Video generation requires API configuration. Please configure your AI provider in Settings.'
    };
  }

  async getVideoStatus(jobId: string): Promise<VideoStatusResult> {
    return {
      status: 'failed',
      error: 'Demo mode: Video generation requires API configuration.'
    };
  }
}

// Real provider implementation (to be configured with actual API)
class RealMediaProvider implements MediaProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    const env = (import.meta as any).env || {};
    this.apiKey = env.VITE_MEDIA_API_KEY || localStorage.getItem('ai-hub-media-api-key') || '';
    this.apiUrl = env.VITE_MEDIA_API_URL || localStorage.getItem('ai-hub-media-api-url') || '';
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Media API key not configured. Please add your API key in Settings.'
      };
    }

    try {
      // Convert reference image to base64 if provided
      let referenceImageBase64: string | undefined;
      if (request.referenceImage) {
        referenceImageBase64 = await this.fileToBase64(request.referenceImage);
      }

      // Example implementation for a generic image generation API
      // This would need to be adapted to the specific provider's API format
      const response = await fetch(this.apiUrl + '/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style,
          aspect_ratio: request.aspectRatio,
          reference_image: referenceImageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.image_url || data.data?.[0]?.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      };
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Media API key not configured. Please add your API key in Settings.'
      };
    }

    try {
      // Convert reference image to base64 if provided
      let referenceImageBase64: string | undefined;
      if (request.referenceImage) {
        referenceImageBase64 = await this.fileToBase64(request.referenceImage);
      }

      // Example implementation for async video generation
      const response = await fetch(this.apiUrl + '/videos/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: request.duration,
          aspect_ratio: request.aspectRatio,
          reference_image: referenceImageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        jobId: data.job_id || data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start video generation',
      };
    }
  }

  async getVideoStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.apiKey) {
      return {
        status: 'failed',
        error: 'Media API key not configured.',
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/videos/generations/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed with status ${response.status}`);
      }

      const data = await response.json();
      
      return {
        status: data.status,
        progress: data.progress,
        videoUrl: data.video_url || data.output?.video_url,
        error: data.error,
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to check video status',
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

// Service class that uses the appropriate provider
class AIMediaService {
  private provider: MediaProvider;

  constructor() {
    // Use real provider if API key is configured, otherwise use demo
    const env = (import.meta as any).env || {};
    const hasApiKey = env.VITE_MEDIA_API_KEY || localStorage.getItem('ai-hub-media-api-key');
    
    this.provider = hasApiKey ? new RealMediaProvider() : new DemoMediaProvider();
  }

  async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
    return this.provider.generateImage(request);
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResult> {
    return this.provider.generateVideo(request);
  }

  async getVideoStatus(jobId: string): Promise<VideoStatusResult> {
    return this.provider.getVideoStatus(jobId);
  }

  // Utility function to validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image is too large. Please upload an image smaller than 10MB.',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported image format. Please upload a JPEG, PNG, or WebP image.',
      };
    }

    return { valid: true };
  }

  // Utility function to validate video duration
  validateVideoDuration(duration: number): { valid: boolean; error?: string } {
    const allowedDurations = [5, 10, 15, 30, 45, 60];
    
    if (!allowedDurations.includes(duration)) {
      return {
        valid: false,
        error: 'Invalid video duration. Please select 5, 10, 15, 30, 45, or 60 seconds.',
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const aiMediaService = new AIMediaService();
