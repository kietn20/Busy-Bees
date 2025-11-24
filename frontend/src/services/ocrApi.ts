import api from './config';

interface OCRResponse {
  text: string;
}

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const response = await api.post<OCRResponse>('/ocr/extract-text', { imageData: base64Image });
  return response.data.text;
};