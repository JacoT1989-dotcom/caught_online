import { shopifyFetch } from './client';

export async function getShopLocales() {
  const query = `
    query GetShopLocales {
      shop {
        name
        primaryDomain {
          url
          host
        }
        shipsToCountries
        paymentSettings {
          currencyCode
          acceptedCardBrands
          supportedDigitalWallets
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({ query });
    return data?.shop;
  } catch (error) {
    console.error('Error fetching shop locales:', error);
    return null;
  }
}

export async function getAvailableCountries() {
  const query = `
    query GetAvailableCountries {
      localization {
        availableCountries {
          currency {
            isoCode
            name
            symbol
          }
          isoCode
          name
        }
      }
    }
  `;

  try {
    const { data } = await shopifyFetch({ query });
    return data?.localization?.availableCountries || [];
  } catch (error) {
    console.error('Error fetching available countries:', error);
    return [];
  }
}