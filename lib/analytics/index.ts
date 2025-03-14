export interface TrackableProduct {
  id: string;
  title: string;
  price: number;
  image?: string;
  variantId?: string;
  quantity?: number;
}

export interface TrackableOrder {
  orderId: string;
  total: number;
  items: TrackableProduct[];
}

// Extend the ShopifyAnalytics interface for better type safety
interface ShopifyAnalyticsType {
  lib?: {
    track?: (eventName: string, eventData: any) => void;
    trackPageview?: () => void;
    trackProductRecommendationClick?: (product: any) => void;
  };
  meta?: {
    product?: {
      id: string;
      gid?: string;
      vendor?: string;
      type?: string;
      variants?: Array<{
        id: string;
        sku?: string;
        price: number;
        name: string;
        public_title?: string;
        available?: boolean;
      }>;
    };
    page?: {
      pageType: string;
      resourceType: string;
      resourceId: string;
    };
    currency?: string;
  };
}

// Declare global types
declare global {
  interface Window {
    dataLayer?: any[];
    trackSelectItem?: (product: TrackableProduct, listName?: string) => void;
    fbq?: any;
    gtag?: {
      apiResult?: {
        session_id?: string;
        client_id?: string;
      };
    };
    ShopifyAnalytics?: ShopifyAnalyticsType;
    ShopifyAnalyticsObject?: string;
    trackUserData?: () => void;
    trackFormSubmit?: (formData: { form_name: string }) => void;
    trackLinkClick?: (linkData: {
      link_name: string;
      link_url: string;
    }) => void;
    Shopify?: {
      Shop?: {
        products?: any[];
        currency?: string;
        locale?: string;
      };
    };

    _swat?: any; // Add if you're using Swat.io or similar
    DEBUG_ANALYTICS?: boolean;
    trackPageView?: () => void;
    trackAddToCart?: (product: TrackableProduct) => void;
    trackViewContent?: (product: TrackableProduct) => void;
    trackInitiateCheckout?: (value: number, items?: TrackableProduct[]) => void;
    trackPurchase?: (
      value: number,
      orderId: string,
      items?: TrackableProduct[]
    ) => void;
  }
}

// Analytics configuration
const config = {
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  CURRENCY: "ZAR",
  DEBUG: process.env.NODE_ENV === "development" || false,
};

/**
 * Log analytics events when in debug mode
 */
function debugLog(eventName: string, eventData: any): void {
  if (
    typeof window !== "undefined" &&
    (window.DEBUG_ANALYTICS || config.DEBUG)
  ) {
    console.group(`📊 Analytics Event: ${eventName}`);
    console.log("Data:", eventData);
    console.log("GTM Active:", !!window.dataLayer);
    console.log("Pixel Active:", !!window.fbq);
    console.log("Shopify Active:", !!window.ShopifyAnalytics?.lib);
    console.groupEnd();
  }
}

/**
 * Initialize all analytics platforms
 */
export function initAnalytics(): string {
  return `
    (function() {
      // Debug flag for development
      window.DEBUG_ANALYTICS = ${config.DEBUG};
      
      // Initialize dataLayer for GTM
      window.dataLayer = window.dataLayer || [];
      
      // Initialize GTM
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${config.GTM_ID}');
      
      // Initialize Meta Pixel
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.PIXEL_ID}');
      
      // Track initial page view
      if (window.fbq) fbq('track', 'PageView');
      
      // Make tracking functions available globally
      window.trackPageView = function() {
        try {
          // Track in dataLayer
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'page_view',
              page: {
                path: window.location.pathname,
                title: document.title,
              }
            });
          }
          
          // Track in Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'PageView');
          }
          
          // Track in Shopify Analytics
          if (window.ShopifyAnalytics?.lib?.track) {
            window.ShopifyAnalytics.lib.track('Page View', {
              path: window.location.pathname,
              title: document.title
            });
          }
          
          if (window.DEBUG_ANALYTICS) {
            console.log('📊 Page View tracked', window.location.pathname);
          }
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };

      window.trackSelectItem = function(product, listName) {
  try {
    // Validate product
    if (!product || !product.id || !product.title) {
      console.error('Invalid product data for trackSelectItem', product);
      return;
    }
    
    // Track in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'select_item',
        ecommerce: {
          item_list_name: listName || 'Product List',
          items: [{
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            currency: '${config.CURRENCY}',
            quantity: product.quantity || 1
          }]
        },
        cd_session_id: window.gtag ? window.gtag.apiResult?.session_id : undefined,
        cd_client_id: window.gtag ? window.gtag.apiResult?.client_id : undefined
      });
    }
    
    // Track in Facebook Pixel
    if (window.fbq) {
      window.fbq('trackCustom', 'SelectItem', {
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value: product.price,
        currency: '${config.CURRENCY}',
        content_category: listName
      });
    }
    
    // Track in Shopify Analytics
    if (window.ShopifyAnalytics?.lib?.trackProductRecommendationClick) {
      window.ShopifyAnalytics.lib.trackProductRecommendationClick({
        id: product.id,
        name: product.title,
        list: listName || 'Product List',
        price: product.price,
        currency: '${config.CURRENCY}',
        variant_id: product.variantId
      });
    }
    
    if (window.DEBUG_ANALYTICS) {
      console.log('📊 Select Item tracked', { product, listName });
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

      window.trackFormSubmit = function(formData) {
  try {
    // Validate data
    if (!formData || !formData.form_name) {
      console.error('Invalid form data for trackFormSubmit', formData);
      return;
    }
    
    // Track in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submit_attempt',
        form_name: formData.form_name,
        cd_session_id: window.gtag ? window.gtag.apiResult?.session_id : undefined,
        cd_client_id: window.gtag ? window.gtag.apiResult?.client_id : undefined
      });
    }
    
    if (window.DEBUG_ANALYTICS) {
      console.log('📊 Form Submit tracked', formData);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

window.trackUserData = function() {
  try {
    // Track in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'fetch_user_data',
        cd_session_id: window.gtag ? window.gtag.apiResult?.session_id : undefined,
        cd_client_id: window.gtag ? window.gtag.apiResult?.client_id : undefined
      });
    }
    
    if (window.DEBUG_ANALYTICS) {
      console.log('📊 User Data Fetch tracked', {
        cd_session_id: window.gtag?.apiResult?.session_id,
        cd_client_id: window.gtag?.apiResult?.client_id
      });
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

      window.trackLinkClick = function(linkData) {
  try {
    // Validate data
    if (!linkData || !linkData.link_url) {
      console.error('Invalid link data for trackLinkClick', linkData);
      return;
    }
    
    // Track in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'link_click',
        link_name: linkData.link_name || '',
        link_url: linkData.link_url,
        cd_session_id: window.gtag ? window.gtag.apiResult?.session_id : undefined,
        cd_client_id: window.gtag ? window.gtag.apiResult?.client_id : undefined
      });
    }
    
    if (window.DEBUG_ANALYTICS) {
      console.log('📊 Link Click tracked', linkData);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};
      
      window.trackAddToCart = function(product) {
        try {
          // Validate product
          if (!product || !product.id || !product.title) {
            console.error('Invalid product data for trackAddToCart', product);
            return;
          }
          
          // Normalize data
          const itemData = {
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            currency: '${config.CURRENCY}',
            quantity: product.quantity || 1
          };
          
          // Track in GTM
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'add_to_cart',
              ecommerce: {
                items: [itemData]
              }
            });
          }
          
          // Track in Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'AddToCart', {
              content_ids: [product.id],
              content_name: product.title,
              content_type: 'product',
              value: product.price,
              currency: '${config.CURRENCY}'
            });
          }
          
          // Track in Shopify Analytics
          if (window.ShopifyAnalytics?.lib?.track) {
            window.ShopifyAnalytics.lib.track('Added Product', {
              id: product.id,
              name: product.title,
              price: product.price,
              currency: '${config.CURRENCY}',
              variant_id: product.variantId
            });
          }
      
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };
      
      window.trackViewContent = function(product) {
        try {
         
          
          // Track in GTM
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'view_item',
              ecommerce: {
                items: [{
                  item_id: product.id,
                  item_name: product.title,
                  price: product.price,
                  currency: '${config.CURRENCY}'
                }]
              }
            });
          }
          
          // Track in Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'ViewContent', {
              content_ids: [product.id],
              content_name: product.title,
              content_type: 'product',
              value: product.price,
              currency: '${config.CURRENCY}'
            });
          }
          
          // Track in Shopify Analytics
          if (window.ShopifyAnalytics?.lib?.track) {
            window.ShopifyAnalytics.lib.track('Viewed Product', {
              id: product.id,
              name: product.title,
              price: product.price,
              currency: '${config.CURRENCY}'
            });
          }
          
          if (window.DEBUG_ANALYTICS) {
            console.log('📊 View Content tracked', product);
          }
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };
      
      window.trackInitiateCheckout = function(value, items) {
        try {
          // Track in GTM
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'begin_checkout',
              ecommerce: {
                value: value,
                currency: '${config.CURRENCY}',
                items: items && items.length ? items.map(item => ({
                  item_id: item.id,
                  item_name: item.title,
                  price: item.price,
                  quantity: item.quantity
                })) : []
              }
            });
          }
          
          // Track in Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              value: value,
              currency: '${config.CURRENCY}'
            });
          }
          
          // Track in Shopify Analytics
          if (window.ShopifyAnalytics?.lib?.track) {
            window.ShopifyAnalytics.lib.track('Started Checkout', {
              value: value,
              currency: '${config.CURRENCY}'
            });
          }
          
          if (window.DEBUG_ANALYTICS) {
            console.log('📊 Initiate Checkout tracked', { value, items });
          }
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };
      
      window.trackPurchase = function(value, orderId, items) {
        try {
          // Track in GTM
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'purchase',
              ecommerce: {
                transaction_id: orderId,
                value: value,
                currency: '${config.CURRENCY}',
                items: items && items.length ? items.map(item => ({
                  item_id: item.id,
                  item_name: item.title,
                  price: item.price,
                  quantity: item.quantity
                })) : []
              }
            });
          }
          
          // Track in Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: value,
              currency: '${config.CURRENCY}',
              order_id: orderId
            });
          }
          
          // Track in Shopify Analytics
          if (window.ShopifyAnalytics?.lib?.track) {
            window.ShopifyAnalytics.lib.track('Completed Order', {
              order_id: orderId,
              value: value,
              currency: '${config.CURRENCY}'
            });
          }
          
          if (window.DEBUG_ANALYTICS) {
            console.log('📊 Purchase tracked', { value, orderId, items });
          }
        } catch (error) {
          console.error('Analytics error:', error);
        }
      };
  
      // Track SPA navigation
      let lastPath = window.location.pathname;
      const observer = new MutationObserver(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          if (window.trackPageView) {
            window.trackPageView();
          }
        }
      });
      
      // Observe the document for navigation changes
      observer.observe(document, {
        subtree: true,
        childList: true
      });
    })();
    `;
}

// Helper function to get GTM noscript
export function getGTMNoScript(): string {
  return `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
}

// Module functions for component imports
export function trackPageView(): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackPageView === "function") {
      window.trackPageView();
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "page_view",
          page: {
            path: window.location.pathname,
            title: document.title,
          },
        });
      }

      if (window.fbq) {
        window.fbq("track", "PageView");
      }
    }

    debugLog("PageView", { path: window.location.pathname });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

export function trackAddToCart(product: TrackableProduct): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackAddToCart === "function") {
      window.trackAddToCart(product);
    } else {
      // Fallback implementation if global not available
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            items: [
              {
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                currency: config.CURRENCY,
                quantity: product.quantity || 1,
              },
            ],
          },
        });
      }

      if (window.fbq) {
        window.fbq("track", "AddToCart", {
          content_ids: [product.id],
          content_name: product.title,
          content_type: "product",
          value: product.price,
          currency: config.CURRENCY,
        });
      }
    }

    debugLog("AddToCart", product);
  } catch (error) {
    console.error("Failed to track add to cart:", error);
  }
}

export function trackViewContent(product: TrackableProduct): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackViewContent === "function") {
      window.trackViewContent(product);
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "view_item",
          ecommerce: {
            items: [
              {
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                currency: config.CURRENCY,
              },
            ],
          },
        });
      }

      if (window.fbq) {
        window.fbq("track", "ViewContent", {
          content_ids: [product.id],
          content_name: product.title,
          content_type: "product",
          value: product.price,
          currency: config.CURRENCY,
        });
      }
    }

    debugLog("ViewContent", product);
  } catch (error) {
    console.error("Failed to track view content:", error);
  }
}

export function trackInitiateCheckout(
  value: number,
  items?: TrackableProduct[]
): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackInitiateCheckout === "function") {
      window.trackInitiateCheckout(value, items);
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "begin_checkout",
          ecommerce: {
            value: value,
            currency: config.CURRENCY,
            items:
              items?.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity || 1,
              })) || [],
          },
        });
      }

      if (window.fbq) {
        window.fbq("track", "InitiateCheckout", {
          value: value,
          currency: config.CURRENCY,
        });
      }
    }

    debugLog("InitiateCheckout", { value, items });
  } catch (error) {
    console.error("Failed to track initiate checkout:", error);
  }
}

export function trackPurchase(
  value: number,
  orderId: string,
  items?: TrackableProduct[]
): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackPurchase === "function") {
      window.trackPurchase(value, orderId, items);
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: orderId,
            value: value,
            currency: config.CURRENCY,
            items:
              items?.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity || 1,
              })) || [],
          },
        });
      }

      if (window.fbq) {
        window.fbq("track", "Purchase", {
          value: value,
          currency: config.CURRENCY,
          order_id: orderId,
        });
      }
    }

    debugLog("Purchase", { value, orderId, items });
  } catch (error) {
    console.error("Failed to track purchase:", error);
  }
}

export function trackSubscription(plan: string, value: number): void {
  if (typeof window === "undefined") return;

  try {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "start_subscription",
        subscription: {
          plan_type: plan,
          value: value,
          currency: config.CURRENCY,
        },
      });
    }

    if (window.fbq) {
      window.fbq("trackCustom", "StartSubscription", {
        plan_type: plan,
        value: value,
        currency: config.CURRENCY,
      });
    }

    debugLog("Subscription", { plan, value });
  } catch (error) {
    console.error("Failed to track subscription:", error);
  }
}

export function trackLinkClick(linkName: string, linkUrl: string): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackLinkClick === "function") {
      window.trackLinkClick({
        link_name: linkName,
        link_url: linkUrl,
      });
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "link_click",
          link_name: linkName,
          link_url: linkUrl,
        });
      }
    }

    debugLog("LinkClick", { link_name: linkName, link_url: linkUrl });
  } catch (error) {
    console.error("Failed to track link click:", error);
  }
}

export function trackFormSubmit(formName: string): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackFormSubmit === "function") {
      window.trackFormSubmit({
        form_name: formName,
      });
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "form_submit_attempt",
          form_name: formName,
        });
      }
    }

    debugLog("FormSubmit", { form_name: formName });
  } catch (error) {
    console.error("Failed to track form submission:", error);
  }
}

export function trackUserData(): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackUserData === "function") {
      window.trackUserData();
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "fetch_user_data",
          cd_session_id: window.gtag?.apiResult?.session_id,
          cd_client_id: window.gtag?.apiResult?.client_id,
        });
      }
    }

    debugLog("FetchUserData", {
      cd_session_id: window.gtag?.apiResult?.session_id,
      cd_client_id: window.gtag?.apiResult?.client_id,
    });
  } catch (error) {
    console.error("Failed to track user data:", error);
  }
}

export function trackSelectItem(
  product: TrackableProduct,
  listName?: string
): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.trackSelectItem === "function") {
      window.trackSelectItem(product, listName);
    } else {
      // Fallback implementation
      if (window.dataLayer) {
        window.dataLayer.push({
          event: "select_item",
          ecommerce: {
            item_list_name: listName || "Product List",
            items: [
              {
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                currency: config.CURRENCY,
                quantity: product.quantity || 1,
              },
            ],
          },
          cd_session_id: window.gtag?.apiResult?.session_id,
          cd_client_id: window.gtag?.apiResult?.client_id,
        });
      }

      if (window.fbq) {
        window.fbq("trackCustom", "SelectItem", {
          content_ids: [product.id],
          content_name: product.title,
          content_type: "product",
          value: product.price,
          currency: config.CURRENCY,
          content_category: listName,
        });
      }
    }

    debugLog("SelectItem", { product, listName });
  } catch (error) {
    console.error("Failed to track item selection:", error);
  }
}
