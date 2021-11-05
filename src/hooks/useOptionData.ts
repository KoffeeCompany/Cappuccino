import { AllOptionIntentionsQuery } from 'state/data/generated'
import { useAllOptionIntentionsQuery } from 'state/data/enhanced'
import ms from 'ms.macro'
import { OptionType } from 'state/options/slice'

export function useOptionIntentions(optionType: OptionType) {
  const { isLoading, isError, error, isUninitialized, data } = useAllOptionIntentionsQuery(
    {
      optionType: 'CALL',
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
    options: data?.swaps as AllOptionIntentionsQuery['swaps'],
  }
}
