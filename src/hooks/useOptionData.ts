import { AllOptionIntentionsQuery, OptionType } from 'state/data/generated'
import { useAllOptionIntentionsQuery } from 'state/data/enhanced'
import ms from 'ms.macro'
// import { useMultipleContractSingleData } from 'state/multicall/hooks'
// import { useMemo } from 'react'
// import { OPTION_ADDRESSES } from 'constants/addresses'
import { useActiveWeb3React } from './web3'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function createOptions() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  //const { chainId } = useActiveWeb3React()
  // const transformed: (OptionData | null)[] = useMemo(() => {
  //   return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
  //     if (!chainId || !currencyA || !currencyB || !feeAmount) return null
  //     const tokenA = currencyA?.wrapped
  //     const tokenB = currencyB?.wrapped
  //     if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
  //     const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
  //     return [token0, token1, feeAmount]
  //   })
  // }, [chainId, poolKeys])
  // const optionAddresses: (string | undefined)[] = useMemo(() => {
  //   const optionAddress = chainId && OPTION_ADDRESSES[chainId]
  //   return transformed.map((value) => {
  //     if (!v3CoreFactoryAddress || !value) return undefined
  //     return computePoolAddress({
  //       factoryAddress: v3CoreFactoryAddress,
  //       tokenA: value[0],
  //       tokenB: value[1],
  //       fee: value[2],
  //     })
  //   })
  // }, [chainId, transformed])
  // const slot0s = useMultipleContractSingleData(optionAddresses, POOL_STATE_INTERFACE, 'slot0')
}
