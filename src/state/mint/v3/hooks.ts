import { t } from '@lingui/macro'
import { BIG_INT_ZERO } from '../../../constants/misc'
import { getTickToPrice } from 'utils/getTickToPrice'
import JSBI from 'jsbi'
import { PoolState } from '../../../hooks/usePools'
import {
  Pool,
  FeeAmount,
  Position,
  priceToClosestTick,
  TickMath,
  tickToPrice,
  TICK_SPACINGS,
  encodeSqrtRatioX96,
  nearestUsableTick,
} from '@uniswap/v3-sdk/dist/'
import { Currency, Token, CurrencyAmount, Price, Rounding } from '@uniswap/sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '../../../hooks/web3'
import { AppState } from '../../index'
import { tryParseAmount } from '../../swap/hooks'
import { useCurrencyBalances } from '../../wallet/hooks'
import {
  Field,
  Bound,
  typeInput,
  typeStartPriceInput,
  typeLeftRangeInput,
  typeRightRangeInput,
  setFullRange,
  premiumValueInput,
} from './actions'
import { tryParseTick } from './utils'
import { usePool } from 'hooks/usePools'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { abi as BondDaiContract } from '../../../abis/olympus/bonds/DaiContract.json';
import { abi as ReserveOhmDaiContract } from '../../../abis/olympus/reserves/OhmDai.json';
import { OLYMPUS_OHMDAI_BOND_ADDRESSES, OLYMPUS_OHMDAI_RESERVE_ADDRESSES } from 'constants/addresses'
import { useContract } from 'hooks/useContract'
import { bcvValueInput, strikeValueInput,liquidityValueInput, notionalValueInput } from '../olympus/actions'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

export function useV3MintState(): AppState['mintV3'] {
  return useAppSelector((state) => state.mintV3)
}

export function useOlympusMintState(): AppState['mintOlympus'] {
  return useAppSelector((state) => state.mintOlympus)
}


export function useV3MintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  onStartPriceInput: (typedValue: string) => void
  onPremiumInput: (typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const onLeftRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeLeftRangeInput({ typedValue }))
    },
    [dispatch]
  )

  const onRightRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeRightRangeInput({ typedValue }))
    },
    [dispatch]
  )

  const onStartPriceInput = useCallback(
    (typedValue: string) => {
      dispatch(typeStartPriceInput({ typedValue }))
    },
    [dispatch]
  )

  const onPremiumInput = useCallback(
    (typedValue: string) => {
      dispatch(premiumValueInput({ field: Field.CURRENCY_A, typedValue }))
      dispatch(premiumValueInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )

  return {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
    onPremiumInput
  }
}

export function useOlympusMintActionHandlers(): {
  onBcvInput: (typedValue: string) => void
  onStrikeInput: (typedValue: string) => void
  onLiquidityInput: (typedValue: string) => void
  onNotionalInput: (typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onStrikeInput = useCallback(
    (typedValue: string) => {
      dispatch(strikeValueInput({ field: Field.CURRENCY_A, typedValue }))
      dispatch(strikeValueInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )

  const onLiquidityInput = useCallback(
    (typedValue: string) => {
      dispatch(liquidityValueInput({ field: Field.CURRENCY_A, typedValue }))
      dispatch(liquidityValueInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )

  const onNotionalInput = useCallback(
    (typedValue: string) => {
      dispatch(notionalValueInput({ field: Field.CURRENCY_A, typedValue }))
      dispatch(notionalValueInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )

  const onBcvInput = useCallback(
    (typedValue: string) => {
      dispatch(bcvValueInput({ typedValue }))
    },
    [dispatch]
  )

  return {
    onBcvInput,
    onStrikeInput,
    onLiquidityInput,
    onNotionalInput
  }
}

export function useOlympusDerivedMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  baseCurrency?: Currency
): {
    bondPrice?: Price<Currency, Currency>
    marketPrice?: Price<Currency, Currency>
    currencies: { [field in Field]?: Currency }
    currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
    dependentField: Field
    parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
    strikeAmounts: { [field in Field]?: CurrencyAmount<Currency> }
    liquidityAmounts: { [field in Field]?: CurrencyAmount<Currency> }
    notionalAmounts: { [field in Field]?: CurrencyAmount<Currency> }    
    errorMessage?: string
    invertPrice: boolean
} {
  const { account } = useActiveWeb3React()

  const { independentField, bcvValue, strikeValue, liquidityValue, notionalValue } = useOlympusMintState()
  
  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB]
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency]
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB]
  )

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  }

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  // always returns the price with 0 as base token
  //const {bondPrice, marketPrice} = useGetOhmDaiPrice(currencyA, currencyB)
  const bondPrice = new Price<Currency, Currency>(currencyA!, currencyB!, 1, '529010000000000000000')
  const marketPrice = new Price<Currency, Currency>(currencyA!, currencyB!, 1, '542720000000000000000000000000')
  
  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    '1',
    currencies[independentField]
  )

  const dependentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    bondPrice?.toSignificant(5),
    currencies[dependentField]
  )

  const independentStrikeAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    strikeValue,
    currencies[independentField]
  )

  const dependentStrikeAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    strikeValue,
    currencies[dependentField]
  )

  const independentLiquidityAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    liquidityValue,
    currencies[independentField]
  )

  const dependentLiquidityAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    liquidityValue,
    currencies[dependentField]
  )

  const independentNotionalAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    notionalValue,
    currencies[independentField]
  )

  const dependentNotionalAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    notionalValue,
    currencies[dependentField]
  )

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const strikeAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentStrikeAmount : dependentStrikeAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentStrikeAmount : independentStrikeAmount,
    }
  }, [independentStrikeAmount, dependentStrikeAmount, independentField])

  const liquidityAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentLiquidityAmount : dependentLiquidityAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentLiquidityAmount : independentLiquidityAmount,
    }
  }, [independentLiquidityAmount, dependentLiquidityAmount, independentField])   

  const notionalAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentNotionalAmount : dependentNotionalAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentNotionalAmount : independentNotionalAmount,
    }
  }, [independentNotionalAmount, dependentNotionalAmount, independentField])   

  const errorMessage: string | undefined = handleOlympusErrorMessage(
    account, 
    bcvValue, 
    parsedAmounts, 
    notionalAmounts,
    strikeAmounts, 
    liquidityAmounts,
    currencyBalances, 
    currencies)

  return {
    dependentField,
    currencies,
    currencyBalances,
    parsedAmounts,
    strikeAmounts,
    liquidityAmounts,
    notionalAmounts,
    bondPrice,
    marketPrice, 
    errorMessage,
    invertPrice,
  }
}

export function useV3DerivedMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  // override for existing position
  existingPosition?: Position
): {
  pool?: Pool | null
  poolState: PoolState
  ticks: { [bound in Bound]?: number | undefined }
  price?: Price<Token, Token>
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  dependentField: Field
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  premiumAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  position: Position | undefined
  noLiquidity?: boolean
  errorMessage?: string
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
} {
  const { account } = useActiveWeb3React()

  // eslint-disable-next-line prefer-const
  let { independentField, typedValue, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue, premiumValue } =
    useV3MintState()
  
  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB]
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency]
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB]
  )

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  }

  // pool
  const [poolState, pool] = usePool(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], feeAmount)
  const noLiquidity = poolState === PoolState.NOT_EXISTS

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useGetPrice(noLiquidity, startPriceTypedValue, invertPrice, token0, token1, pool)

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    const invalid =
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    return invalid
  }, [price])

  // used for ratio calculation when pool not initialized
  const mockPool = useGetFakePool(tokenA, tokenB, feeAmount, price, invalidPrice)

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool

  // lower and upper limits in the tick space for `feeAmount`
  const tickSpaceLimits: {
    [bound in Bound]: number | undefined
  } = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount ? nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]) : undefined,
      [Bound.UPPER]: feeAmount ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]) : undefined,
    }),
    [feeAmount]
  )
  
  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks: {
    [key: string]: number | undefined
  } = useGetClosestTicks(
    existingPosition, 
    invertPrice, 
    rightRangeTypedValue, 
    leftRangeTypedValue, 
    tickSpaceLimits, 
    token1, 
    token0, 
    feeAmount)


  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useCheckTicksAtLimit(feeAmount, tickLower, tickSpaceLimits, tickUpper)

  // mark invalid range
  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  // always returns the price with 0 as base token
  const pricesAtTicks = useGetPricesAtTicks(token0, token1, ticks)
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice))
  )

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    typedValue,
    currencies[independentField]
  )

  const dependentAmount: CurrencyAmount<Currency> | undefined = useGetDependentAmount(
    independentAmount, 
    dependentField, 
    currencyB, 
    currencyA, 
    tickLower, 
    tickUpper, 
    poolForPosition,
    outOfRange, 
    invalidRange)  
  
  const independentPremiumAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    premiumValue,
    currencies[independentField]
  )

  const dependentPremiumAmount: CurrencyAmount<Currency> | undefined = tryParseAmount(
    premiumValue,
    currencies[dependentField]
  )

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const premiumAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentPremiumAmount : dependentPremiumAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentPremiumAmount : independentPremiumAmount,
    }
  }, [independentPremiumAmount, dependentPremiumAmount, independentField])
  

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower
  )

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA))
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB))
    )

  // create position entity based on users selection
  const position: Position | undefined = useCreatePosition(
    poolForPosition, 
    tokenA, 
    tokenB, 
    tickLower, 
    tickUpper, 
    invalidRange, 
    deposit0Disabled, 
    parsedAmounts, 
    deposit1Disabled)

  const errorMessage: string | undefined = handleErrorMessage(
    account, 
    poolState, 
    invalidPrice, 
    parsedAmounts, 
    depositADisabled, 
    depositBDisabled, 
    premiumAmounts, 
    currencyBalances, 
    currencies)

  const invalidPool = poolState === PoolState.INVALID

  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    premiumAmounts,
    ticks,
    price,
    pricesAtTicks,
    position,
    noLiquidity,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  }
}

function handleOlympusErrorMessage(
  account: string | null | undefined, 
  bcvValue: string | null | undefined,
  parsedAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  notionalAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  strikeAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  liquidityAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  currencyBalances: { CURRENCY_A?: CurrencyAmount<Currency> | undefined; CURRENCY_B?: CurrencyAmount<Currency> | undefined }, 
  currencies: { CURRENCY_A?: Currency | undefined; CURRENCY_B?: Currency | undefined }
): string | undefined {
  let errorMessage
  if (!account) {
    errorMessage = t`Connect Wallet`
  }

  if (!bcvValue) {
    errorMessage = t`Enter BCV constant`
  }

  if ((!strikeAmounts[Field.CURRENCY_A]) ||
    (!strikeAmounts[Field.CURRENCY_B])) {
    errorMessage = errorMessage ?? t`Enter a strike amount`
  }

  if ((!liquidityAmounts[Field.CURRENCY_A]) ||
    (!liquidityAmounts[Field.CURRENCY_B])) {
    errorMessage = errorMessage ?? t`Enter a liquidity amount`
  }

  // if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
  //   errorMessage = errorMessage ?? t`Enter an amount`
  // }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = notionalAmounts

  // if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
  //   errorMessage = t`Insufficient ${currencies[Field.CURRENCY_A]?.symbol} balance`
  // }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    errorMessage = t`Insufficient ${currencies[Field.CURRENCY_B]?.symbol} balance`
  }
  return errorMessage
}

function handleErrorMessage(
  account: string | null | undefined, 
  poolState: PoolState, 
  invalidPrice: boolean | undefined, 
  parsedAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  depositADisabled: boolean, 
  depositBDisabled: boolean, 
  premiumAmounts: { CURRENCY_A: CurrencyAmount<Currency> | undefined; CURRENCY_B: CurrencyAmount<Currency> | undefined }, 
  currencyBalances: { CURRENCY_A?: CurrencyAmount<Currency> | undefined; CURRENCY_B?: CurrencyAmount<Currency> | undefined }, 
  currencies: { CURRENCY_A?: Currency | undefined; CURRENCY_B?: Currency | undefined }
): string | undefined {
  let errorMessage
  if (!account) {
    errorMessage = t`Connect Wallet`
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? t`Invalid pair`
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? t`Invalid price input`
  }

  if ((!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)) {
    errorMessage = errorMessage ?? t`Enter an amount`
  }

  if (!premiumAmounts[Field.CURRENCY_A] || !premiumAmounts[Field.CURRENCY_B]) {
    errorMessage = errorMessage ?? t`Enter an amount`
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    errorMessage = t`Insufficient ${currencies[Field.CURRENCY_A]?.symbol} balance`
  }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    errorMessage = t`Insufficient ${currencies[Field.CURRENCY_B]?.symbol} balance`
  }
  return errorMessage
}

export function useGetDependentAmount(
  independentAmount: CurrencyAmount<Currency> | undefined, 
  dependentField: Field, 
  currencyB: Currency | undefined, 
  currencyA: Currency | undefined, 
  tickLower: number | undefined, 
  tickUpper: number | undefined, 
  poolForPosition: Pool | undefined, 
  outOfRange: boolean, 
  invalidRange: boolean
): CurrencyAmount<Currency> | undefined {
  return useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
    if (independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined
      }

      const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? Position.fromAmount0({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount0: independentAmount.quotient,
          useFullPrecision: true, // we want full precision for the theoretical position
        })
        : Position.fromAmount1({
          pool: poolForPosition,
          tickLower,
          tickUpper,
          amount1: independentAmount.quotient,
        })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0
      return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
    }

    return undefined
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ])
}

export function useGetPricesAtTicks(
  token0: Token | undefined, 
  token1: Token | undefined, 
  ticks: { [key: string]: number | undefined }
): {
  [Bound.LOWER]: Price<Token, Token> | undefined, 
  [Bound.UPPER]: Price<Token, Token> | undefined
}  {
  return useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    }
  }, [token0, token1, ticks])
}

export function useCheckTicksAtLimit(
  feeAmount: FeeAmount | undefined, 
  tickLower: number | undefined, 
  tickSpaceLimits: { LOWER: number | undefined; UPPER: number | undefined }, 
  tickUpper: number | undefined
): {
  [Bound.LOWER]: boolean | undefined, 
  [Bound.UPPER]: boolean | undefined
} {
  return useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount]
  )
}

export function useGetClosestTicks(
  existingPosition: Position | undefined, 
  invertPrice: boolean, 
  rightRangeTypedValue: string | boolean, 
  leftRangeTypedValue: string | boolean, 
  tickSpaceLimits: { LOWER: number | undefined; UPPER: number | undefined }, 
  token1: Token | undefined, 
  token0: Token | undefined, 
  feeAmount: FeeAmount | undefined
): { [key: string]: number | undefined } {
  return useMemo(() => {
    return {
      [Bound.LOWER]: typeof existingPosition?.tickLower === 'number'
        ? existingPosition.tickLower
        : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
          (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
            ? tryParseTick(token1, token0, feeAmount, rightRangeTypedValue.toString())
            : tryParseTick(token0, token1, feeAmount, leftRangeTypedValue.toString()),
      [Bound.UPPER]: typeof existingPosition?.tickUpper === 'number'
        ? existingPosition.tickUpper
        : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
          (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
            ? tryParseTick(token1, token0, feeAmount, leftRangeTypedValue.toString())
            : tryParseTick(token0, token1, feeAmount, rightRangeTypedValue.toString()),
    }
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
  ])
}

export function useGetFakePool(
  tokenA: Token | undefined, 
  tokenB: Token | undefined, 
  feeAmount: FeeAmount | undefined, 
  price: Price<Token, Token> | undefined, 
  invalidPrice: boolean | undefined
): Pool | undefined {
  return useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(tokenA, tokenB, feeAmount, currentSqrt, JSBI.BigInt(0), currentTick, [])
    } else {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB])
}

export function useGetOhmDaiPrice(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  bondPrice: Price<Currency, Currency> | undefined,
  marketPrice:  Price<Currency, Currency> | undefined,
} {  
  const { chainId } = useActiveWeb3React()

  const bondAddresses: (string | undefined) = chainId == undefined ? undefined : OLYMPUS_OHMDAI_BOND_ADDRESSES[chainId]
  const reserveAddresses: (string | undefined) = chainId == undefined ? undefined : OLYMPUS_OHMDAI_RESERVE_ADDRESSES[chainId]

  const bondContract = useContract(bondAddresses, BondDaiContract, true)
  const pairContract = useContract(reserveAddresses, ReserveOhmDaiContract, true)
  
  const [ohmDaiPrice, setOhmDaiPrice] = useState<{
    bondPrice: Price<Currency, Currency> | undefined,
    marketPrice:  Price<Currency, Currency> | undefined,
  }>({bondPrice: undefined, marketPrice: undefined });    
  const ohmDaiPriceMemo = useMemo(() => ohmDaiPrice, [ohmDaiPrice]);
  
  async function queryPrice() {
    if(bondContract == null || pairContract == null || currencyA == undefined || currencyB == undefined)
    {
      setOhmDaiPrice({bondPrice: undefined, marketPrice: undefined })
    }
    else
    {
      const reserves = await pairContract.getReserves();
      const marketPrice = Number(reserves[1].toString()) / Number(reserves[0].toString());
      const bMarketPrice = parseUnits(marketPrice.toString(), 18)     
      //marketPrice = marketPrice / Math.pow(10, 9);
      const bondPrice = await bondContract.bondPriceInUSD()
      //bondPrice = Number(bondPrice.toString()) / Math.pow(10, 18)
      //const bondDiscount = (marketPrice * Math.pow(10, 18) - Number(bondPrice.toString())) / Number(bondPrice.toString());
      const newUpdate = {
        bondPrice: new Price(currencyA, currencyB, 1, bondPrice),
        marketPrice:  new Price(currencyA, currencyB, 1, bMarketPrice.toString())
      }
      if(ohmDaiPrice.bondPrice != undefined && ohmDaiPrice.bondPrice.toSignificant(6) != newUpdate.bondPrice.toSignificant(6) &&
      ohmDaiPrice.marketPrice != undefined && ohmDaiPrice.marketPrice.toSignificant(6) != newUpdate.marketPrice.toSignificant(6))
      {
        setOhmDaiPrice(newUpdate)
      }
      else if(ohmDaiPrice.bondPrice == undefined && ohmDaiPrice.marketPrice == undefined)
      {
        setOhmDaiPrice(newUpdate)
      }
    }
  }

  useEffect(() => {   
    queryPrice()
  })

  return ohmDaiPriceMemo
}

export function useGetPrice(
  noLiquidity: boolean, 
  startPriceTypedValue: string, 
  invertPrice: boolean, 
  token0: Token | undefined, 
  token1: Token | undefined, 
  pool: Pool | null
): Price<Token, Token> | undefined {
  return useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseAmount(startPriceTypedValue, invertPrice ? token0 : token1)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseAmount('1', invertPrice ? token1 : token0)
        const price = baseAmount && parsedQuoteAmount
          ? new Price(
            baseAmount.currency,
            parsedQuoteAmount.currency,
            baseAmount.quotient,
            parsedQuoteAmount.quotient
          )
          : undefined
        return (invertPrice ? price?.invert() : price) ?? undefined
      }
      return undefined
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool])
}

export function useCreatePosition(
  poolForPosition: Pool | undefined, 
  tokenA: Token | undefined, 
  tokenB: Token | undefined, 
  tickLower: number | undefined, 
  tickUpper: number | undefined, 
  invalidRange: boolean, 
  deposit0Disabled: boolean, 
  parsedAmounts: { 
    CURRENCY_A: CurrencyAmount<Currency> | undefined; 
    CURRENCY_B: CurrencyAmount<Currency> | undefined 
  }, 
  deposit1Disabled: boolean
): Position | undefined {
  return useMemo(() => {
    if (!poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange) {
      return undefined
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.quotient
      : BIG_INT_ZERO
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.quotient
      : BIG_INT_ZERO

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      })
    } else {
      return undefined
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ])
}

export function useRangeHopCallbacks(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: Pool | undefined | null
) {
  const dispatch = useAppDispatch()

  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])

  const getDecrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower - TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool])

  const getIncrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower + TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool])

  const getDecrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

  const getIncrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + TICK_SPACINGS[feeAmount])
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

  const getSetFullRange = useCallback(() => {
    dispatch(setFullRange())
  }, [dispatch])

  // prettier-ignore
  const setToPrice = useCallback(tickSpacing => {
    // given a price set tickLower to that price and tickUpper to that price
    if (baseToken && quoteToken && typeof tickLower === 'number' && typeof tickUpper === 'number' && feeAmount) {
      const leftTickPrice = tickToPrice(baseToken, quoteToken, tickUpper)
      const rightTickPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount] * tickSpacing) // adding tick spacing`

      dispatch(typeLeftRangeInput({ typedValue: leftTickPrice.toFixed(6) }))
      dispatch(typeRightRangeInput({ typedValue: rightTickPrice.toFixed(6) }))
    }
    return ''
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])


  // prettier-ignore
  const setRange = useCallback(tickSpacing => {
    // given a price set tickLower to that price and tickUpper to that price
    if (baseToken && quoteToken && typeof tickLower === 'number' && typeof tickUpper === 'number' && feeAmount) {
      const leftTickPrice = tickToPrice(baseToken, quoteToken, tickUpper + TICK_SPACINGS[feeAmount] * tickSpacing) // adding tick spacing
      const rightTickPrice = tickToPrice(baseToken, quoteToken, tickUpper - TICK_SPACINGS[feeAmount] * tickSpacing) // adding tick spacing

      console.log(leftTickPrice.toFixed(6))
      console.log(rightTickPrice.toFixed(6))

      dispatch(typeLeftRangeInput({ typedValue: leftTickPrice.toFixed(6) }))
      dispatch(typeRightRangeInput({ typedValue: rightTickPrice.toFixed(6) }))

      // @TODO add in return to strike price
      // tickUpper = rightTickPrice.toFixed(6) / 2
    }
    return ''
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool])

  return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange, setToPrice, setRange }
}
