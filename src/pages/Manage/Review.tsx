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
  outOfRange,
  strike,
  optionValue,
  maturity,
  bondPrice,
  marketPrice,
}: {
  token0: Token
  token1: Token
  existingPosition?: Position
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  bondPrice?: Price<Currency, Currency>
  marketPrice?: Price<Currency, Currency>
  outOfRange: boolean
  strike?: number
  optionValue?: CurrencyAmount<Currency>
  maturity?: Maturity
}) {
  return (
    <Wrapper>
      <AutoColumn gap="lg">
        <AddLiquidity
          token0={token0}
          token1={token1}
          inRange={!outOfRange}
          strike={strike}
          title={'Option parameter'}
          optionValue={optionValue}
          maturity={maturity}
          bondPrice={bondPrice}
          marketPrice={marketPrice}
        />
      </AutoColumn>
    </Wrapper>
  )
}
