import { toast } from 'sonner';

const DRIP_API_TOKEN = '5e11be2242b436578d9a8bddc476da92';
const DRIP_ACCOUNT_ID = '9034946';

interface DripSubscriber {
  email: string;
  tags?: string[];
  custom_fields?: Record<string, string>;
}

export async function subscribeToNewsletter(subscriber: DripSubscriber) {
  try {
    const response = await fetch(`https://api.getdrip.com/v2/${DRIP_ACCOUNT_ID}/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(DRIP_API_TOKEN + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscribers: [subscriber],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    return true;
  } catch (error) {
    console.error('Drip API error:', error);
    throw error;
  }
}