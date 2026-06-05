import axios from 'axios';
import { PDFParse } from 'pdf-parse';
import { logger } from './logger';

export class PDFExtractor {
  static async extractTextFromUrl(url: string): Promise<string> {
    try {
      logger.info(`Extracting text from PDF URL: ${url}`);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const array = new Uint8Array(response.data);
      const parser = new PDFParse({ data: array });
      const result = await parser.getText();
      const cleanText = result.text
        .replace(/\n\s*\n/g, '\n')
        .replace(/[^\x20-\x7E\n]/g, '')
        .trim();
      
      const maxLength = 15000;
      if (cleanText.length > maxLength) {
        logger.info(`Successfully extracted ${cleanText.length} characters from PDF (truncating to ${maxLength})`);
        return cleanText.substring(0, maxLength) + '\n\n[Konten dokumen dipotong karena terlalu panjang untuk dianalisis]';
      }
      
      logger.info(`Successfully extracted ${cleanText.length} characters from PDF`);
      return cleanText;
    } catch (error) {
      logger.error('Error extracting text from PDF URL', error);
      throw new Error('Gagal mengekstrak teks dari file PDF. Pastikan file valid.');
    }
  }

  static async extractTextFromBase64(base64: string): Promise<string> {
    try {
      const buffer = Buffer.from(base64, 'base64');
      const array = new Uint8Array(buffer);
      const parser = new PDFParse({ data: array });
      const result = await parser.getText();
      const cleanText = result.text
        .replace(/\n\s*\n/g, '\n')
        .replace(/[^\x20-\x7E\n]/g, '')
        .trim();
      
      const maxLength = 15000;
      if (cleanText.length > maxLength) {
        logger.info(`Successfully extracted ${cleanText.length} characters from base64 PDF (truncating to ${maxLength})`);
        return cleanText.substring(0, maxLength) + '\n\n[Konten dokumen dipotong karena terlalu panjang untuk dianalisis]';
      }
      
      logger.info(`Successfully extracted ${cleanText.length} characters from base64 PDF`);
      return cleanText;
    } catch (error) {
      logger.error('Error extracting text from base64 PDF', error);
      return '';
    }
  }
}
