// Meta Pixel initialization
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq: any;
  }
}

export function initPixel() {
  if (typeof window === 'undefined' || !PIXEL_ID) return;

  // Initialize Meta Pixel
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${PIXEL_ID}');
  `;
  document.head.appendChild(script);
}

export function trackPageView() {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
}

export function trackAddToCart(product: any) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.title,
    content_type: 'product',
    value: product.price,
    currency: 'ZAR'
  });
}

export function trackViewContent(product: any) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.title,
    content_type: 'product',
    value: product.price,
    currency: 'ZAR'
  });
}

export function trackInitiateCheckout(value: number) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', {
    value,
    currency: 'ZAR'
  });
}

export function trackPurchase(value: number, orderId: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Purchase', {
    value,
    currency: 'ZAR',
    order_id: orderId
  });
}

export function trackSubscriptionStart(plan: string, value: number) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('trackCustom', 'StartSubscription', {
    plan_type: plan,
    value,
    currency: 'ZAR'
  });
}