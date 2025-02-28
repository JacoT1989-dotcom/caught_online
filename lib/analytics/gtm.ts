// Google Tag Manager initialization
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Correctly define the global dataLayer
declare global {
  interface Window {
    dataLayer?: any[]; // Using optional modifier to match the error message
  }
}

export function initGTM() {
  if (typeof window === "undefined" || !GTM_ID) return;

  // Initialize dataLayer array if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Initialize Google Tag Manager
  const script = document.createElement("script");
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
}

// Update tracking functions to handle optional dataLayer
export function trackAddToCart(product: any) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          currency: "ZAR",
        },
      ],
    },
  });
}

export function trackViewItem(product: any) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: product.price,
          currency: "ZAR",
        },
      ],
    },
  });
}

export function trackBeginCheckout(items: any[], total: number) {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        currency: "ZAR",
      })),
      value: total,
      currency: "ZAR",
    },
  });
}
