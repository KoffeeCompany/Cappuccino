import { useOptionIntentions } from 'hooks/useOptionData'
import { useMemo } from 'react'
//import { OptionType } from 'state/data/generated'

export function usePutOptionIntentions() {
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions()

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
  const { isLoading, isUninitialized, isError, error, options } = useOptionIntentions()

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
