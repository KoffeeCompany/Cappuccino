import { useState, useMemo, useEffect, useRef } from 'react'
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
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { darken } from 'polished'
import { ButtonConfirmed, ButtonError, ButtonGray, ButtonLight, ButtonPrimary } from '../Button'
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
import { formatUnits } from 'ethers/lib/utils'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import ProgressCircles from 'components/ProgressSteps'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { ExtendedEther, WETH9_EXTENDED } from 'constants/tokens'

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
  option?: Option | undefined
}

function formatNumber(value: any) {
  return Math.floor(value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export default function OptionsDetail({ option }: OptionsDetailProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const findToken = (token: string) => {
    const tokenKey = Object.keys(allTokens).find((key) => {
      return key.toLowerCase() === token.toLowerCase()
    })
    return tokenKey ? allTokens[tokenKey] : undefined
  }

  const deadline = useTransactionDeadline()
  const amountToApprove = option && option.price ? BigNumber.from(option?.price) : undefined
  const tokenToApprove =
    option && option.token1 && option.token0
      ? findToken(option?.optionType?.toUpperCase() == 'CALL' ? option.token1 : option.token0)
      : undefined
  const currencyAmountToApprove =
    amountToApprove && tokenToApprove
      ? CurrencyAmount.fromRawAmount(tokenToApprove, amountToApprove.toString())
      : undefined
  const optionContract = useOptionContract(optionAddresses)
  const [approval, approveCallback] = useApproveCallback(currencyAmountToApprove, optionAddresses)

  const isEthOrWETH = (currencyId: string | undefined): boolean => {
    const isETH = currencyId?.toUpperCase() === 'ETH'
    const weth = chainId ? WETH9_EXTENDED[chainId] : undefined
    if (weth?.address?.toLowerCase() === currencyId?.toLowerCase()) return true
    return isETH
  }

  async function onAttemptToApprove() {
    await approveCallback().then(async () => {
      console.log('>>>>>>START BUY')
      await onBuyOption()
    })
  }

  async function onBuyOption() {
    if (optionContract) {
      setAttempting(true)
      if (optionContract && amountToApprove && deadline) {
        if (approval === ApprovalState.APPROVED) {
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
                price: amountToApprove ? amountToApprove : undefined,
              },
              {
                gasLimit: 3500000,
                value:
                  tokenToApprove && amountToApprove
                    ? isEthOrWETH(tokenToApprove.symbol)
                      ? amountToApprove
                      : undefined
                    : undefined,
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
        } else {
          setAttempting(false)
          throw new Error('Attempting to buy option without approval. Please contact support.')
        }
      }
    }
  }

  const [remainTimeStampState, setRemainTimeStampState] = useState<BigNumber>(ethers.constants.Zero)
  const timestamp = Date.now() / 1000
  const remainTimeStamp = useRef<BigNumber>(ethers.constants.Zero)
  useEffect(() => {
    console.log('>>>>>>>useEffect called')
    if (option != undefined && option.maturity != undefined) {
      remainTimeStamp.current = option.maturity
        ? BigNumber.from(option?.maturity).sub(timestamp.toFixed())
        : ethers.constants.Zero
      console.log('>>>>>>>remainTimeStamp', remainTimeStamp.current.toString())
      if (remainTimeStamp.current.lte(0)) {
        remainTimeStamp.current = ethers.constants.Zero
      }
      console.log('>>>>>>>option', option)
      console.log('>>>>>>>remainTimeStamp', remainTimeStamp.current.toString())
    } else {
      remainTimeStamp.current = ethers.constants.Zero
    }
    setRemainTimeStampState(remainTimeStamp.current)
  }, [option])

  const isExpired = remainTimeStamp.current.eq(0)

  const Buttons = () =>
    !account ? (
      <ButtonLight onClick={toggleWalletModal} $borderRadius="12px" padding={'12px'}>
        <Trans>Connect to a wallet</Trans>
      </ButtonLight>
    ) : (
      <>
        <RowBetween>
          <ButtonError onClick={onAttemptToApprove} disabled={isExpired} error={isExpired} padding="8px" margin="20px">
            <Trans>Buy</Trans>
          </ButtonError>
        </RowBetween>
      </>
    )

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    hourCycle: 'h24',
    timeStyle: 'long',
  }

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
                  // if (onCurrencySelect) {
                  //   setModalOpen(true)
                  // }
                }}
              >
                <Aligner>
                  <RowFixed>
                    {baseCurrency ? (
                      <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={baseCurrency} size={'24px'} />
                    ) : null}
                    {
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
                    }
                  </RowFixed>
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
                  // if (onCurrencySelect) {
                  //   setModalOpen(true)
                  // }
                }}
              >
                <Aligner>
                  <RowFixed>
                    {quoteCurrency ? (
                      <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={quoteCurrency} size={'24px'} />
                    ) : null}
                    {
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
                    }
                  </RowFixed>
                </Aligner>
              </CurrencySelect>
            </Container>
          </ResponsiveTwoColumns>
        </RowBetween>
        <RowBetween>
          <ResponsiveThreeColumns wide={true} style={{ position: 'relative' }}>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Notional</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.notional ? formatUnits(option?.notional) : '0'}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Strike Tick</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.strike ? formatNumber(option?.strike) : '0'}
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
                value={
                  remainTimeStampState.eq(0)
                    ? 'Expired'
                    : `${(remainTimeStampState.toNumber() / (3600 * 24)).toFixed()} ${
                        (remainTimeStampState.toNumber() / (3600 * 24)).toFixed() == '1' ||
                        (remainTimeStampState.toNumber() / (3600 * 24)).toFixed() == '0'
                          ? 'day'
                          : 'days'
                      }`
                }
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
                <Trans>Status</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={option?.status ? option?.status : ''}
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
                  //
                }}
              />
            </Container>
            <Container>
              <InputTitle fontSize={13} textAlign="left">
                <Trans>Premium</Trans>
              </InputTitle>
              <StyledInput
                className="rate-input-0"
                value={
                  option?.price && tokenToApprove ? `${formatUnits(option?.price)} ${tokenToApprove?.symbol}` : '0'
                }
                fontSize="20px"
                disabled={true}
                onUserInput={() => {
                  //
                }}
              />
            </Container>
            <Container></Container>
          </ResponsiveThreeColumns>
        </RowBetween>
        <Buttons />

        {/* <RowBetween>
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
        </RowBetween> */}
      </AutoColumn>
    </>
  )
}
