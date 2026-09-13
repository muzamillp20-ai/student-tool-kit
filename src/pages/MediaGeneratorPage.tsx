import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Video, Download, Share2, RefreshCw, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { aiMediaService, ImageGenerationRequest, VideoGenerationRequest } from '../services/aiMediaService';

type GenerationMode = 'image' | 'video';

export default function MediaGeneratorPage() {
  const [mode, setMode] = useState<GenerationMode>('image');
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string>('');
  const [imageStyle, setImageStyle] = useState('Educational');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [videoDuration, setVideoDuration] = useState(30);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [videoJobId, setVideoJobId] = useState<string>('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageStyles = ['Realistic', 'Educational', 'Illustration', '3D', 'Cartoon', 'Professional', 'Diagram'];
  const aspectRatios = ['1:1', '16:9', '9:16'];
  const videoDurations = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 45, label: '45 seconds' },
    { value: 60, label: '60 seconds (1 minute)' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = aiMediaService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setReferenceImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the image you want to generate.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    setGeneratedImage('');
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const request: ImageGenerationRequest = {
        prompt: prompt.trim(),
        style: imageStyle,
        aspectRatio: aspectRatio,
        referenceImage: referenceImage,
      };

      const result = await aiMediaService.generateImage(request);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success && result.data) {
        setGeneratedImage(result.data);
        setSuccessMessage('Image generated successfully!');
      } else {
        setError(result.error || 'Failed to generate image. Please try again.');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the video you want to generate.');
      return;
    }

    const durationValidation = aiMediaService.validateVideoDuration(videoDuration);
    if (!durationValidation.valid) {
      setError(durationValidation.error || 'Invalid video duration');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    setGeneratedVideo('');
    setVideoJobId('');
    setGenerationProgress(0);

    try {
      const request: VideoGenerationRequest = {
        prompt: prompt.trim(),
        duration: videoDuration,
        aspectRatio: aspectRatio,
        referenceImage: referenceImage,
      };

      const result = await aiMediaService.generateVideo(request);

      if (result.success && result.jobId) {
        setVideoJobId(result.jobId);
        setSuccessMessage('Video generation started! Checking status...');
        
        // Start polling for video status
        pollVideoStatus(result.jobId);
      } else {
        setError(result.error || 'Failed to start video generation. Please try again.');
        setIsGenerating(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max (5 seconds per attempt)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('Video generation is taking longer than expected. Please try again later.');
        setIsGenerating(false);
        return;
      }

      attempts++;
      setGenerationProgress(Math.min(90, attempts * 2));

      try {
        const status = await aiMediaService.getVideoStatus(jobId);

        if (status.status === 'completed' && status.videoUrl) {
          setGeneratedVideo(status.videoUrl);
          setGenerationProgress(100);
          setSuccessMessage('Video generated successfully!');
          setIsGenerating(false);
        } else if (status.status === 'failed') {
          setError(status.error || 'Video generation failed. Please try again.');
          setIsGenerating(false);
        } else if (status.status === 'processing' || status.status === 'pending') {
          // Continue polling after 5 seconds
          setTimeout(poll, 5000);
        }
      } catch (err) {
        setError('Failed to check video status. Please try again.');
        setIsGenerating(false);
      }
    };

    poll();
  };

  const handleDownload = () => {
    if (mode === 'image' && generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'student-toolkit-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (mode === 'video' && generatedVideo) {
      const link = document.createElement('a');
      link.href = generatedVideo;
      link.download = 'student-toolkit-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareWhatsApp = async () => {
    const shareText = `Check out this ${mode === 'image' ? 'image' : 'video'} I created with AI Media Generator!`;
    const shareUrl = window.location.href;

    // Try Web Share API first (for mobile devices)
    if (navigator.share) {
      try {
        if (mode === 'image' && generatedImage) {
          // Try to share the image file
          const response = await fetch(generatedImage);
          const blob = await response.blob();
          const file = new File([blob], 'student-toolkit-image.png', { type: blob.type });
          
          await navigator.share({
            title: 'AI Media Generator',
            text: shareText,
            files: [file],
          });
          return;
        } else if (mode === 'video' && generatedVideo) {
          // Try to share the video file
          const response = await fetch(generatedVideo);
          const blob = await response.blob();
          const file = new File([blob], 'student-toolkit-video.mp4', { type: blob.type });
          
          await navigator.share({
            title: 'AI Media Generator',
            text: shareText,
            files: [file],
          });
          return;
        }
      } catch (err) {
        // Web Share API failed or was cancelled, fall back to WhatsApp URL
        console.log('Web Share API failed, falling back to WhatsApp URL');
      }
    }

    // Fallback: Open WhatsApp with text and link
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');

    // Show message about downloading
    if ((mode === 'image' && generatedImage) || (mode === 'video' && generatedVideo)) {
      setSuccessMessage('Download the file and attach it to your WhatsApp message for the best experience.');
    }
  };

  const handleRegenerate = () => {
    if (mode === 'image') {
      handleGenerateImage();
    } else {
      handleGenerateVideo();
    }
  };

  const handleClear = () => {
    setPrompt('');
    setReferenceImage(null);
    setReferenceImagePreview('');
    setGeneratedImage('');
    setGeneratedVideo('');
    setVideoJobId('');
    setError('');
    setSuccessMessage('');
    setGenerationProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = () => {
    if (mode === 'image') {
      handleGenerateImage();
    } else {
      handleGenerateVideo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/student"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Student Tools
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 AI Media Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create stunning AI-generated images and videos for your educational content
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('image')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              mode === 'image'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <ImageIcon className="w-6 h-6 inline-block mr-2" />
            Generate Image
          </button>
          <button
            onClick={() => setMode('video')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              mode === 'video'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Video className="w-6 h-6 inline-block mr-2" />
            Generate Video
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {mode === 'image' ? 'Image Settings' : 'Video Settings'}
            </h2>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'image'
                    ? 'Describe the image you want to generate...'
                    : 'Describe the video you want to generate...'
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isGenerating}
              />
            </div>

            {/* Reference Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Image (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isGenerating}
              />
              {referenceImagePreview ? (
                <div className="relative">
                  <img
                    src={referenceImagePreview}
                    alt="Reference"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={removeReferenceImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={isGenerating}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                  disabled={isGenerating}
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload reference image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    JPEG, PNG, WebP (max 10MB)
                  </p>
                </button>
              )}
            </div>

            {/* Style Selection (Image mode) */}
            {mode === 'image' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Style
                </label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  {imageStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Duration Selection (Video mode) */}
            {mode === 'video' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (Max: 1 minute)
                </label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  {videoDurations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Aspect Ratio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      aspectRatio === ratio
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    disabled={isGenerating}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </span>
              ) : (
                `Generate ${mode === 'image' ? 'Image' : 'Video'}`
              )}
            </button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>
                    {mode === 'video' ? 'Creating your video...' : 'Generating your image...'}
                  </span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                {mode === 'video' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This may take a few minutes. Please wait...
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {mode === 'image' ? 'Generated Image' : 'Generated Video'}
            </h2>

            {/* Preview Area */}
            <div className="mb-6">
              {mode === 'image' ? (
                generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p>Your generated image will appear here</p>
                    </div>
                  </div>
                )
              ) : generatedVideo ? (
                <video
                  src={generatedVideo}
                  controls
                  className="w-full rounded-xl shadow-lg"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <Video className="w-16 h-16 mx-auto mb-2" />
                    <p>Your generated video will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(generatedImage || generatedVideo) && (
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download {mode === 'image' ? 'Image' : 'Video'}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#20BA5A] transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate
                </button>
                <button
                  onClick={handleClear}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
            💡 Tips for Best Results
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Be specific and detailed in your prompts</li>
            <li>• For educational content, mention the subject and style you want</li>
            <li>• Use reference images to guide the AI generation</li>
            <li>• Videos can be up to 60 seconds (1 minute) long</li>
            <li>• Generated content can be downloaded and shared on WhatsApp</li>
            <li>• Video generation may take a few minutes to complete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
