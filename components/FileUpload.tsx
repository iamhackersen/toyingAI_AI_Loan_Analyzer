import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndPass = (file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid PDF or Image file (JPEG, PNG).");
      return;
    }
    // Limit size to 10MB to be safe with client-side handling
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className={`p-4 rounded-full mb-4 ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <Upload className="w-8 h-8" />
          </div>
          <p className="mb-2 text-lg font-medium text-slate-700">
            {dragActive ? "Drop the file here" : "Click or drag to upload statement"}
          </p>
          <p className="text-sm text-slate-500">
            PDF, PNG, or JPG (max 10MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
         <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-blue-600 font-semibold mb-1">Step 1</div>
            <div className="text-xs text-slate-600">Upload Files</div>
         </div>
         <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-blue-600 font-semibold mb-1">Step 2</div>
            <div className="text-xs text-slate-600">Extract Data</div>
         </div>
         <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-blue-600 font-semibold mb-1">Step 3</div>
            <div className="text-xs text-slate-600">Calculate Ratios</div>
         </div>
         <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
            <div className="text-blue-600 font-semibold mb-1">Step 4</div>
            <div className="text-xs text-slate-600">Get Verdict</div>
         </div>
      </div>
    </div>
  );
};

export default FileUpload;