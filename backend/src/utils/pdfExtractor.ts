import axios from 'axios';
const pdf = require('pdf-parse');
import { logger } from './logger';

export class PDFExtractor {
  /**
   * Extracts text from a PDF file given its URL
   * @param url The public URL of the PDF (e.g. from UploadThing)
   * @returns The extracted text content
   */
  static async extractTextFromUrl(url: string): Promise<string> {
    try {
      logger.info(`Extracting text from PDF URL: ${url}`);
      
      // 1. Download the PDF file as a buffer
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // 2. Parse the PDF
      const data = await pdf(buffer);

      // 3. Clean up the text (optional: remove extra whitespace)
      const cleanText = data.text
        .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
        .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
        .trim();

      logger.info(`Successfully extracted ${cleanText.length} characters from PDF`);
      return cleanText;
    } catch (error) {
      logger.error('Error extracting text from PDF URL', error);
      throw new Error('Gagal mengekstrak teks dari file PDF. Pastikan file valid.');
    }
  }
}
