import { useCreateOptionsData, useOptionIntentions } from 'hooks/useOptionData'
import { useMemo } from 'react'
import { OptionType } from 'state/data/generated'
import { Currency, Token, Price, CurrencyAmount } from '@uniswap/sdk-core'
import { Pool, FeeAmount } from '@uniswap/v3-sdk'
import { useActiveWeb3React } from 'hooks/web3'
import { Bound, Field } from 'state/mint/v3/actions'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { Maturity } from 'constants/maturity'
import { ethers } from 'ethers'

export function usePutOptionIntentions() {
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions(OptionType.Put)

  return useMemo(() => {
    return {
      isLoading,
      isUninitialized,
      isError,
      error,
      formattedData: !isLoading && !isUninitialized ? options : undefined,
    }
  }, [isLoading, isUninitialized, isError, error, options])
}

export function useCallOptionIntentions() {
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions(OptionType.Call)

  return useMemo(() => {
    return {
      isLoading,
      isUninitialized,
      isError,
      error,
      formattedData: !isLoading && !isUninitialized ? options : undefined,
    }
  }, [isLoading, isUninitialized, isError, error, options])
}

