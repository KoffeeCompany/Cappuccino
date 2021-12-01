import styled from 'styled-components/macro'

export const TokenBaseQuoteTokensContainer = styled.div`
  display: flex;
  margin-bottom: 0px;
`
export const PriceLabel = styled.div`
  color: ${({ theme }) => theme.text1};
  flex-wrap: nowrap;
  font-size: 22px;
  font-weight: 600;
  line-height: 110%;
  margin-bottom: 0px;
`

export const BaseTokenLabel = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 20px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: 22px;
`

export const NetworkContainer = styled.div`
  -webkit-box-align: center;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.text1};
  border-radius: 100%;
  display: flex;
  height: 26px;
  -webkit-box-pack: center;
  justify-content: center;
  width: 26px;
`

export const DescWrapper = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.text3};
  line-height: 1.5;
  margin-bottom: auto;
`

export const MainInfoTitle = styled.span`
  color: ${({ theme }) => theme.text1};
  font-style: normal;
  font-weight: normal;
  text-transform: uppercase;
  font-size: 12px;
`

export const MainInfo = styled.span`
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  line-height: 110%;
  text-transform: uppercase;
  font-size: 24px;
  margin-bottom: 1.5rem !important;
`

export const TicksContainer = styled.div`
  width: 100%;
`

export const TickContainer = styled.div`
  justify-content: space-between !important;
  flex-direction: row !important;
  display: flex !important;
`

export const TickLabel = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  color: ${({ theme }) => theme.text2};
`

export const Tick = styled.span`
  color: ${({ theme }) => theme.text1};
  font-style: normal;
  font-weight: normal;
  text-transform: uppercase;
  font-size: 14px;
  line-height: 20px;
`
