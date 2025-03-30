// app/api/reviews/import-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStampedClient } from '@/lib/reviews/enhanced-stamped-client';
import { processCSVImport } from '@/lib/reviews/enhanced-product-middleware';
import { parseCSV, validateCSVData, prepareCSVForImport } from '@/lib/reviews/csv-parser';

/**
 * API route for importing reviews from CSV data
 * This endpoint processes CSV imports and adds them to the Stamped.io system
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[ReviewsImport] Starting CSV import process');
    
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    // Validate the uploaded file
    if (!file) {
      console.log('[ReviewsImport] Error: No file uploaded');
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Check file type (should be .csv)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.log('[ReviewsImport] Error: Invalid file format:', file.name);
      return NextResponse.json(
        { success: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }
    
    console.log(`[ReviewsImport] Processing file: ${file.name}, size: ${file.size} bytes`);
    
    // Read the file content
    const fileContent = await file.text();
    
    try {
      // Parse CSV data using our robust parser
      const csvData = parseCSV(fileContent);
      console.log(`[ReviewsImport] Successfully parsed CSV with ${csvData.length} rows`);
      
      // Validate the CSV data
      const validation = validateCSVData(csvData);
      
      if (!validation.valid) {
        console.log('[ReviewsImport] CSV validation failed:', validation.errors);
        return NextResponse.json(
          { 
            success: false, 
            error: 'CSV validation failed', 
            validationErrors: validation.errors,
            validationWarnings: validation.warnings
          },
          { status: 400 }
        );
      }
      
      if (validation.warnings.length > 0) {
        console.log('[ReviewsImport] CSV validation warnings:', validation.warnings);
      }
      
      // Prepare the CSV data for import
      const preparedData = prepareCSVForImport(csvData);
      console.log(`[ReviewsImport] Prepared ${preparedData.length} rows for import`);
      
      // Process the CSV data to create product mappings
      const newMappings = processCSVImport(preparedData);
      console.log(`[ReviewsImport] Created ${newMappings.length} new product mappings`);
      
      // Initialize the Stamped client
      const stampedClient = new EnhancedStampedClient();
      
      // Import the reviews to Stamped
      console.log('[ReviewsImport] Starting import to Stamped.io');
      const importResult = await stampedClient.importReviewsFromCSV(preparedData);
      console.log('[ReviewsImport] Import complete:', importResult);
      
      // Return the result
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${preparedData.length} reviews`,
        newMappings: newMappings.length,
        importResult,
        warnings: validation.warnings
      });
    } catch (parseError) {
      console.error('[ReviewsImport] CSV parsing error:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: parseError instanceof Error ? 
            `CSV parsing error: ${parseError.message}` : 
            'Invalid CSV format'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[ReviewsImport] Unhandled error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred during import' 
      },
      { status: 500 }
    );
  }
}