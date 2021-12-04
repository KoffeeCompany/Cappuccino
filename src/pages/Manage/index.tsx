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
import Button from '@mui/material/Button'
import { Text } from 'rebass'
import { Trans, t } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { Link } from 'react-router-dom'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { Review } from './Review'
import { DAI, OHM } from 'constants/tokens'
import { Currency, CurrencyAmount, Percent, Token, Price } from '@uniswap/sdk-core'
import { unwrappedToken } from 'utils/unwrappedToken'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Maturity } from 'constants/maturity'

export default function Manage(history: any) {
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
  const [bondPrice, setBondPrice] = useState<Price<Currency, Currency>>(new Price(currencyA, currencyB, 1, 0))
  const [marketPrice, setMarketPrice] = useState<Price<Currency, Currency>>(new Price(currencyA, currencyB, 1, 0))
  const [maturity, setMaturity] = useState<Maturity>(Maturity.FIVE_DAYS)

  async function onUpdateLiquidityOption() {
    //
  }

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showAddLiquidity}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={t`Add liquidity`}
            onDismiss={handleDismissConfirmation}
            topContent={() => (
              <Review
                token0={token0}
                token1={token1}
                liquidity={liquidity}
                strike={strike}
                bcv={bcv}
                bondPrice={bondPrice}
                marketPrice={marketPrice}
                maturity={maturity}
              />
            )}
            bottomContent={() => (
              <ButtonPrimary style={{ marginTop: '1rem', borderRadius: '4px' }} onClick={onUpdateLiquidityOption}>
                <Text fontWeight={500} fontSize={20}>
                  <Trans>Add liquidity</Trans>
                </Text>
              </ButtonPrimary>
            )}
          />
        )}
        pendingText={undefined}
      />
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
          <Box className="bond-title">
            <Grid>
              <ButtonPrimary
                as={Link}
                to={`/create/${OHM.address}/${DAI.address}`}
                style={{
                  width: 'fit-content',
                  borderRadius: '4px',
                  fontFamily: "'Inter var', sans-serif",
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem',
                  padding: '4px 10px',
                  lineHeight: '1.75',
                  letterSpacing: '0.02857em',
                }}
                padding="8px"
              >
                <Trans>Create Options</Trans>
              </ButtonPrimary>
            </Grid>
            <Typography variant="h5" gutterBottom component="div" style={{ color: theme.text3 }}>
              Total Liquidity Bonded
            </Typography>
            <Typography variant="h2" gutterBottom component="div" style={{ color: theme.text1, fontWeight: 'bold' }}>
              $19,590,533
            </Typography>
          </Box>
          <Grid className="grid-container bond-grid">
            <Grid className="grid-container grid-row">
              <StickyHeadTable
                onUserClick={(row) => {
                  setLiquidity(CurrencyAmount.fromRawAmount(currencyA, row.liquidity))
                  setStrike(CurrencyAmount.fromRawAmount(currencyB, row.strike))
                  setBcv(parseFloat(row.bcv))
                  setBondPrice(
                    new Price(currencyA, currencyB, 1, parseUnits(row.bondPrice, currencyB.decimals).toString())
                  )
                  setMarketPrice(
                    new Price(
                      currencyA,
                      currencyB,
                      1,
                      parseUnits(
                        parseUnits(row.marketPrice, currencyA.decimals).toString(),
                        currencyB.decimals
                      ).toString()
                    )
                  )
                  setMaturity(Maturity.FIVE_DAYS)
                  setShowAddLiquidity(true)
                }}
              ></StickyHeadTable>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </>
  )
}
