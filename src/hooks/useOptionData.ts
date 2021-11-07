import { AllOptionIntentionsQuery, OptionType } from 'state/data/generated'
import { useAllOptionIntentionsQuery } from 'state/data/enhanced'
import ms from 'ms.macro'

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
