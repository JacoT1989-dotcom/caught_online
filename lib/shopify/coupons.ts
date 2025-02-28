import { shopifyFetch } from './client';

const CHECK_DISCOUNT_CODE = `
  query checkDiscountCode($code: String!) {
    codeDiscountNodeByCode(code: $code) {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          codes(first: 1) {
            edges {
              node {
                code
              }
            }
          }
          customerSelection {
            ... on DiscountCustomerAll {
              allCustomers
            }
          }
          customerGets {
            value {
              ... on DiscountAmount {
                amount {
                  amount
                  currencyCode
                }
              }
              ... on DiscountPercentage {
                percentage
              }
            }
          }
        }
      }
    }
  }
`;

export async function checkCouponCode(code: string) {
  try {
    const { data } = await shopifyFetch({
      query: CHECK_DISCOUNT_CODE,
      variables: { code },
      cache: 'no-store',
    });

    if (!data?.codeDiscountNodeByCode) {
      throw new Error('Invalid coupon code');
    }

    const discount = data.codeDiscountNodeByCode.codeDiscount;
    const value = discount.customerGets.value;

    return {
      valid: true,
      type: 'percentage' in value ? 'percentage' : 'fixed',
      value: 'percentage' in value ? value.percentage : value.amount.amount,
      currencyCode: 'percentage' in value ? null : value.amount.currencyCode,
    };
  } catch (error) {
    console.error('Error checking coupon:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid coupon code',
    };
  }
}