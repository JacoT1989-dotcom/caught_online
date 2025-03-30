'use client';

import React, { useState, useRef } from 'react';

interface ImportReviewsProps {
  onComplete?: (result: ImportResult) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  reviewCount?: number;
  newMappings?: number;
  errors?: string[];
}

export default function ImportReviews({ onComplete }: ImportReviewsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setErrorMsg(null);
    }
  };

  // Handle file upload and import
  const handleImport = async () => {
    if (!file) {
      setErrorMsg('Please select a CSV file to import');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Only CSV files are accepted');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);

      // Send the request to the import API
      const response = await fetch('/api/reviews/import-reviews', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const importResult: ImportResult = {
          success: true,
          message: data.message || 'Import completed successfully',
          reviewCount: data.importResult?.success || 0,
          newMappings: data.newMappings || 0,
          errors: data.importResult?.errors || [],
        };

        setResult(importResult);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(null);
        
        // Call the callback if provided
        if (onComplete) {
          onComplete(importResult);
        }
      } else {
        setErrorMsg(data.error || 'An error occurred during import');
        setResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch (error) {
      console.error('Error during import:', error);
      setErrorMsg('Network error. Please try again.');
      setResult({
        success: false,
        message: 'Network error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Import Reviews from CSV</h2>
      
      {/* Instructions */}
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="font-semibold text-blue-700 mb-2">Import Instructions</h3>
        <ol className="list-decimal pl-5 text-blue-700 text-sm space-y-1">
          <li>Download the <a href="https://docs.google.com/spreadsheets/d/1Qp5g9l3nldks9iKwP9SJMMLXLOuLZ0hZkqZS6YSfqVc/copy" target="_blank" rel="noopener noreferrer" className="underline">CSV template</a> and fill it with your review data</li>
          <li>Make sure all required fields are completed (product_id, author, rating, body, created_at)</li>
          <li>Format dates as YYYY-MM-DD HH:MM:SS (e.g., 2023-12-13 12:00:00)</li>
          <li>Save the file as CSV</li>
          <li>Upload the file using the form below</li>
        </ol>
      </div>
      
      {/* Upload form */}
      <div className="mb-6">
        <label
          htmlFor="csv-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          CSV File
        </label>
        <input
          type="file"
          id="csv-upload"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="block w-full border border-gray-300 rounded-md p-2 text-sm"
          disabled={isUploading}
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </div>
      
      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
          <p className="font-semibold">Error:</p>
          <p>{errorMsg}</p>
        </div>
      )}
      
      {/* Import button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={handleImport}
          disabled={!file || isUploading}
          className={`px-4 py-2 rounded text-white font-medium ${
            !file || isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-rose-400 hover:bg-rose-500'
          }`}
        >
          {isUploading ? 'Importing...' : 'Import Reviews'}
        </button>
      </div>
      
      {/* Result display */}
      {result && (
        <div className={`p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
        }`}>
          <h3 className={`font-semibold text-lg ${
            result.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.success ? 'Import Completed' : 'Import Failed'}
          </h3>
          
          <p className={`mt-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
          
          {result.success && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-500">Reviews Imported</p>
                <p className="text-2xl font-semibold">{result.reviewCount || 0}</p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-500">Product Mappings Created</p>
                <p className="text-2xl font-semibold">{result.newMappings || 0}</p>
              </div>
            </div>
          )}
          
          {/* Display any errors */}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Errors ({result.errors.length})</h4>
              <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border text-sm">
                {result.errors.map((error, i) => (
                  <p key={i} className="text-red-600 mb-1">{error}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}