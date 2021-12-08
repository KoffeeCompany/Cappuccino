import { Text } from 'rebass'
import { Currency, Percent } from '@uniswap/sdk-core'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { useCurrency } from 'hooks/Tokens'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useWalletModalToggle } from 'state/application/hooks'
import { Bound, Field } from 'state/mint/v3/actions'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { useOlympusMintState, useOlympusDerivedMintInfo, useOlympusMintActionHandlers } from 'state/mint/v3/hooks'
import { useIsExpertMode } from 'state/user/hooks'
import {
  Container,
  CurrencyDropdown,
  Dots,
  DynamicSection,
  InputRow,
  MediumOnly,
  PageWrapper,
  ResponsiveText,
  ScrollablePage,
  Wrapper,
} from './styled'
import ReactGA from 'react-ga'
import { CAPPUCCINO_CONTRACT_ADDRESSES, OPTION_ADDRESSES, RESOLVER_ADDRESSES } from 'constants/addresses'
import { useOlympusOptionContract, useOptionContract } from 'hooks/useContract'
import Row, { RowBetween, RowFixed, AutoRow } from '../../components/Row'
import {
  ButtonError,
  ButtonLight,
  ButtonPrimary,
  ButtonRadioChecked,
  ButtonText,
  ButtonYellow,
} from '../../components/Button'
import { TYPE, ExternalLink } from '../../theme'
import { Trans, t } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import HoverInlineText from 'components/HoverInlineText'
import NumericalInput from 'components/NumericalInput'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useArgentWalletContract } from 'hooks/useArgentWalletContract'
import { DAI_GOERLI, OHM_GOERLI } from 'constants/tokens'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { Review } from './Review'
import { BigNumber } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useSetMaturityTimestamp } from './functions'
import { useTransactionAdder } from 'state/transactions/hooks'
import { parseUnits } from 'ethers/lib/utils'
import { OptionType } from 'constants/optiontype'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function CreateOption({
  match: {
    params: { currencyIdA, currencyIdB, maturity: maturityFromUrl, optionType: optionTypeFromUrl },
  },
  history,
}: RouteComponentProps<{
  currencyIdA?: string
  currencyIdB?: string
  maturity?: string
  optionType?: string
  tokenId?: string
}>) {
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()

  // maturity from url
  const maturity: Maturity =
    maturityFromUrl && Object.values(Maturity).includes(parseFloat(maturityFromUrl))
      ? parseFloat(maturityFromUrl)
      : Maturity.FIVE_DAYS

  const optionType: OptionType =
    optionTypeFromUrl && optionTypeFromUrl.toUpperCase() == 'PUT' ? OptionType.Put : OptionType.Call

  const baseCurrency = useCurrency(currencyIdA)
  const tmpQuoteCurrency = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && tmpQuoteCurrency && baseCurrency.wrapped.equals(tmpQuoteCurrency.wrapped)
      ? undefined
      : tmpQuoteCurrency

  // mint state
  const { independentField, bcvValue, strikeValue, liquidityValue } = useOlympusMintState()

  const {
    dependentField,
    currencies,
    currencyBalances,
    parsedAmounts,
    strikeAmounts,
    liquidityAmounts,
    bondPrice,
    marketPrice,
    errorMessage,
    invertPrice,
  } = useOlympusDerivedMintInfo(baseCurrency ?? undefined, quoteCurrency ?? undefined, baseCurrency ?? undefined)

  const { onBcvInput, onStrikeInput, onLiquidityInput } = useOlympusMintActionHandlers()

  const isValid = !errorMessage && bcvValue != '' && strikeValue != '' && liquidityValue != ''

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const formattedStrikeAmounts = {
    [independentField]: strikeValue,
    [dependentField]: strikeValue,
  }

  const formattedLiquidityAmounts = {
    [independentField]: liquidityValue,
    [dependentField]: liquidityValue,
  }

  const usdcStrikeValues = {
    [Field.CURRENCY_A]: useUSDCValue(strikeAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(strikeAmounts[Field.CURRENCY_B]),
  }

  const usdcLiquidityValues = {
    [Field.CURRENCY_A]: useUSDCValue(liquidityAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(liquidityAmounts[Field.CURRENCY_B]),
  }

  const argentWalletContract = useArgentWalletContract()
  const showApprovalA = true

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : liquidityAmounts[Field.CURRENCY_A],
    chainId ? CAPPUCCINO_CONTRACT_ADDRESSES[chainId] : undefined
  )

  const handleMaturitySelectWithEvent = useCallback(
    (maturity_: Maturity) => {
      ReactGA.event({
        category: 'MaturitySelect',
        action: 'Manual',
      })
      history.push(`/create/${currencyIdA}/${currencyIdB}/${maturity_}`)
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleOptionTypeSelectWithEvent = useCallback(
    (optionType_: OptionType) => {
      ReactGA.event({
        category: 'OptionTypeSelect',
        action: 'Manual',
      })
      history.push(`/create/${currencyIdA}/${currencyIdB}/${maturity}/${optionType_}`)
    },
    [currencyIdA, currencyIdB, maturity, history]
  )

  const clearAll = useCallback(() => {
    onBcvInput('')
    onStrikeInput('')
    onLiquidityInput('')
    history.push(`/create/${OHM_GOERLI.address}/${DAI_GOERLI.address}`)
  }, [history, onBcvInput, onStrikeInput, onLiquidityInput])

  useEffect(() => {
    onBcvInput('')
    onStrikeInput('')
    onLiquidityInput('')
  }, [])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      history.push(`/create/${OHM_GOERLI.address}/${DAI_GOERLI.address}`)
    }
    setTxHash('')
  }, [history, txHash])

  const optionAddresses: string | undefined = useMemo(() => {
    if (chainId) {
      if (CAPPUCCINO_CONTRACT_ADDRESSES[chainId]) {
        return CAPPUCCINO_CONTRACT_ADDRESSES[chainId]
      }
      return undefined
    }
    return undefined
  }, [chainId])

  const optionContract = useOlympusOptionContract(optionAddresses)

  const [attempting, setAttempting] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  const maturityTimestamp: BigNumber | undefined = useSetMaturityTimestamp(maturity ?? 0)
  const liquidityToSend = parseUnits(
    liquidityAmounts[Field.CURRENCY_A] ? liquidityAmounts[Field.CURRENCY_A]!.toSignificant(6) : '0',
    OHM_GOERLI.decimals
  )
  const strikeToSend = parseUnits(
    strikeAmounts[Field.CURRENCY_B] ? strikeAmounts[Field.CURRENCY_B]!.toSignificant(6) : '0',
    DAI_GOERLI.decimals
  )
  const bcvToSend = parseUnits(bcvValue != '' ? bcvValue : '0', 18)

  async function onCreateOption() {
    if (optionContract) {
      setAttempting(true)
      await optionContract
        .createOptionPool(
          OHM_GOERLI.address,
          DAI_GOERLI.address,
          optionType.toString().toLocaleUpperCase(),
          liquidityToSend,
          bcvToSend,
          strikeToSend,
          maturityTimestamp?.toString(),
          {
            gasLimit: 3500000,
          }
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: t`Create option pool transaction`,
          })
          setHash(response.hash)
          console.log(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  const Buttons = () =>
    addIsUnsupported ? (
      <ButtonPrimary disabled={true} $borderRadius="4px" padding={'12px'}>
        <TYPE.main mb="4px">
          <Trans>Unsupported Asset</Trans>
        </TYPE.main>
      </ButtonPrimary>
    ) : !account ? (
      <ButtonLight onClick={toggleWalletModal} $borderRadius="4px" padding={'12px'}>
        <Trans>Connect to a wallet</Trans>
      </ButtonLight>
    ) : (
      <AutoColumn gap={'md'}>
        {(approvalA === ApprovalState.NOT_APPROVED || approvalA === ApprovalState.PENDING) && isValid && (
          <RowBetween>
            {showApprovalA && (
              <ButtonPrimary
                onClick={approveACallback}
                disabled={approvalA === ApprovalState.PENDING}
                width={'100%'}
                $borderRadius="4px"
              >
                {approvalA === ApprovalState.PENDING ? (
                  <Dots>
                    <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                  </Dots>
                ) : (
                  <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                )}
              </ButtonPrimary>
            )}
          </RowBetween>
        )}
        <ButtonError
          style={{ borderRadius: '4px' }}
          onClick={() => {
            expertMode ? onCreateOption() : setShowConfirm(true)
          }}
          disabled={!isValid || (!argentWalletContract && approvalA !== ApprovalState.APPROVED)}
          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>Preview</Trans>}</Text>
        </ButtonError>
      </AutoColumn>
    )

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={t`Create Option`}
            onDismiss={handleDismissConfirmation}
            topContent={() => (
              <Review
                token0={baseCurrency ? baseCurrency.wrapped : OHM_GOERLI.wrapped}
                token1={quoteCurrency ? quoteCurrency.wrapped : DAI_GOERLI.wrapped}
                liquidity={
                  liquidityAmounts[Field.CURRENCY_A] != undefined
                    ? liquidityAmounts[Field.CURRENCY_A]!
                    : CurrencyAmount.fromRawAmount(baseCurrency ? baseCurrency : OHM_GOERLI, 0)
                }
                strike={
                  strikeAmounts[Field.CURRENCY_B] != undefined
                    ? strikeAmounts[Field.CURRENCY_B]!
                    : CurrencyAmount.fromRawAmount(quoteCurrency ? quoteCurrency : DAI_GOERLI, 0)
                }
                bcv={bcvValue != '' ? parseFloat(bcvValue) : 0}
                maturity={maturity}
              />
            )}
            bottomContent={() => (
              <ButtonPrimary style={{ marginTop: '1rem', borderRadius: '4px' }} onClick={onCreateOption}>
                <Text fontWeight={500} fontSize={20}>
                  <Trans>Create</Trans>
                </Text>
              </ButtonPrimary>
            )}
          />
        )}
        pendingText={undefined}
      />
      <ScrollablePage>
        <PageWrapper wide={false}>
          <AddRemoveTabs
            creating={false}
            adding={true}
            positionID={undefined}
            defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
            showBackLink={false}
          >
            <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
              <MediumOnly>
                <ButtonText onClick={clearAll} margin="0 15px 0 0">
                  <TYPE.blue fontSize="12px">
                    <Trans>Clear All</Trans>
                  </TYPE.blue>
                </ButtonText>
              </MediumOnly>
            </Row>
          </AddRemoveTabs>
          <Wrapper>
            <AutoColumn gap={'sm'}>
              <RowBetween paddingBottom="20px">
                <TYPE.label>
                  <Trans>Select Pair</Trans>
                </TYPE.label>
              </RowBetween>
              <RowBetween>
                <CurrencyDropdown
                  value={''}
                  onUserInput={(_) => {
                    //
                  }}
                  hideInput={true}
                  onMax={() => {
                    //
                  }}
                  onCurrencySelect={undefined}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_A]}
                  id="nput-tokena"
                  showCommonBases
                />
                <div style={{ width: '12px' }} />

                <CurrencyDropdown
                  value={''}
                  hideInput={true}
                  onUserInput={(_) => {
                    //
                  }}
                  onCurrencySelect={undefined}
                  onMax={() => {
                    //
                  }}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_B]}
                  id="input-tokenb"
                  showCommonBases
                />
              </RowBetween>
            </AutoColumn>
            <DynamicSection
              style={{ marginBottom: '10px' }}
              disabled={bondPrice === undefined || marketPrice === undefined}
            >
              <AutoColumn gap="md" style={{ marginBottom: '10px' }}>
                <TYPE.label>
                  <Trans>Option Type</Trans>
                </TYPE.label>
              </AutoColumn>
              <AutoColumn>
                <RowBetween style={{ justifyContent: 'left' }}>
                  <ButtonRadioChecked
                    width="24%"
                    active={optionType === OptionType.Call}
                    onClick={() => handleOptionTypeSelectWithEvent(OptionType.Call)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="6px">
                        <ResponsiveText>
                          <Trans>CALL</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                  <ButtonRadioChecked
                    style={{ marginLeft: '15px' }}
                    width="24%"
                    active={optionType === OptionType.Put}
                    onClick={() => handleOptionTypeSelectWithEvent(OptionType.Put)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="4px">
                        <ResponsiveText>
                          <Trans>PUT</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                </RowBetween>
              </AutoColumn>
            </DynamicSection>
            <DynamicSection disabled={bondPrice === undefined || marketPrice === undefined}>
              <AutoColumn gap="md">
                <TYPE.label>
                  <Trans>Liquidity</Trans>
                </TYPE.label>

                <CurrencyInputPanel
                  value={formattedLiquidityAmounts[Field.CURRENCY_A]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    //
                  }}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_A]}
                  id="liquidity-input-tokena"
                  fiatValue={usdcLiquidityValues[Field.CURRENCY_A]}
                  hideBalance={true}
                  locked={false}
                />
              </AutoColumn>
              <AutoColumn gap="md" style={{ marginTop: '15px' }}>
                <TYPE.label>
                  <Trans>BCV value</Trans>
                </TYPE.label>

                <Container hideInput={false} style={{ marginBottom: '15px' }}>
                  <InputRow selected={true}>
                    <NumericalInput
                      className="token-amount-input"
                      value={bcvValue}
                      onUserInput={(val) => {
                        onBcvInput(val)
                      }}
                    />
                  </InputRow>
                </Container>
              </AutoColumn>
              <AutoColumn gap="md">
                <TYPE.label>
                  <Trans>Strike</Trans>
                </TYPE.label>

                <CurrencyInputPanel
                  value={formattedStrikeAmounts[Field.CURRENCY_B]}
                  onUserInput={onStrikeInput}
                  onMax={() => {
                    //
                  }}
                  showMaxButton={false}
                  currency={currencies[Field.CURRENCY_B]}
                  id="strike-input-tokena"
                  fiatValue={usdcStrikeValues[Field.CURRENCY_B]}
                  showCommonBases
                  locked={false}
                />
                {bondPrice && marketPrice && baseCurrency && quoteCurrency && (
                  <>
                    <AutoRow gap="4px" justify="center" style={{ marginTop: '0rem', gridRow: '0px' }}>
                      <Trans>
                        <TYPE.main fontWeight={500} textAlign="center" fontSize={12} color="text1">
                          Current Bond Price:
                        </TYPE.main>
                        <TYPE.body fontWeight={500} textAlign="center" fontSize={12} color="text1">
                          <HoverInlineText
                            maxCharacters={20}
                            text={bondPrice.divide(Math.pow(10, quoteCurrency.decimals)).toSignificant(6)}
                          />
                        </TYPE.body>
                        <TYPE.body color="text2" fontSize={12}>
                          {quoteCurrency?.symbol} per {baseCurrency.symbol}
                        </TYPE.body>
                      </Trans>
                    </AutoRow>
                    <AutoRow gap="4px" justify="center" style={{ marginTop: '0rem', gridRow: '0px' }}>
                      <Trans>
                        <TYPE.main fontWeight={500} textAlign="center" fontSize={12} color="text1">
                          Current Market Price:
                        </TYPE.main>
                        <TYPE.body fontWeight={500} textAlign="center" fontSize={12} color="text1">
                          <HoverInlineText
                            maxCharacters={20}
                            text={marketPrice
                              .divide(Math.pow(10, quoteCurrency.decimals))
                              .divide(Math.pow(10, baseCurrency.decimals))
                              .toSignificant(6)}
                          />
                        </TYPE.body>
                        <TYPE.body color="text2" fontSize={12}>
                          {quoteCurrency?.symbol} per {baseCurrency.symbol}
                        </TYPE.body>
                      </Trans>
                    </AutoRow>
                  </>
                )}
              </AutoColumn>
            </DynamicSection>
            <DynamicSection
              style={{ marginTop: '10px' }}
              disabled={bondPrice === undefined || marketPrice === undefined}
            >
              <AutoColumn gap="md" style={{ marginBottom: '10px' }}>
                <TYPE.label>
                  <Trans>Maturity</Trans>
                </TYPE.label>
              </AutoColumn>
              <AutoColumn>
                <RowBetween>
                  <ButtonRadioChecked
                    width="24%"
                    active={maturity === Maturity.ONE_DAY}
                    onClick={() => handleMaturitySelectWithEvent(Maturity.ONE_DAY)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="6px">
                        <ResponsiveText>
                          <Trans>24 hours</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                  <ButtonRadioChecked
                    width="24%"
                    active={maturity === Maturity.FIVE_DAYS}
                    onClick={() => handleMaturitySelectWithEvent(Maturity.FIVE_DAYS)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="4px">
                        <ResponsiveText>
                          <Trans>5 days</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                  <ButtonRadioChecked
                    width="24%"
                    active={maturity === Maturity.SEVEN_DAYS}
                    onClick={() => handleMaturitySelectWithEvent(Maturity.SEVEN_DAYS)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="4px">
                        <ResponsiveText>
                          <Trans>7 days</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                  <ButtonRadioChecked
                    width="24%"
                    active={maturity === Maturity.ONE_MONTH}
                    onClick={() => handleMaturitySelectWithEvent(Maturity.ONE_MONTH)}
                  >
                    <AutoColumn gap="sm" justify="flex-start">
                      <AutoColumn justify="flex-start" gap="4px">
                        <ResponsiveText>
                          <Trans>1 month</Trans>
                        </ResponsiveText>
                      </AutoColumn>
                    </AutoColumn>
                  </ButtonRadioChecked>
                </RowBetween>
              </AutoColumn>
            </DynamicSection>
            <MediumOnly style={{ marginTop: '10px' }}>
              <Buttons />
            </MediumOnly>
          </Wrapper>
        </PageWrapper>
        {addIsUnsupported && (
          <UnsupportedCurrencyFooter
            show={addIsUnsupported}
            currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
          />
        )}
      </ScrollablePage>
    </>
  )
}
