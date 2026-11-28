import { formatMinorAmountIntl } from '@buildbase/sdk';

/**
 * An amount in minor units, shown in the currency's own decimals: 500 JPY
 * is ¥500, 500 USD cents is $5.00 (studio issue #575). Never divide by 100
 * by hand: zero-decimal currencies would come out a hundred times too small.
 */
export function formatMinorAmount(amount: number, currency: string): string {
  return formatMinorAmountIntl(amount, currency, 'en');
}
