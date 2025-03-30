'use client';

import React, { useState, useEffect } from 'react';

interface ProductMapping {
  shopifyId: string;
  stampedId: string;
  title: string;
  handle: string;
}

/**
 * Admin utility component to manage product ID mappings
 * Add this to an admin page to manage your product mappings
 */
export default function ProductMappingUtility() {
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [shopifyId, setShopifyId] = useState('');
  const [stampedId, setStampedId] = useState('');
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch existing mappings
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reviews/update-mapping');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.mappings) {
            setMappings(data.mappings);
          } else {
            setError(data.error || 'Failed to retrieve mappings');
          }
        } else {
          setError('Failed to fetch mappings');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching mappings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMappings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    
    if (!shopifyId || !stampedId) {
      setFormError('Both Shopify ID and Stamped ID are required');
      return;
    }
    
    try {
      const response = await fetch('/api/reviews/update-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopifyId,
          stampedId,
          title,
          handle,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || 'Mapping added successfully');
        setShopifyId('');
        setStampedId('');
        setTitle('');
        setHandle('');
        
        // Refresh mappings
        const mappingsResponse = await fetch('/api/reviews/update-mapping');
        if (mappingsResponse.ok) {
          const mappingsData = await mappingsResponse.json();
          if (mappingsData.success && mappingsData.mappings) {
            setMappings(mappingsData.mappings);
          }
        }
      } else {
        setFormError(data.error || 'Failed to add mapping');
      }
    } catch (err) {
      setFormError('Error connecting to server');
      console.error('Error adding mapping:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Product ID Mapping Utility</h2>
      
      {/* Add new mapping form */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Mapping</h3>
        
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {formError}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shopifyId" className="block font-medium text-gray-700 mb-1">
                Shopify Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="shopifyId"
                value={shopifyId}
                onChange={(e) => setShopifyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. 7954181881916"
                required
              />
            </div>
            
            <div>
              <label htmlFor="stampedId" className="block font-medium text-gray-700 mb-1">
                Stamped Product ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="stampedId"
                value={stampedId}
                onChange={(e) => setStampedId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. 22954"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="title" className="block font-medium text-gray-700 mb-1">
              Product Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Trout Ribbons | Oak Smoked | 500g Pack"
            />
          </div>
          
          <div>
            <label htmlFor="handle" className="block font-medium text-gray-700 mb-1">
              Product Handle
            </label>
            <input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. trout-ribbons-oak-smoked-500g"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Mapping
            </button>
          </div>
        </form>
      </div>
      
      {/* Existing mappings table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Mappings</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center p-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading mappings...</p>
          </div>
        ) : mappings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Shopify ID
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Stamped ID
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Product Title
                  </th>
                  <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Product Handle
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{mapping.shopifyId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{mapping.stampedId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{mapping.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{mapping.handle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-gray-600">No mappings found. Add your first mapping above.</p>
          </div>
        )}
      </div>
    </div>
  );
}