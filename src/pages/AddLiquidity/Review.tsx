import { Bound, Field } from '../../state/mint/v3/actions'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components/macro'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { Position } from '@uniswap/v3-sdk'
import { PositionPreview } from 'components/PositionPreview'
import { Maturity } from 'constants/maturity'

const Wrapper = styled.div`
  padding-top: 12px;
`

export function Review({
  position,
  outOfRange,
  ticksAtLimit,
  strike,
  optionValue,
  maturity,
}: {
  position?: Position
  existingPosition?: Position
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  priceLower?: Price<Currency, Currency>
  priceUpper?: Price<Currency, Currency>
  outOfRange: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  strike?: number
  optionValue?: CurrencyAmount<Currency>
  maturity?: Maturity
}) {
  return (
    <Wrapper>
      <AutoColumn gap="lg">
        {position ? (
          <PositionPreview
            position={position}
            inRange={!outOfRange}
            strike={strike}
            title={'Option parameter'}
            ticksAtLimit={ticksAtLimit}
            optionValue={optionValue}
            maturity={maturity}
          />
        ) : null}
      </AutoColumn>
    </Wrapper>
  )
}
