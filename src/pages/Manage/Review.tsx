import { Bound, Field } from '../../state/mint/v3/actions'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components/macro'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import { Maturity } from 'constants/maturity'
import { AddLiquidity } from './addLiquidity'

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
}: {
  token0: Token
  token1: Token
  liquidity: CurrencyAmount<Currency>
  strike: CurrencyAmount<Currency>
  bcv: number
  maturity?: Maturity
}) {
  return (
    <Wrapper>
      <AutoColumn gap="lg">
        <AddLiquidity
          token0={token0}
          token1={token1}
          liquidity={liquidity}
          strike={strike}
          title={'Option parameter'}
          bcv={bcv}
          maturity={maturity}
        />
      </AutoColumn>
    </Wrapper>
  )
}
