import { useState, useCallback, useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { RowBetween, RowFixed } from '../Row'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import CurrencyLogo from '../CurrencyLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { darken } from 'polished'
import { Option } from '../../entities/option'
import { ButtonError, ButtonGray, ButtonPrimary } from '../Button'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { filterTokens, useSortedTokensByQuery } from '../SearchModal/filtering'
import { useTokenComparator } from '../SearchModal/sorting'
import { Link } from 'react-router-dom'

export const CurrencyDropdown = styled(CurrencyInputPanel)`
  width: 48.5%;
`
const Container = styled.div`
  width: 100%;
`
const InputTitle = styled(TYPE.small)`
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 5px !important;
`

const StyledInput = styled(NumericalInput)<{ usePercent?: boolean }>`
  background-color: transparent;
  text-align: right;
  width: 100%;
  font-weight: 500;
  padding: 0 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `};
`

export const ResponsiveTwoColumns = styled.div<{ wide: boolean }>`
  display: grid;
  grid-column-gap: 50px;
  grid-row-gap: 15px;
  grid-template-columns: ${({ wide }) => (wide ? '1fr 1fr' : '1fr')};
  grid-template-rows: max-content;
  grid-auto-flow: row;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;

    margin-top: 0;
  `};
`

export const ResponsiveThreeColumns = styled.div<{ wide: boolean }>`
  display: grid;
  grid-column-gap: 50px;
  grid-row-gap: 15px;
  grid-template-columns: ${({ wide }) => (wide ? '1fr 1fr 1fr' : '1fr')};
  grid-template-rows: max-content;
  grid-auto-flow: row;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-template-columns: 1fr;

  margin-top: 0;
`};
`
const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`
const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.2rem 0 0.2rem;' : '  margin: 0 0.2rem 0 0.2rem;')}
  font-size:  ${({ active }) => (active ? '14px' : '14px')};
`

const CurrencySelect = styled(ButtonGray)<{ selected: boolean; hideInput?: boolean }>`
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg0 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 16px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  height: ${({ hideInput }) => (hideInput ? '2rem' : '1.6rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

interface OptionsDetailProps {
  onCurrencySelect?: (currency: Currency) => void
  option?: Option | undefined
  pair?: Pair | null
}

export default function OptionsDetail({ onCurrencySelect, option, pair = null, ...rest }: OptionsDetailProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId } = useActiveWeb3React()

  const currency = option?.lp ? option?.lp.split('/') : undefined
  const currencyIdA = currency ? currency[0] : '-'
  const currencyIdB = currency ? currency[1] : '-'
  const baseCurrency = useCurrency(currencyIdA)

  const debouncedQuery = currencyIdB
  const [invertSearchOrder] = useState<boolean>(false)

  const tokenComparator = useTokenComparator(invertSearchOrder)
  const allTokens = useAllTokens()
  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery)
  }, [allTokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)
  const currencyB = filteredSortedTokens.length > 0 ? filteredSortedTokens[0] : undefined
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  return (
    <>
      <AutoColumn gap="sm">
        <RowBetween>
          <ResponsiveTwoColumns wide={true} style={{ position: 'relative' }}>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Token 0</Trans>
              </InputTitle>
              <CurrencySelect
                selected={!!baseCurrency}
                hideInput={true}
                className="open-currency-select-button"
                onClick={() => {
                  if (onCurrencySelect) {
                    setModalOpen(true)
                  }
                }}
              >
                <Aligner>
                  <RowFixed>
                    {pair ? (
                      <span style={{ marginRight: '0.5rem' }}>
                        <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                      </span>
                    ) : baseCurrency ? (
                      <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={baseCurrency} size={'24px'} />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName
                        className="token-symbol-container"
                        active={Boolean(baseCurrency && baseCurrency.symbol)}
                      >
                        {(baseCurrency && baseCurrency.symbol && baseCurrency.symbol.length > 20
                          ? baseCurrency.symbol.slice(0, 4) +
                            '...' +
                            baseCurrency.symbol.slice(baseCurrency.symbol.length - 5, baseCurrency.symbol.length)
                          : baseCurrency?.symbol) || <Trans>Select a token</Trans>}
                      </StyledTokenName>
                    )}
                  </RowFixed>
                  {onCurrencySelect && <StyledDropDown selected={!!baseCurrency} />}
                </Aligner>
              </CurrencySelect>
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Token 1</Trans>
              </InputTitle>
              <CurrencySelect
                selected={!!quoteCurrency}
                hideInput={true}
                className="open-currency-select-button"
                onClick={() => {
                  if (onCurrencySelect) {
                    setModalOpen(true)
                  }
                }}
              >
                <Aligner>
                  <RowFixed>
                    {pair ? (
                      <span style={{ marginRight: '0.5rem' }}>
                        <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                      </span>
                    ) : quoteCurrency ? (
                      <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={quoteCurrency} size={'24px'} />
                    ) : null}
                    {pair ? (
                      <StyledTokenName className="pair-name-container">
                        {pair?.token0.symbol}:{pair?.token1.symbol}
                      </StyledTokenName>
                    ) : (
                      <StyledTokenName
                        className="token-symbol-container"
                        active={Boolean(quoteCurrency && quoteCurrency.symbol)}
                      >
                        {(quoteCurrency && quoteCurrency.symbol && quoteCurrency.symbol.length > 20
                          ? quoteCurrency.symbol.slice(0, 4) +
                            '...' +
                            quoteCurrency.symbol.slice(quoteCurrency.symbol.length - 5, quoteCurrency.symbol.length)
                          : quoteCurrency?.symbol) || <Trans>Select a token</Trans>}
                      </StyledTokenName>
                    )}
                  </RowFixed>
                  {onCurrencySelect && <StyledDropDown selected={!!quoteCurrency} />}
                </Aligner>
              </CurrencySelect>
            </Container>
          </ResponsiveTwoColumns>
        </RowBetween>
        <RowBetween>
          <ResponsiveThreeColumns wide={true} style={{ position: 'relative' }}>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Lower tick</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.lowerTick ? option?.lowerTick : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Upper tick</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.upperTick ? option?.upperTick : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Maturity</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.maturity ? option?.maturity : ''}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
          </ResponsiveThreeColumns>
        </RowBetween>

        <RowBetween>
          <ResponsiveThreeColumns wide={true} style={{ position: 'relative' }}>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Strike</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.strike ? option?.strike : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Current Price</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.currentPrice ? option?.currentPrice : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Value</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.value ? option?.value : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
          </ResponsiveThreeColumns>
        </RowBetween>

        <RowBetween>
          <ResponsiveThreeColumns wide={true} style={{ position: 'relative' }}>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Delta</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.delta ? option?.delta : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Beta</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.beta ? option?.beta : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={(val) => {
                  //
                }}
              />
            </Container>
            <Container>
              <ButtonPrimary
                as={Link}
                to="/add/ETH"
                style={{ backgroundColor: '#1abb96', width: '100%', borderRadius: '8px' }}
                padding="8px"
                margin="20px"
              >
                <Trans>Buy</Trans>
              </ButtonPrimary>
            </Container>
          </ResponsiveThreeColumns>
        </RowBetween>
      </AutoColumn>
    </>
  )
}
