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
              // <Review
              //   parsedAmounts={parsedAmounts}
              //   position={position}
              //   existingPosition={existingPosition}
              //   priceLower={priceLower}
              //   priceUpper={priceUpper}
              //   outOfRange={outOfRange}
              //   ticksAtLimit={ticksAtLimit}
              //   strike={
              //     price == undefined || priceUpper == undefined
              //       ? tickLower!
              //       : (invertPrice ? price.invert().lessThan(priceUpper.invert()) : price.lessThan(priceUpper))
              //       ? tickLower!
              //       : tickUpper!
              //   }
              //   optionValue={optionValueCurrencyAmount}
              //   maturity={maturity}
              // />
              <div></div>
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
              <StickyHeadTable onUserClick={() => setShowAddLiquidity(true)}></StickyHeadTable>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </>
  )
}
