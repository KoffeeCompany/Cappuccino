import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { WETH9_EXTENDED } from 'constants/tokens'
import { BigNumber } from 'ethers'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useCallback } from 'react'
import { Field } from 'state/mint/v3/actions'
import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'

export function isItAtMaxAmounts(
  maxAmounts: { CURRENCY_A?: CurrencyAmount<Currency> | undefined; CURRENCY_B?: CurrencyAmount<Currency> | undefined },
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount<Currency> | undefined
    CURRENCY_B?: CurrencyAmount<Currency> | undefined
  }
): { CURRENCY_A?: CurrencyAmount<Currency> | undefined; CURRENCY_B?: CurrencyAmount<Currency> | undefined } {
  return [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
    }
  }, {})
}

export function getMaxAmountToSpend(currencyBalances: {
  CURRENCY_A?: CurrencyAmount<Currency> | undefined
  CURRENCY_B?: CurrencyAmount<Currency> | undefined
}): { CURRENCY_A?: CurrencyAmount<Currency> | undefined; CURRENCY_B?: CurrencyAmount<Currency> | undefined } {
  return [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
    return {
      ...accumulator,
      [field]: maxAmountSpend(currencyBalances[field]),
    }
  }, {})
}

export function useHandleCurrencySelect(chainId: number | undefined) {
  return useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === 'ETH' || (chainId !== undefined && currencyIdNew === WETH9_EXTENDED[chainId]?.address)
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === 'ETH' || (chainId !== undefined && currencyIdOther === WETH9_EXTENDED[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )
}

export function useSetMaturityTimestamp(maturity: number) {
  const blockTimestamp = useCurrentBlockTimestamp()
  const maturityTimestamp: BigNumber | undefined = blockTimestamp?.add(maturity)
  return maturityTimestamp
}
