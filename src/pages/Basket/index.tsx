import './style.css'
import { ThemeContext } from 'styled-components/macro'
import { MuiBox, MuiIcon } from './styled'
import StickyHeadTable from './sticky-table'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useCallback, useContext, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { Trans, t } from '@lingui/macro'
import { DAI, OHM } from 'constants/tokens'
import { Currency, CurrencyAmount, Percent, Token, Price } from '@uniswap/sdk-core'
import { unwrappedToken } from 'utils/unwrappedToken'
import { Maturity } from 'constants/maturity'
import { TYPE } from 'theme'
import { useGetOhmDaiPrice } from 'state/mint/v3/hooks'
import { OptionType } from 'state/data/generated'

export default function Basket(history: any) {
  const theme = useContext(ThemeContext)
  const [showAddLiquidity, setShowAddLiquidity] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txHash, setTxHash] = useState<string>('')
  const handleDismissConfirmation = useCallback(() => {
    setShowAddLiquidity(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      history.push('/manage')
    }
    setTxHash('')
  }, [history, txHash])

  const token0 = OHM
  const currencyA = unwrappedToken(token0)
  const token1 = DAI
  const currencyB = unwrappedToken(token1)
  const [liquidity, setLiquidity] = useState<CurrencyAmount<Currency>>(CurrencyAmount.fromRawAmount(currencyA, 0))
  const [strike, setStrike] = useState<CurrencyAmount<Currency>>(CurrencyAmount.fromRawAmount(currencyB, 0))
  const [bcv, setBcv] = useState<number>(0)
  const [maturity, setMaturity] = useState<Maturity>(Maturity.FIVE_DAYS)
  const [optionType, setOptionType] = useState<OptionType>(OptionType.Call)
  const { bondPrice, marketPrice } = useGetOhmDaiPrice(currencyA, currencyB)

  return (
    <>
      <Container maxWidth="lg">
        <MuiBox className="strategies-title">
          <Grid className="grid-side">
            <div></div>
          </Grid>
          <Grid>
            <MuiIcon>Ohmptions</MuiIcon>
            <Typography
              variant="h4"
              gutterBottom
              component="div"
              className="typo-subTitle"
              style={{ color: theme.text2 }}
            >
              Hedge your position with the Ohmptions
            </Typography>
          </Grid>
          <Grid className="grid-side">
            <div></div>
          </Grid>
        </MuiBox>
      </Container>
      <div className="plutus-view">
        <Paper elevation={0} className="ohm-card" style={{ background: theme.bg0 }}>
          <Box className="bond-title bond-price-data-row">
            <div className="bond-price-data">
              <Typography
                variant="h5"
                gutterBottom
                component="div"
                style={{ color: theme.text3, fontFamily: "'Inter var', sans-serif" }}
              >
                Current Bond price
              </Typography>
              <Typography
                variant="h4"
                gutterBottom
                component="div"
                style={{ color: theme.text1, fontWeight: 600, fontFamily: "'Inter var', sans-serif" }}
              >
                {`${bondPrice ? bondPrice.divide(Math.pow(10, token1.decimals)).toSignificant(6) : '0.0'} `}
              </Typography>
              <TYPE.main textAlign="center" fontSize="15px">
                <Trans>
                  {token1.symbol} per {token0.symbol}
                </Trans>
              </TYPE.main>
            </div>
            <div className="bond-price-data">
              <Typography
                variant="h5"
                gutterBottom
                component="div"
                style={{ color: theme.text3, fontFamily: "'Inter var', sans-serif" }}
              >
                Current Market price
              </Typography>
              <Typography
                variant="h4"
                gutterBottom
                component="div"
                style={{ color: theme.text1, fontWeight: 600, fontFamily: "'Inter var', sans-serif" }}
              >
                {`${
                  marketPrice
                    ? marketPrice
                        .divide(Math.pow(10, token0.decimals))
                        .divide(Math.pow(10, token1.decimals))
                        .toSignificant(6)
                    : '0.0'
                } `}
              </Typography>
              <TYPE.main textAlign="center" fontSize="15px">
                <Trans>
                  {token1.symbol} per {token0.symbol}
                </Trans>
              </TYPE.main>
            </div>
          </Box>
          <Grid className="grid-container bond-grid">
            <Grid className="grid-container grid-row">
              <StickyHeadTable
                onUserClick={(row) => {
                  setLiquidity(CurrencyAmount.fromRawAmount(currencyA, row.liquidity))
                  setStrike(CurrencyAmount.fromRawAmount(currencyB, row.strike))
                  setBcv(parseFloat(row.bcv))
                  setMaturity(Maturity.FIVE_DAYS)
                  setOptionType(row.optionType.toUpperCase() == 'PUT' ? OptionType.Put : OptionType.Call)
                }}
              ></StickyHeadTable>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </>
  )
}
