// lib/reviews/csv-parser.ts

import { CSVImportRow } from "./enhanced-product-middleware";

/**
 * CSV Parser Utility
 * 
 * This utility provides functions for parsing and validating CSV data
 * specifically formatted for Stamped.io review imports.
 */

/**
 * Parse CSV string into structured data
 * @param csvText The raw CSV text
 * @returns An array of objects representing the CSV rows
 */
export function parseCSV(csvText: string): CSVImportRow[] {
  // Split the CSV into rows
  const rows = csvText.split(/\r\n|\n/);
  
  // Skip empty rows
  const nonEmptyRows = rows.filter(row => row.trim() !== '');
  
  if (nonEmptyRows.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row');
  }
  
  // Get headers from the first row
  const headerRow = parseCSVRow(nonEmptyRows[0]);
  const dataRows = nonEmptyRows.slice(1);
  
  // Validate required headers
  validateHeaders(headerRow);
  
  // Map each row to an object using the headers
  return dataRows.map(row => {
    const columns = parseCSVRow(row);
    const rowData: Record<string, string> = {};
    
    // Map columns to their corresponding headers
    headerRow.forEach((header, index) => {
      rowData[header] = index < columns.length ? columns[index] : '';
    });
    
    return rowData as CSVImportRow;
  });
}

/**
 * Parse a single CSV row, handling quoted values correctly
 * @param row A single row from the CSV
 * @returns An array of column values
 */
function parseCSVRow(row: string): string[] {
  const columns: string[] = [];
  let inQuotes = false;
  let currentColumn = '';
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = i + 1 < row.length ? row[i + 1] : '';
    
    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quotes ("") inside quoted string
      currentColumn += '"';
      i++; // Skip the next quote
    } else if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of column
      columns.push(currentColumn.trim());
      currentColumn = '';
    } else {
      // Add character to current column
      currentColumn += char;
    }
  }
  
  // Add the last column
  columns.push(currentColumn.trim());
  
  return columns;
}

/**
 * Validate CSV headers for required fields
 * @param headers Array of header strings
 * @throws Error if required fields are missing
 */
function validateHeaders(headers: string[]): void {
  const requiredFields = [
    'product_id',
    'rating',
    'author',
    'body',
    'created_at'
  ];
  
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new Error(`CSV is missing required headers: ${missingFields.join(', ')}`);
  }
}

/**
 * Validate CSV data rows against expected format
 * @param data Parsed CSV data
 * @returns Validation result with any errors
 */
export function validateCSVData(data: CSVImportRow[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (data.length === 0) {
    errors.push('No review data found in CSV');
    return { valid: false, errors, warnings };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because index is 0-based and we skip header row
    
    // Validate required fields
    if (!row.product_id) {
      errors.push(`Row ${rowNum}: Missing product_id`);
    }
    
    // Validate rating (must be 1-5)
    const rating = parseInt(row.rating as string, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push(`Row ${rowNum}: Invalid rating (must be 1-5)`);
    }
    
    // Validate author
    if (!row.author) {
      errors.push(`Row ${rowNum}: Missing author name`);
    }
    
    // Validate review content
    if (!row.body) {
      errors.push(`Row ${rowNum}: Missing review body`);
    }
    
    // Validate date format (YYYY-MM-DD HH:MM:SS)
    if (!row.created_at) {
      errors.push(`Row ${rowNum}: Missing created_at date`);
    } else if (!isValidDateFormat(row.created_at)) {
      errors.push(`Row ${rowNum}: Invalid date format (must be YYYY-MM-DD HH:MM:SS)`);
    }
    
    // Check for optional fields that help with mapping
    if (!row.product_handle) {
      warnings.push(`Row ${rowNum}: Missing product_handle (recommended for better product mapping)`);
    }
    
    if (!row.productTitle) {
      warnings.push(`Row ${rowNum}: Missing productTitle (recommended for better product mapping)`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if a string matches the required date format
 * @param dateStr Date string to validate
 * @returns True if valid format
 */
function isValidDateFormat(dateStr: string): boolean {
  // Check YYYY-MM-DD HH:MM:SS format
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  
  // Additional validation for actual date validity
  const date = new Date(dateStr.replace(' ', 'T'));
  return !isNaN(date.getTime());
}

/**
 * Prepare CSV data for import by cleaning and transforming fields
 * @param data The parsed CSV data
 * @returns Cleaned data ready for import
 */
export function prepareCSVForImport(data: CSVImportRow[]): CSVImportRow[] {
  return data.map(row => {
    // Create a new object with cleaned/transformed data
    const cleanedRow: CSVImportRow = { ...row };
    
    // Ensure product_id is a string
    cleanedRow.product_id = row.product_id.toString();
    
    // Ensure rating is a number
    cleanedRow.rating = parseInt(row.rating as string, 10);
    
    // Convert published flag if needed
    if (typeof row.published === 'string') {
      cleanedRow.published = row.published.toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
    }
    
    // Ensure dates are properly formatted
    if (row.created_at && isValidDateFormat(row.created_at)) {
      // Already in correct format, no change needed
    } else if (row.created_at) {
      // Try to parse and reformat the date
      try {
        const date = new Date(row.created_at);
        if (!isNaN(date.getTime())) {
          cleanedRow.created_at = date.toISOString().replace('T', ' ').substring(0, 19);
        }
      } catch (e) {
        // Keep original if we can't reformat
      }
    }
    
    return cleanedRow;
  });
}