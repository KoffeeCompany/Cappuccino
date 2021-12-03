import { useState, useCallback, useContext, ReactNode } from 'react'
import { Position } from '@uniswap/v3-sdk'
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
import { Bound } from 'state/mint/v3/actions'
import { formatTickPrice } from 'utils/formatTickPrice'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { OptionType } from 'state/data/generated'

export const AddLiquidity = ({
  token0,
  token1,
  title,
  inRange,
  baseCurrencyDefault,
  strike,
  bondPrice,
  marketPrice,
  optionValue,
  maturity,
  optionType,
}: {
  token0: Token
  token1: Token
  title?: ReactNode
  inRange: boolean
  baseCurrencyDefault?: Currency | undefined
  strike?: number
  optionValue?: CurrencyAmount<Currency>
  bondPrice: Price<Currency, Currency> | undefined
  marketPrice: Price<Currency, Currency> | undefined
  maturity?: Maturity
  optionType?: OptionType
}) => {
  const theme = useContext(ThemeContext)

  const currency0 = unwrappedToken(token0!)
  const currency1 = unwrappedToken(token1!)

  // track which currency should be base
  const [baseCurrency, setBaseCurrency] = useState(
    baseCurrencyDefault
      ? baseCurrencyDefault === currency1
        ? currency1
        : baseCurrencyDefault === currency0
        ? currency0
        : currency1
      : currency1
  )

  const sorted = baseCurrency === currency0
  const quoteCurrency = sorted ? currency1 : currency0

  const handleRateChange = useCallback(() => {
    setBaseCurrency(quoteCurrency)
  }, [quoteCurrency])

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

      <LightCard>
        <AutoColumn gap="md">
          <RowBetween>
            <RowFixed>
              <CurrencyLogo currency={currency0} />
              <TYPE.label ml="8px">{currency0?.symbol}</TYPE.label>
            </RowFixed>
            <RowFixed>
              <TYPE.label mr="8px">{0}</TYPE.label>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <CurrencyLogo currency={currency1} />
              <TYPE.label ml="8px">{currency1?.symbol}</TYPE.label>
            </RowFixed>
            <RowFixed>
              <TYPE.label mr="8px">{'0'}</TYPE.label>
            </RowFixed>
          </RowBetween>
          <Break />
        </AutoColumn>
      </LightCard>

      <AutoColumn gap="md">
        <RowBetween>
          {title ? <TYPE.main>{title}</TYPE.main> : <div />}
          <RateToggle
            currencyA={sorted ? currency0 : currency1}
            currencyB={sorted ? currency1 : currency0}
            handleRateToggle={handleRateChange}
          />
        </RowBetween>

        <RowBetween>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Premium</Trans>
              </TYPE.main>
              <TYPE.mediumHeader textAlign="center">{`${optionValue?.toSignificant(4)}`}</TYPE.mediumHeader>
              <TYPE.main textAlign="center" fontSize="12px">
                <Trans>{optionValue?.currency.symbol}</Trans>
              </TYPE.main>
            </AutoColumn>
          </LightCard>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Strike tick</Trans>
              </TYPE.main>
              <TYPE.mediumHeader>{`${strike}`}</TYPE.mediumHeader>
              <TYPE.main textAlign="center" fontSize="12px">
                <Trans>
                  {quoteCurrency.symbol} per {baseCurrency.symbol}
                </Trans>
              </TYPE.main>
            </AutoColumn>
          </LightCard>
        </RowBetween>
        <RowBetween>
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
              <TYPE.main textAlign="center" fontSize="12px">
                &nbsp;
              </TYPE.main>
            </AutoColumn>
          </LightCard>
          <LightCard width="48%" padding="8px">
            <AutoColumn gap="4px" justify="center">
              <TYPE.main fontSize="12px">
                <Trans>Bond price</Trans>
              </TYPE.main>
              {bondPrice && marketPrice && baseCurrency && quoteCurrency && (
                <>
                  <TYPE.mediumHeader>{`${bondPrice
                    .divide(Math.pow(10, quoteCurrency.decimals))
                    .toSignificant(6)} `}</TYPE.mediumHeader>
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
    </AutoColumn>
  )
}
