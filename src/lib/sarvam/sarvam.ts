import { createSarvam } from 'sarvam-ai-provider';

export const sarvam = createSarvam({
  headers: {
    'api-subscription-key': process.env.SARVAM_API_KEY || '',
  },
});