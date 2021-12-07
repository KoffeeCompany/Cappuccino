/* eslint-disable prefer-const */
import { Text } from 'rebass'
import { useState, useCallback, useContext, ReactNode, useEffect } from 'react'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { unwrappedToken } from 'utils/unwrappedToken'
import { Break } from 'components/earn/styled'
import { Trans } from '@lingui/macro'
import { Currency, Token } from '@uniswap/sdk-core'
import RateToggle from 'components/RateToggle'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import RangeBadge from 'components/Badge/RangeBadge'
import { ThemeContext } from 'styled-components/macro'
import JSBI from 'jsbi'
import { Bound, Field } from 'state/mint/v3/actions'
import { formatTickPrice } from 'utils/formatTickPrice'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { useOlympusDerivedMintInfo, useOlympusMintActionHandlers, useOlympusMintState } from 'state/mint/v3/hooks'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { Dots, DynamicSection, MediumOnly } from './styled'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useArgentWalletContract } from 'hooks/useArgentWalletContract'
import { CAPPUCCINO_CONTRACT_ADDRESSES } from 'constants/addresses'
import { useActiveWeb3React } from 'hooks/web3'
import { useWalletModalToggle } from 'state/application/hooks'
import { OptionType } from 'constants/optiontype'

export const AddLiquidity = ({
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
  const { independentField, bcvValue, strikeValue, liquidityValue } = useOlympusMintState()

  useEffect(() => {
    onStrikeInput(strike.multiply(Math.pow(10, strike.currency.decimals)).toSignificant(6))
    onLiquidityInput(liquidity.multiply(Math.pow(10, liquidity.currency.decimals)).toSignificant(6))
    onBcvInput(bcv.toString())
  }, [liquidity, bcv, strike])

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

  const formattedLiquidityAmounts = {
    [independentField]: liquidityValue,
    [dependentField]: liquidityValue,
  }

  const usdcLiquidityValues = {
    [Field.CURRENCY_A]: useUSDCValue(liquidityAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useUSDCValue(liquidityAmounts[Field.CURRENCY_B]),
  }

  const argentWalletContract = useArgentWalletContract()

  const showApprovalA = true
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : parsedAmounts[Field.CURRENCY_A],
    chainId ? CAPPUCCINO_CONTRACT_ADDRESSES[chainId] : undefined
  )

  const isValid = !errorMessage && liquidityValue != ''

  async function onUpdateLiquidity() {
    //
  }

  const Buttons = () =>
    !account ? (
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
            onUpdateLiquidity()
          }}
          disabled={!isValid || (!argentWalletContract && approvalA !== ApprovalState.APPROVED)}
          error={!isValid && !!liquidityAmounts[Field.CURRENCY_A]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>{`Update liquidity`}</Trans>}</Text>
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
      </DynamicSection>
      <AutoColumn gap="md">
        <RowBetween>
          <TYPE.main>Strike</TYPE.main>
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
