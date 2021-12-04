/* eslint-disable prefer-const */
import { Text } from 'rebass'
import { useState, useCallback, useContext, ReactNode, useEffect } from 'react'
import { Position } from '@uniswap/v3-sdk'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { unwrappedToken } from 'utils/unwrappedToken'
import { Trans } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { ThemeContext } from 'styled-components/macro'
import { Bound, Field } from 'state/mint/v3/actions'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { OptionType } from 'state/data/generated'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { useOlympusDerivedMintInfo, useOlympusMintActionHandlers, useOlympusMintState } from 'state/mint/v3/hooks'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { Dots, DynamicSection, MediumOnly } from './styled'
import { useActiveWeb3React } from 'hooks/web3'
import { useWalletModalToggle } from 'state/application/hooks'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { CAPPUCCINO_CONTRACT_ADDRESSES } from 'constants/addresses'
import { useArgentWalletContract } from 'hooks/useArgentWalletContract'

export const SetNotional = ({
  token0,
  token1,
  title,
  liquidity,
  baseCurrencyDefault,
  strike,
  bcv,
  maturity,
  optionType,
}: {
  token0: Token
  token1: Token
  title?: ReactNode
  liquidity: CurrencyAmount<Currency>
  baseCurrencyDefault?: Currency | undefined
  strike: CurrencyAmount<Currency>
  bcv: number
  maturity?: Maturity
  optionType?: OptionType
}) => {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const currency0 = unwrappedToken(token0!)
  const currency1 = unwrappedToken(token1!)

  const baseCurrency = currency0
  const tmpQuoteCurrency = currency1
  // prevent an error if they input ETH/WETH
  const quoteCurrency = baseCurrency && tmpQuoteCurrency && token0.equals(token1) ? undefined : tmpQuoteCurrency

  // mint state
  const { independentField, bcvValue, strikeValue, liquidityValue, notionalValue } = useOlympusMintState()

  const {
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
  } = useOlympusDerivedMintInfo(baseCurrency ?? undefined, quoteCurrency ?? undefined, baseCurrency ?? undefined)
  const { onStrikeInput, onBcvInput, onLiquidityInput, onNotionalInput } = useOlympusMintActionHandlers()

  useEffect(() => {
    onStrikeInput(strike.multiply(Math.pow(10, strike.currency.decimals)).toSignificant(6))
    onLiquidityInput(liquidity.multiply(Math.pow(10, liquidity.currency.decimals)).toSignificant(6))
    onBcvInput(bcv.toString())
  }, [liquidity, bcv, strike])

  const formattedNotionalAmounts = {
    [independentField]: notionalValue,
    [dependentField]: notionalValue,
  }

  const usdcNotionalValues = {
    [Field.CURRENCY_A]: useUSDCValue(notionalAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(notionalAmounts[Field.CURRENCY_B]),
  }

  const argentWalletContract = useArgentWalletContract()

  const showApprovalB = true
  const [approvalB, approveBCallback] = useApproveCallback(
    argentWalletContract ? undefined : parsedAmounts[Field.CURRENCY_B],
    chainId ? CAPPUCCINO_CONTRACT_ADDRESSES[chainId] : undefined
  )

  const isValid = !errorMessage && notionalValue != ''

  async function onBuyOption() {
    //
  }

  const Buttons = () =>
    !account ? (
      <ButtonLight onClick={toggleWalletModal} $borderRadius="4px" padding={'12px'}>
        <Trans>Connect to a wallet</Trans>
      </ButtonLight>
    ) : (
      <AutoColumn gap={'md'}>
        {(approvalB === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.PENDING) && isValid && (
          <RowBetween>
            {showApprovalB && (
              <ButtonPrimary
                onClick={approveBCallback}
                disabled={approvalB === ApprovalState.PENDING}
                width={'100%'}
                $borderRadius="4px"
              >
                {approvalB === ApprovalState.PENDING ? (
                  <Dots>
                    <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                  </Dots>
                ) : (
                  <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                )}
              </ButtonPrimary>
            )}
          </RowBetween>
        )}
        <ButtonError
          style={{ borderRadius: '4px' }}
          onClick={() => {
            onBuyOption()
          }}
          disabled={!isValid || (!argentWalletContract && approvalB !== ApprovalState.APPROVED)}
          error={!isValid && !!notionalAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>{`Buy ${optionType}`}</Trans>}</Text>
        </ButtonError>
      </AutoColumn>
    )

  return (
    <AutoColumn gap="md" style={{ marginTop: '0.5rem' }}>
      <RowBetween style={{ marginBottom: '0.5rem' }}>
        <RowFixed>
          <DoubleCurrencyLogo
            currency0={currency0 ?? undefined}
            currency1={currency1 ?? undefined}
            size={24}
            margin={true}
          />
          <TYPE.label ml="10px" fontSize="24px">
            {currency0?.symbol} / {currency1?.symbol}
          </TYPE.label>
        </RowFixed>
      </RowBetween>
      <DynamicSection>
        <AutoColumn gap="md">
          <TYPE.label>
            <Trans>Notional</Trans>
          </TYPE.label>

          <CurrencyInputPanel
            value={formattedNotionalAmounts[Field.CURRENCY_B]}
            onUserInput={onNotionalInput}
            onMax={() => {
              //
            }}
            showMaxButton={false}
            currency={currencies[Field.CURRENCY_B]}
            id="notional-input-tokenaB"
            fiatValue={usdcNotionalValues[Field.CURRENCY_B]}
            hideBalance={true}
            locked={false}
          />
        </AutoColumn>
      </DynamicSection>
      <AutoColumn gap="md">
        <RowBetween>
          <TYPE.main>Strike / Liquidity</TYPE.main>
        </RowBetween>

        <RowBetween>
          <LightCard>
            <AutoColumn gap="md">
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={strike.currency} />
                  <TYPE.label ml="8px">{strike.currency?.symbol}</TYPE.label>
                </RowFixed>
                <RowFixed>
                  <TYPE.label mr="8px">
                    {strike.multiply(Math.pow(10, strike.currency.decimals)).toSignificant(6)}
                  </TYPE.label>
                </RowFixed>
              </RowBetween>
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={liquidity.currency} />
                  <TYPE.label ml="8px">{liquidity.currency?.symbol}</TYPE.label>
                </RowFixed>
                <RowFixed>
                  <TYPE.label mr="8px">
                    {liquidity.multiply(Math.pow(10, liquidity.currency.decimals)).toSignificant(6)}
                  </TYPE.label>
                </RowFixed>
              </RowBetween>
            </AutoColumn>
          </LightCard>
        </RowBetween>
      </AutoColumn>

      <AutoColumn gap="md">
        <RowBetween>{title ? <TYPE.main>{title}</TYPE.main> : <div />}</RowBetween>

        <RowBetween>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>BCV</Trans>
              </TYPE.main>
              <TYPE.mediumHeader>{`${bcv}`}</TYPE.mediumHeader>
            </AutoColumn>
          </LightCard>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Maturity</Trans>
              </TYPE.main>
              <TYPE.mediumHeader textAlign="center">{`${
                maturity === Maturity.ONE_DAY
                  ? '24 hours'
                  : maturity === Maturity.SEVEN_DAYS
                  ? '7 days'
                  : maturity === Maturity.ONE_MONTH
                  ? '1 month'
                  : '3 months'
              }`}</TYPE.mediumHeader>
            </AutoColumn>
          </LightCard>
        </RowBetween>
        <RowBetween>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Current Bond price</Trans>
              </TYPE.main>
              {baseCurrency && quoteCurrency && (
                <>
                  <TYPE.mediumHeader>{`${
                    bondPrice ? bondPrice.divide(Math.pow(10, quoteCurrency.decimals)).toSignificant(6) : '0.0'
                  } `}</TYPE.mediumHeader>
                  <TYPE.main textAlign="center" fontSize="12px">
                    <Trans>
                      {quoteCurrency.symbol} per {baseCurrency.symbol}
                    </Trans>
                  </TYPE.main>
                </>
              )}
            </AutoColumn>
          </LightCard>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Current Market price</Trans>
              </TYPE.main>
              {baseCurrency && quoteCurrency && (
                <>
                  <TYPE.mediumHeader>{`${
                    marketPrice
                      ? marketPrice
                          .divide(Math.pow(10, baseCurrency.decimals))
                          .divide(Math.pow(10, quoteCurrency.decimals))
                          .toSignificant(6)
                      : '0.0'
                  } `}</TYPE.mediumHeader>
                  <TYPE.main textAlign="center" fontSize="12px">
                    <Trans>
                      {quoteCurrency.symbol} per {baseCurrency.symbol}
                    </Trans>
                  </TYPE.main>
                </>
              )}
            </AutoColumn>
          </LightCard>
        </RowBetween>
      </AutoColumn>
      <MediumOnly style={{ marginTop: '10px' }}>
        <Buttons />
      </MediumOnly>
    </AutoColumn>
  )
}
