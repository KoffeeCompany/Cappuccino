import { AllOptionIntentionsQuery, useAllOptionIntentionsQuery } from 'state/data/generated'
import ms from 'ms.macro'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { useMemo } from 'react'
import { OPTION_ADDRESSES, RESOLVER_ADDRESSES } from 'constants/addresses'
import { useActiveWeb3React } from './web3'
import { abi as IOptionABI } from 'abis/option.json'
import { Interface } from '@ethersproject/abi'
import { OptionInterface } from 'abis/types/Option'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { usePools } from './usePools'
import { BigNumber, ethers } from 'ethers'
import { OptionType } from 'constants/optiontype'

const OPTION_INTERFACE = new Interface(IOptionABI) as OptionInterface

export function useOptionIntentions(optionType: OptionType) {
  const { isLoading, isError, error, isUninitialized, data } = useAllOptionIntentionsQuery(
    {
      optionType: optionType,
      skip: 0,
    },
    {
      pollingInterval: ms`2m`,
    }
  )

  return {
    isLoading,
    isUninitialized,
    isError,
    error,
    options: data?.options as AllOptionIntentionsQuery['options'],
  }
}

export function useCreateOptionsData(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  optionType: OptionType,
  strike: BigNumber,
  notional: CurrencyAmount<Currency> | undefined,
  maturity: BigNumber | undefined,
  maker: string | null | undefined,
  price: CurrencyAmount<Currency> | undefined
): void {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { chainId } = useActiveWeb3React()

  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  const [poolState, pool] = usePools(poolKeys)[0]
  if (pool == null) {
    return
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const optionAddresses: (string | undefined)[] = useMemo(() => {
    if (chainId) {
      if (OPTION_ADDRESSES[chainId]) {
        return [OPTION_ADDRESSES[chainId]]
      }
      return [undefined]
    }
    return [undefined]
  }, [chainId])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resolverAddresses: (string | undefined)[] = useMemo(() => {
    if (chainId) {
      if (RESOLVER_ADDRESSES[chainId]) {
        return [RESOLVER_ADDRESSES[chainId]]
      }
      return [undefined]
    }
    return [undefined]
  }, [chainId])
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const createOption = useMultipleContractSingleData(optionAddresses, OPTION_INTERFACE, 'createOption', [
    {
      pool: pool,
      optionType: optionType,
      strike: strike,
      notional: ethers.utils.parseUnits(notional ? notional.toSignificant(5) : '0', notional?.currency.decimals),
      maturity: maturity,
      maker: maker,
      resolver: resolverAddresses,
      price: ethers.utils.parseUnits(price ? price.toSignificant(5) : '0', price?.currency.decimals),
    },
  ])
}
