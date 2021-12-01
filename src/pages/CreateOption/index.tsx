import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { useCurrency } from 'hooks/Tokens'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useWalletModalToggle } from 'state/application/hooks'
import { Bound, Field } from 'state/mint/v3/actions'
import {
  useV3MintState,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useRangeHopCallbacks,
} from 'state/mint/v3/hooks'
import { useIsExpertMode } from 'state/user/hooks'
import { ScrollablePage } from './styled'
import ReactGA from 'react-ga'
import { getMaxAmountToSpend, isItAtMaxAmounts, useHandleCurrencySelect } from './functions'
import { OPTION_ADDRESSES, RESOLVER_ADDRESSES } from 'constants/addresses'
import { useOptionContract } from 'hooks/useContract'

export default function CreateOption({
  match: {
    params: { currencyIdA, currencyIdB, feeAmount: feeAmountFromUrl, maturity: maturityFromUrl },
  },
  history,
}: RouteComponentProps<{
  currencyIdA?: string
  currencyIdB?: string
  feeAmount?: string
  maturity?: string
  tokenId?: string
}>) {
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  // maturity from url
  const maturity: Maturity | undefined =
    maturityFromUrl && Object.values(Maturity).includes(parseFloat(maturityFromUrl))
      ? parseFloat(maturityFromUrl)
      : undefined

  const baseCurrency = useCurrency(currencyIdA)
  const tmpQuoteCurrency = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && tmpQuoteCurrency && baseCurrency.wrapped.equals(tmpQuoteCurrency.wrapped)
      ? undefined
      : tmpQuoteCurrency

  // mint state
  const { independentField, typedValue, startPriceTypedValue, premiumValue } = useV3MintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    premiumAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  } = useV3DerivedMintInfo(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, baseCurrency ?? undefined)

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput, onPremiumInput } =
    useV3MintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange && maturity != undefined

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState(false)

  useEffect(() => setShowCapitalEfficiencyWarning(false), [baseCurrency, quoteCurrency, feeAmount])

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const formattedPremiumAmounts = {
    [independentField]: premiumValue,
    [dependentField]: premiumAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(parsedAmounts[Field.CURRENCY_B]),
  }

  const usdcPremiumValues = {
    [Field.CURRENCY_A]: useUSDCValue(premiumAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(premiumAmounts[Field.CURRENCY_B]),
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = getMaxAmountToSpend(currencyBalances)

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = isItAtMaxAmounts(maxAmounts, parsedAmounts)

  const handleCurrencySelect = useHandleCurrencySelect(chainId)

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        history.push(`/create/${idA}`)
      } else {
        history.push(`/create/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdB, history]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        history.push(`/create/${idB}`)
      } else {
        history.push(`/create/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdA, history]
  )

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('')
      onRightRangeInput('')
      history.push(`/create/${currencyIdA}/${currencyIdB}/${newFeeAmount}/${maturity}`)
    },
    [currencyIdA, currencyIdB, maturity, history, onLeftRangeInput, onRightRangeInput]
  )

  const handleMaturitySelectWithEvent = useCallback(
    (maturity_: Maturity) => {
      ReactGA.event({
        category: 'MaturitySelect',
        action: 'Manual',
      })
      history.push(`/create/${currencyIdA}/${currencyIdB}/${feeAmount}/${maturity_}`)
    },
    [currencyIdA, currencyIdB, feeAmount, history]
  )

  const clearAll = useCallback(() => {
    onFieldAInput('')
    onFieldBInput('')
    onLeftRangeInput('')
    onRightRangeInput('')
    onPremiumInput('')
    history.push(`/create`)
  }, [history, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onPremiumInput])

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange, setToPrice } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  const setCoveredCallRange = (ticks: number) => {
    setToPrice(ticks)
  }
  const setProtectedPutRange = (ticks: number) => {
    setToPrice(ticks)
  }

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : ''} ${
    !depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
  } ${!outOfRange ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : ''} ${
    !depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''
  }`

  const optionAddresses: string | undefined = useMemo(() => {
    if (chainId) {
      if (OPTION_ADDRESSES[chainId]) {
        return OPTION_ADDRESSES[chainId]
      }
      return undefined
    }
    return undefined
  }, [chainId])

  const resolverAddresses: string | undefined = useMemo(() => {
    if (chainId) {
      if (RESOLVER_ADDRESSES[chainId]) {
        return RESOLVER_ADDRESSES[chainId]
      }
      return undefined
    }
    return undefined
  }, [chainId])

  const optionContract = useOptionContract(optionAddresses)
  const isCall =
    price && priceLower && (invertPrice ? price.invert().lessThan(priceLower.invert()) : price.lessThan(priceLower))
  const isPut =
    price &&
    priceUpper &&
    (invertPrice ? price.invert().greaterThan(priceUpper.invert()) : price.greaterThan(priceUpper))

  const [attempting, setAttempting] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  // async function onCreateOption() {
  //   if (optionContract && pool) {
  //     setAttempting(true)
  //     await optionContract
  //       .createOption(
  //         {
  //           pool: Pool.getAddress(pool.token0, pool.token1, pool.fee),
  //           optionType: isCall ? 0 : 1,
  //           strike: isCall ? tickLower : tickUpper,
  //           notional: amountToSend,
  //           maturity: maturityTimestamp!.toString(),
  //           maker: account!,
  //           resolver: resolverAddresses!,
  //           price: ethers.utils.parseUnits(
  //             optionValueCurrencyAmount ? optionValueCurrencyAmount.toSignificant(5) : '0',
  //             optionValueCurrencyAmount?.currency.decimals
  //           ),
  //         },
  //         {
  //           gasLimit: 3500000,
  //           value: isEthOrWETH(notionalValueCurrencyAmount?.currency.symbol) ? amountToSend : undefined,
  //         }
  //       )
  //       .then((response: TransactionResponse) => {
  //         addTransaction(response, {
  //           summary: t`Create option transaction`,
  //         })
  //         setHash(response.hash)
  //         console.log(response.hash)
  //       })
  //       .catch((error: any) => {
  //         setAttempting(false)
  //         console.log(error)
  //       })
  //   }
  // }

  return (
    <>
      <ScrollablePage></ScrollablePage>
    </>
  )
}
