import { SHOPIFY_CONFIG } from './config';

const WEBHOOK_TOPICS = [
  'products/create',
  'products/update',
  'products/delete',
  'inventory_levels/update',
  'orders/create',
  'customers/create',
  'customers/update',
] as const;

type WebhookTopic = typeof WEBHOOK_TOPICS[number];

interface WebhookSubscription {
  topic: WebhookTopic;
  address: string;
  format: 'json';
}

export async function createWebhookSubscription(subscription: WebhookSubscription) {
  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.domain}/admin/api/${SHOPIFY_CONFIG.apiVersion}/webhooks.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.adminAccessToken || '',
        },
        body: JSON.stringify({
          webhook: {
            topic: subscription.topic,
            address: subscription.address,
            format: subscription.format,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating webhook subscription:', error);
    throw error;
  }
}

export async function deleteWebhookSubscription(webhookId: string) {
  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.domain}/admin/api/${SHOPIFY_CONFIG.apiVersion}/webhooks/${webhookId}.json`,
      {
        method: 'DELETE',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.adminAccessToken || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting webhook subscription:', error);
    throw error;
  }
}

export async function listWebhookSubscriptions() {
  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.domain}/admin/api/${SHOPIFY_CONFIG.apiVersion}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.adminAccessToken || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list webhooks: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error listing webhook subscriptions:', error);
    throw error;
  }
}