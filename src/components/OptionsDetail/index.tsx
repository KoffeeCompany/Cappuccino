import { useState, useMemo } from 'react'
import { t, Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { RowBetween, RowFixed } from '../Row'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import CurrencyLogo from '../CurrencyLogo'
import { Input as NumericalInput } from '../NumericalInput'
import { Currency, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { darken } from 'polished'
import { ButtonGray, ButtonLight, ButtonPrimary } from '../Button'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { filterTokens, useSortedTokensByQuery } from '../SearchModal/filtering'
import { useTokenComparator } from '../SearchModal/sorting'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Option } from 'types/option'
import { OPTION_ADDRESSES } from 'constants/addresses'
import { useOptionContract } from 'hooks/useContract'
import { TransactionResponse } from '@ethersproject/providers'
import { useIsExpertMode } from 'state/user/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { BigNumber, ethers } from 'ethers'
import GetOptionContract from 'abis'

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

export default function OptionsDetail({ onCurrencySelect, option, pair = null }: OptionsDetailProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalOpen, setModalOpen] = useState(false)
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()

  const currencyIdA = option != undefined && option.token0 != undefined ? option.token0 : '-'
  const currencyIdB = option != undefined && option.token1 != undefined ? option.token1 : '-'
  const baseCurrency = useCurrency(currencyIdA)

  const debouncedQuery = currencyIdB!
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

  const optionAddresses: string | undefined = useMemo(() => {
    if (chainId) {
      if (OPTION_ADDRESSES[chainId]) {
        return OPTION_ADDRESSES[chainId]
      }
      return undefined
    }
    return undefined
  }, [chainId])

  const [attempting, setAttempting] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  /*
  buyOption(
      tokenId_: BigNumberish,
      optionData_: {
        pool: string;
        optionType: BigNumberish;
        strike: BigNumberish;
        notional: BigNumberish;
        maturity: BigNumberish;
        maker: string;
        resolver: string;
        price: BigNumberish;
      }
  */

  const optionContract = useOptionContract(optionAddresses)

  // const provider = new ethers.providers.Web3Provider(window.ethereum!)
  // const signer = provider.getSigner()

  // const toto = GetOptionContract(optionAddresses!, signer)
  // toto.buyOption()

  async function onBuyOption() {
    if (optionContract) {
      setAttempting(true)

      console.log('>>>>>>>>>option', {
        pool: option?.pool,
        optionType: option && option.optionType ? (option?.optionType?.toUpperCase() == 'CALL' ? 0 : 1) : 0,
        strike: option && option.strike ? BigNumber.from(option?.strike) : undefined,
        notional: option && option.notional ? BigNumber.from(option?.notional) : undefined,
        maturity: option && option.maturity ? BigNumber.from(option?.maturity) : undefined,
        maker: option?.maker,
        resolver: option?.resolver,
        price: option && option.price ? BigNumber.from(option?.price) : undefined,
      })

      await optionContract
        .buyOption(
          option && option.id ? BigNumber.from(option?.id) : undefined,
          {
            pool: option?.pool,
            optionType: option && option.optionType ? (option?.optionType?.toUpperCase() == 'CALL' ? 0 : 1) : 0,
            strike: option && option.strike ? BigNumber.from(option?.strike) : undefined,
            notional: option && option.notional ? BigNumber.from(option?.notional) : undefined,
            maturity: option && option.maturity ? BigNumber.from(option?.maturity) : undefined,
            maker: option?.maker,
            resolver: option?.resolver,
            price: option && option.price ? BigNumber.from(option?.price) : undefined,
          },
          {
            gasLimit: 3500000,
            value: option && option.price ? BigNumber.from(option?.price) : undefined,
          }
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: t`Buy option transaction`,
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
    !account ? (
      <ButtonLight onClick={toggleWalletModal} $borderRadius="12px" padding={'12px'}>
        <Trans>Connect to a wallet</Trans>
      </ButtonLight>
    ) : (
      <ButtonPrimary
        onClick={onBuyOption}
        style={{ backgroundColor: '#1abb96', width: '100%', borderRadius: '8px' }}
        padding="8px"
        margin="20px"
      >
        <Trans>Buy</Trans>
      </ButtonPrimary>
    )

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
                value={option?.amount0 ? option?.amount0.toString() : '0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={option?.amount1 ? option?.amount1.toString() : '0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={option?.maturity ? option?.maturity.toString() : ''}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={option?.strike ? option?.strike.toString() : 0}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={option?.price ? option?.price.toString() : '0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={option?.price ? option?.price.toString() : '0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={'0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
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
                value={'0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
                  //
                }}
              />
            </Container>
            <Container>
              <Buttons />
            </Container>
          </ResponsiveThreeColumns>
        </RowBetween>
      </AutoColumn>
    </>
  )
}
