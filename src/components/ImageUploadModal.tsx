'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, ImageIcon, AlignLeft, AlignCenter, AlignRight, 
  Maximize2, Minimize2, Type, Check
} from 'lucide-react';

export interface ImageData {
  src: string;
  alt: string;
  caption: string;
  alignment: 'left' | 'center' | 'right' | 'inline';
  size: 'small' | 'medium' | 'large' | 'full';
  width?: number;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageData: ImageData) => void;
  existingImage?: ImageData | null;
}

const SIZE_PRESETS = {
  small: { label: 'Small', width: '25%', description: 'Quarter width' },
  medium: { label: 'Medium', width: '50%', description: 'Half width' },
  large: { label: 'Large', width: '75%', description: 'Three-quarter width' },
  full: { label: 'Full', width: '100%', description: 'Full width' },
};

export default function ImageUploadModal({ isOpen, onClose, onInsert, existingImage }: ImageUploadModalProps) {
  const [imageData, setImageData] = useState<ImageData>(existingImage || {
    src: '',
    alt: '',
    caption: '',
    alignment: 'center',
    size: 'medium',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG, etc.)');
      return;
    }

    // Check file size (max 5MB for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(prev => ({
        ...prev,
        src: reader.result as string,
        alt: prev.alt || file.name.replace(/\.[^/.]+$/, ''),
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Please enter an image URL');
      return;
    }
    setError(null);
    setImageData(prev => ({ ...prev, src: urlInput.trim() }));
  };

  const handleInsert = () => {
    if (!imageData.src) {
      setError('Please upload or enter an image URL');
      return;
    }
    onInsert(imageData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {existingImage ? 'Edit Figure' : 'Insert Figure'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Method Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMethod('upload')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                uploadMethod === 'upload'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                uploadMethod === 'url'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              From URL
            </button>
          </div>

          {/* Upload Zone */}
          {uploadMethod === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                Drop your image here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Load
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {imageData.src && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className={`${
                  imageData.alignment === 'center' ? 'flex justify-center' :
                  imageData.alignment === 'right' ? 'flex justify-end' : ''
                }`}>
                  <figure className={`${
                    imageData.size === 'small' ? 'w-1/4' :
                    imageData.size === 'medium' ? 'w-1/2' :
                    imageData.size === 'large' ? 'w-3/4' : 'w-full'
                  }`}>
                    <img
                      src={imageData.src}
                      alt={imageData.alt || 'Preview'}
                      className="w-full h-auto rounded"
                      onError={() => setError('Failed to load image')}
                    />
                    {imageData.caption && (
                      <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
                        {imageData.caption}
                      </figcaption>
                    )}
                  </figure>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Alt Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Alt Text <span className="text-gray-400 font-normal">(for accessibility)</span>
            </label>
            <input
              type="text"
              value={imageData.alt}
              onChange={(e) => setImageData(prev => ({ ...prev, alt: e.target.value }))}
              placeholder="Describe the image..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Type className="w-4 h-4 inline mr-1" />
              Figure Caption
            </label>
            <input
              type="text"
              value={imageData.caption}
              onChange={(e) => setImageData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Figure 1. Description of the figure..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500">
              NIH recommends clear, descriptive captions for all figures
            </p>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Maximize2 className="w-4 h-4 inline mr-1" />
              Figure Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(SIZE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setImageData(prev => ({ ...prev, size: key as ImageData['size'] }))}
                  className={`p-3 rounded-lg border-2 transition text-center ${
                    imageData.size === key
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{preset.label}</div>
                  <div className="text-xs text-gray-500">{preset.width}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Text Wrapping & Alignment
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setImageData(prev => ({ ...prev, alignment: 'left' }))}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                  imageData.alignment === 'left'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlignLeft className="w-5 h-5 mb-1" />
                <span className="text-xs">Float Left</span>
              </button>
              <button
                onClick={() => setImageData(prev => ({ ...prev, alignment: 'center' }))}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                  imageData.alignment === 'center'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlignCenter className="w-5 h-5 mb-1" />
                <span className="text-xs">Center</span>
              </button>
              <button
                onClick={() => setImageData(prev => ({ ...prev, alignment: 'right' }))}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                  imageData.alignment === 'right'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlignRight className="w-5 h-5 mb-1" />
                <span className="text-xs">Float Right</span>
              </button>
              <button
                onClick={() => setImageData(prev => ({ ...prev, alignment: 'inline' }))}
                className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                  imageData.alignment === 'inline'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minimize2 className="w-5 h-5 mb-1" />
                <span className="text-xs">Inline</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Float left/right allows text to wrap around the figure. Center blocks text flow.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!imageData.src}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {existingImage ? 'Update Figure' : 'Insert Figure'}
          </button>
        </div>
      </div>
    </div>
  );
}
