import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageSelect: (file: File | null) => void;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageSelect, 
  error 
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Service Image (Optional)
      </label>

      {preview ? (
        <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Service preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-purple-500 hover:bg-gray-50'
          }`}
        >
          <div className="text-center">
            {isDragging ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-purple-600" />
                <p className="mt-2 text-sm text-purple-600 font-medium">Drop image here</p>
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Recommended: Square image (1:1 ratio) for best display
      </p>
    </div>
  );
};

export default ImageUpload;