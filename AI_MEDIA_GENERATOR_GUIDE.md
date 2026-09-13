# 🎨 AI Media Generator - Complete Feature Guide

## Overview

The AI Media Generator is a powerful new tool in the Student Tool Kit that allows students to create AI-generated images and videos for educational content. This feature supports:

- **Text-to-Image Generation**: Create images from text prompts
- **Image-to-Image Generation**: Transform existing images using AI
- **Text-to-Video Generation**: Create videos from text prompts (up to 60 seconds)
- **Image-to-Video Generation**: Animate images into videos
- **Multiple Styles**: Realistic, Educational, Illustration, 3D, Cartoon, Professional, Diagram
- **Aspect Ratios**: 1:1, 16:9, 9:16
- **Video Durations**: 5s, 10s, 15s, 30s, 45s, 60s (1 minute max)

## Features

### Image Generation

1. **Prompt Input**: Describe the image you want to generate
2. **Reference Image**: Upload an image to use as a reference (optional)
3. **Style Selection**: Choose from 7 different styles
4. **Aspect Ratio**: Select from 3 aspect ratios
5. **Generate**: Click to generate the image
6. **Preview**: View the generated image
7. **Download**: Download the image as PNG
8. **Share**: Share via WhatsApp or other platforms
9. **Regenerate**: Generate a new variation

### Video Generation

1. **Prompt Input**: Describe the video you want to create
2. **Reference Image**: Upload an image to animate (optional)
3. **Duration Selection**: Choose from 5s to 60s (1 minute max)
4. **Aspect Ratio**: Select from 3 aspect ratios
5. **Generate**: Start video generation (may take several minutes)
6. **Progress Tracking**: Real-time progress updates
7. **Preview**: Play the generated video
8. **Download**: Download the video as MP4
9. **Share**: Share via WhatsApp or other platforms
10. **Regenerate**: Generate a new variation

## Technical Architecture

### Service Layer

The AI Media Generator uses a provider-agnostic service architecture:

```
UI Component (MediaGeneratorPage)
    ↓
AI Media Service (aiMediaService.ts)
    ↓
AI Provider (Demo/Real)
    ↓
API Call
    ↓
Result
```

### Key Files

- **`src/pages/MediaGeneratorPage.tsx`**: Main UI component
- **`src/services/aiMediaService.ts`**: Service layer for AI operations
- **`src/data/tools.ts`**: Tool definition (added media-generator)
- **`src/App.tsx`**: Route configuration
- **`src/pages/StudentPage.tsx`**: Integration into Student Toolkit

### Provider Abstraction

The service supports multiple AI providers through a clean interface:

```typescript
interface MediaProvider {
  generateImage(request: ImageGenerationRequest): Promise<GenerationResult>;
  generateVideo(request: VideoGenerationRequest): Promise<GenerationResult>;
  getVideoStatus(jobId: string): Promise<VideoStatusResult>;
}
```

Currently includes:
- **DemoMediaProvider**: For testing without API keys
- **RealMediaProvider**: For production use with actual AI APIs

## Configuration

### Environment Variables

To enable real AI generation, add these to your `.env` file:

```env
# Media Generation API (e.g., Replicate, Stability AI, Runway)
VITE_MEDIA_API_KEY=your_api_key_here
VITE_MEDIA_API_URL=https://api.example.com/v1
```

### Supported Providers

The architecture supports any AI provider with a REST API:

- **Replicate**: For image and video generation
- **Stability AI**: For image generation
- **Runway ML**: For video generation
- **Custom APIs**: Any OpenAI-compatible API

## Usage Examples

### Example 1: Educational Infographic

**Prompt**: "Create a professional educational infographic explaining the water cycle with clear labels and arrows"

**Settings**:
- Style: Educational
- Aspect Ratio: 16:9
- Reference Image: None

**Result**: A clear, labeled infographic suitable for presentations

### Example 2: Animate a Diagram

**Prompt**: "Animate this diagram to show the process step by step"

**Settings**:
- Duration: 30 seconds
- Aspect Ratio: 16:9
- Reference Image: Upload diagram

**Result**: An animated video showing the process flow

### Example 3: Create Study Material

**Prompt**: "Create a 3D illustration of a plant cell with labeled organelles"

**Settings**:
- Style: 3D
- Aspect Ratio: 1:1
- Reference Image: None

**Result**: A detailed 3D illustration for study materials

## Sharing Features

### WhatsApp Sharing

The feature implements intelligent sharing:

1. **Web Share API** (Mobile): Attempts native file sharing
2. **Fallback** (Desktop): Opens WhatsApp with text/link
3. **Download Option**: Always available as backup

### Implementation Details

```typescript
// Try Web Share API first
if (navigator.share) {
  await navigator.share({
    files: [file],
    title: 'AI Media Generator',
    text: shareText,
  });
} else {
  // Fallback to WhatsApp URL
  window.open(whatsappUrl, '_blank');
}
```

## Error Handling

The feature includes comprehensive error handling:

- **Empty Prompt**: "Please enter a prompt describing the image/video"
- **Invalid Image**: "Unsupported image format. Please upload JPEG, PNG, or WebP"
- **File Too Large**: "Image is too large. Please upload an image smaller than 10MB"
- **Invalid Duration**: "Invalid video duration. Please select 5, 10, 15, 30, 45, or 60 seconds"
- **API Failure**: User-friendly error messages
- **Network Error**: "An unexpected error occurred. Please try again"
- **Timeout**: "Video generation is taking longer than expected"

## Mobile Optimization

The feature is fully optimized for mobile devices:

- **Responsive Design**: Adapts to all screen sizes
- **Touch-Friendly**: Large buttons and controls
- **Camera Integration**: Direct photo capture on mobile
- **Native Sharing**: Web Share API for seamless sharing
- **Progress Indicators**: Clear feedback during generation

## Performance Considerations

### Image Generation
- Typical generation time: 5-15 seconds
- Progress bar shows real-time updates
- No blocking of UI during generation

### Video Generation
- Typical generation time: 1-5 minutes (depending on duration)
- Asynchronous processing with job ID tracking
- Polling for status updates every 5 seconds
- Maximum wait time: 5 minutes before timeout

## Security

- **API Keys**: Stored in environment variables, never exposed in frontend
- **File Validation**: Client-side validation before upload
- **Size Limits**: 10MB max for images
- **Type Checking**: Only accepts JPEG, PNG, WebP formats
- **CORS**: Proper CORS headers for API calls

## Future Enhancements

Potential additions for future versions:

1. **Batch Generation**: Generate multiple variations at once
2. **History**: Save and revisit previous generations
3. **Templates**: Pre-built templates for common educational content
4. **Collaboration**: Share and collaborate on generated content
5. **Advanced Editing**: Post-generation editing capabilities
6. **More Styles**: Additional artistic styles
7. **Audio Generation**: Add background music/narration to videos
8. **Subtitles**: Auto-generate subtitles for videos

## Testing Checklist

Before deploying, verify:

- [ ] Image generation works with text prompt
- [ ] Image generation works with reference image
- [ ] Image generation works with prompt + reference
- [ ] Video generation works with text prompt
- [ ] Video generation works with reference image
- [ ] All video durations (5s, 10s, 15s, 30s, 45s, 60s) work
- [ ] Download works for images
- [ ] Download works for videos
- [ ] WhatsApp sharing works on mobile
- [ ] Fallback sharing works on desktop
- [ ] Error messages display correctly
- [ ] Progress indicators work
- [ ] Mobile responsive design works
- [ ] Dark mode works
- [ ] All styles generate correctly
- [ ] All aspect ratios work

## Integration with Existing Features

The AI Media Generator integrates seamlessly with:

- **Student Toolkit**: Appears as a tool in the Student section
- **History**: Generation history is tracked
- **Favorites**: Can be favorited for quick access
- **Theme**: Respects dark/light mode
- **Authentication**: Requires login to use
- **Navigation**: Accessible from Student Toolkit and direct URL

## API Integration Guide

To integrate with a real AI provider:

1. **Choose a Provider**: Select an AI service (Replicate, Stability AI, etc.)
2. **Get API Key**: Sign up and get your API key
3. **Update Environment**: Add `VITE_MEDIA_API_KEY` and `VITE_MEDIA_API_URL`
4. **Implement Provider**: Update `RealMediaProvider` in `aiMediaService.ts`
5. **Test**: Verify generation works with real API
6. **Deploy**: Push to production

### Example: Replicate Integration

```typescript
async generateImage(request: ImageGenerationRequest): Promise<GenerationResult> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'model-version-hash',
      input: {
        prompt: request.prompt,
        style: request.style,
        aspect_ratio: request.aspectRatio,
      }
    }),
  });
  
  const data = await response.json();
  // Poll for result...
}
```

## Support

For issues or questions:
- Check the browser console for errors
- Verify API keys are configured correctly
- Ensure the AI provider service is operational
- Check network connectivity

## License

This feature is part of the Student Tool Kit and follows the same license.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Author**: AI Utility Hub Team
