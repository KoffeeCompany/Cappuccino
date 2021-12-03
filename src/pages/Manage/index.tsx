import './style.css'
import { ThemeContext } from 'styled-components/macro'
import { MuiBox, MuiIcon } from './styled'
import StickyHeadTable from './sticky-table'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useContext } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import { Link } from 'react-router-dom'

export default function Manage() {
  const theme = useContext(ThemeContext)
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
          <Box className="bond-title">
            <Grid>
              <ButtonPrimary
                as={Link}
                to="/create/0x383518188C0C6d7730D91b2c03a03C837814a899/0x6B175474E89094C44Da98b954EedeAC495271d0F"
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
              <StickyHeadTable></StickyHeadTable>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </>
  )
}
