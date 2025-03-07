// interface ProductTrackable {
//   id: string | number;
//   title: string;
//   price: number;
// }

// // Only declare properties that don't already exist
// declare global {
//   interface Window {
//     dataLayer?: any[];
//     trackAddToCart?: (product: ProductTrackable) => void;
//     trackViewContent?: (product: ProductTrackable) => void;
//     trackInitiateCheckout?: (value: number) => void;
//     trackPurchase?: (value: number, orderId: string) => void;
//   }
// }

// export function initAnalytics() {
//   return `
//       (function() {
//         // Initialize GTM
//         window.dataLayer = window.dataLayer || [];

//         // GTM initialization
//         (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
//         new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
//         j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
//         'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
//         })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');

//         // Meta Pixel initialization
//         !function(f,b,e,v,n,t,s)
//         {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
//         n.callMethod.apply(n,arguments):n.queue.push(arguments)};
//         if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
//         n.queue=[];t=b.createElement(e);t.async=!0;
//         t.src=v;s=b.getElementsByTagName(e)[0];
//         s.parentNode.insertBefore(t,s)}(window, document,'script',
//         'https://connect.facebook.net/en_US/fbevents.js');
//         fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
//         fbq('track', 'PageView');

//         // Track page navigation
//         let lastPath = window.location.pathname + window.location.search;

//         // Set up a MutationObserver to detect navigation changes
//         const observer = new MutationObserver(() => {
//           const currentPath = window.location.pathname + window.location.search;
//           if (currentPath !== lastPath) {
//             lastPath = currentPath;
//             // Track page view in GTM
//             window.dataLayer.push({
//               event: 'page_view',
//               page: {
//                 path: window.location.pathname,
//                 search: window.location.search,
//                 title: document.title,
//               },
//             });

//             // Track in Meta Pixel
//             if (window.fbq) {
//               window.fbq('track', 'PageView');
//             }
//           }
//         });

//         // Start observing the document with the configured parameters
//         observer.observe(document.querySelector('html'), {
//           subtree: true,
//           childList: true,
//           characterData: false,
//           attributes: true,
//           attributeFilter: ['class']
//         });

//         // Make tracking functions available globally
//         window.trackAddToCart = function(product) {
//           if (typeof window.dataLayer !== 'undefined') {
//             window.dataLayer.push({
//               event: 'add_to_cart',
//               ecommerce: {
//                 items: [{
//                   item_id: product.id,
//                   item_name: product.title,
//                   price: product.price,
//                   currency: 'ZAR',
//                 }],
//               },
//             });
//           }

//           if (typeof window.fbq !== 'undefined') {
//             window.fbq('track', 'AddToCart', {
//               content_ids: [product.id],
//               content_name: product.title,
//               content_type: 'product',
//               value: product.price,
//               currency: 'ZAR'
//             });
//           }
//         };

//         window.trackViewContent = function(product) {
//           if (typeof window.dataLayer !== 'undefined') {
//             window.dataLayer.push({
//               event: 'view_item',
//               ecommerce: {
//                 items: [{
//                   item_id: product.id,
//                   item_name: product.title,
//                   price: product.price,
//                   currency: 'ZAR',
//                 }],
//               },
//             });
//           }

//           if (typeof window.fbq !== 'undefined') {
//             window.fbq('track', 'ViewContent', {
//               content_ids: [product.id],
//               content_name: product.title,
//               content_type: 'product',
//               value: product.price,
//               currency: 'ZAR'
//             });
//           }
//         };

//         window.trackInitiateCheckout = function(value) {
//           if (typeof window.dataLayer !== 'undefined') {
//             window.dataLayer.push({
//               event: 'begin_checkout',
//               ecommerce: {
//                 value: value,
//                 currency: 'ZAR',
//               },
//             });
//           }

//           if (typeof window.fbq !== 'undefined') {
//             window.fbq('track', 'InitiateCheckout', {
//               value: value,
//               currency: 'ZAR'
//             });
//           }
//         };

//         window.trackPurchase = function(value, orderId) {
//           if (typeof window.dataLayer !== 'undefined') {
//             window.dataLayer.push({
//               event: 'purchase',
//               ecommerce: {
//                 transaction_id: orderId,
//                 value: value,
//                 currency: 'ZAR',
//               },
//             });
//           }

//           if (typeof window.fbq !== 'undefined') {
//             window.fbq('track', 'Purchase', {
//               value: value,
//               currency: 'ZAR',
//               order_id: orderId
//             });
//           }
//         };
//       })();
//     `;
// }

// // Helper function to create the noscript iframe for GTM
// export function getGTMNoScript() {
//   return `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
// }
