import { AutoColumn } from 'components/Column'
import styled from 'styled-components/macro'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { Maturity } from 'constants/maturity'
import { SetNotional } from './setNotional'
import { OptionType } from 'constants/optiontype'

const Wrapper = styled.div`
  padding-top: 12px;
`

export function Review({
  token0,
  token1,
  liquidity,
  strike,
  bcv,
  maturity,
  optionType,
  pool,
}: {
  token0: Token
  token1: Token
  liquidity: CurrencyAmount<Currency>
  strike: CurrencyAmount<Currency>
  bcv: number
  maturity?: Maturity
  optionType: OptionType
  pool: string
}) {
  return (
    <Wrapper>
      <AutoColumn gap="lg">
        <SetNotional
          token0={token0}
          token1={token1}
          liquidity={liquidity}
          strike={strike}
          title={'Option parameter'}
          bcv={bcv}
          maturity={maturity}
          optionType={optionType}
          pool={pool}
        />
      </AutoColumn>
    </Wrapper>
  )
}
