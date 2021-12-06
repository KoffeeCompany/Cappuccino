/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
import * as React from 'react'
import { ThemeContext } from 'styled-components/macro'
import { useContext, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { darken, lighten } from 'polished'
import { useDarkModeManager } from 'state/user/hooks'
import { Maturity } from 'constants/maturity'
import { DataGrid, GridApi, GridCellValue, GridColDef, GridRowId, GridValueFormatterParams } from '@mui/x-data-grid'
import { makeStyles } from '@material-ui/core'
import { useActiveWeb3React } from 'hooks/web3'
import { useWalletModalToggle } from 'state/application/hooks'

function createData(
  id: number,
  optionType: string,
  currencyA: string,
  currencyB: string,
  liquidity: number,
  bcv: number,
  strike: number,
  maturity: number
) {
  const pair = currencyA + '/' + currencyB
  return {
    id: id,
    optionType: optionType,
    pair: pair,
    liquidity: liquidity,
    bcv: bcv,
    strike: strike,
    maturity: maturity,
  }
}

function formatNumber(params: GridValueFormatterParams) {
  if (params === undefined || params.value === undefined) {
    return ''
  }
  return +parseFloat(params!.value!.toString())
    .toFixed(3)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function pad(n: number) {
  return n < 10 ? '0' + n : n
}

function timerDisplay(seconds: number) {
  if (seconds <= 0) {
    return 'Expiry'
  } else {
    const days = Math.floor(seconds / 24 / 60 / 60)
    const hoursLeft = Math.floor(seconds - days * 86400)
    const hours = Math.floor(hoursLeft / 3600)
    const minutesLeft = Math.floor(hoursLeft - hours * 3600)
    const minutes = Math.floor(minutesLeft / 60)
    const remainingSeconds = seconds % 60
    return pad(days) + ':' + pad(hours) + ':' + pad(minutes) + ':' + pad(Number(remainingSeconds.toFixed(0)))
  }
}

interface StickyHeadTableProps {
  onUserClick?: (row: any) => void
}

export default function StickyHeadTable({ onUserClick }: StickyHeadTableProps) {
  const theme = useContext(ThemeContext)
  const [rows, setRows] = useState<any[]>([])
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  let row = 0

  const maturityCountdownTimer = (id: GridRowId, maturity: number) => {
    const timestamp = Date.now() / 1000
    const remaing = maturity - Number(timestamp.toFixed())
    if (remaing > 0) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        const timer = setInterval(() => {
          if (remaing <= 0) {
            clearInterval(timer)
          }
          setRows((prevRows) => {
            const rowToUpdateIndex = id.valueOf()
            return prevRows.map((row, index) => (index === rowToUpdateIndex ? { ...row, maturity: maturity - 1 } : row))
          })
        }, 1000)
        return () => {
          clearInterval(timer)
        }
      }, [])
    }

    return <div>{timerDisplay(remaing)}</div>
  }

  const columns: GridColDef[] = [
    { field: 'optionType', headerName: 'Type' },
    { field: 'pair', headerName: 'Pair' },
    {
      field: 'liquidity',
      headerName: 'Liquidity (OHM)',
      align: 'right',
      flex: 1,
      valueFormatter: formatNumber,
    },
    {
      field: 'bcv',
      headerName: 'BCV value',
      align: 'right',
      flex: 1,
      valueFormatter: formatNumber,
    },
    {
      field: 'strike',
      headerName: 'Strike (DAI)',
      align: 'right',
      flex: 1,
      valueFormatter: formatNumber,
    },
    {
      field: 'maturity',
      headerName: 'Maturity',
      align: 'right',
      flex: 1,
      renderCell: (params) => {
        const maturity = params.getValue(params.id, 'maturity')
        return maturityCountdownTimer(params.id, Number(maturity))
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => {
        const onClick = (e: any) => {
          e.stopPropagation() // don't select this row after clicking

          const api: GridApi = params.api
          const thisRow: Record<string, GridCellValue> = {}

          api
            .getAllColumns()
            .filter((c) => c.field !== '__check__' && !!c)
            .forEach((c) => (thisRow[c.field] = params.getValue(params.id, c.field)))

          if (onUserClick != undefined) {
            onUserClick(thisRow)
          }
        }
        return !account ? (
          <Button
            variant="contained"
            size="small"
            style={{
              fontFamily: "'Inter var', sans-serif",
            }}
            onClick={toggleWalletModal}
          >
            Connect
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            size="small"
            style={{
              fontFamily: "'Inter var', sans-serif",
            }}
            onClick={onClick}
          >
            Buy
          </Button>
        )
      },
    },
  ]

  useEffect(() => {
    const timestamp = Date.now() / 1000
    setRows([
      createData(row++, 'CALL', 'OHM', 'DAI', 100, 1.2, 600, Number(timestamp) + Maturity.FIVE_DAYS),
      createData(row++, 'CALL', 'OHM', 'DAI', 400, 1.1, 720, Number(timestamp) + Maturity.FIVE_DAYS),
      createData(row++, 'PUT', 'OHM', 'DAI', 130, 1.05, 690, Number(timestamp) + Maturity.FIVE_DAYS),
      createData(row++, 'CALL', 'OHM', 'DAI', 200, 2, 680, Number(timestamp) + Maturity.FIVE_DAYS),
      createData(row++, 'PUT', 'OHM', 'DAI', 300, 1.4, 700, Number(timestamp) + Maturity.SEVEN_DAYS),
    ])
  }, [])

  const useStyle = makeStyles({
    grid: {
      color: theme.text1,
      border: 'none',
      '& .MuiTablePagination-root': {
        color: theme.text1,
      },
      '& .MuiDataGrid-overlay': {
        backgroundColor: theme.bg1,
      },
      '& .MuiDataGrid-columnSeparator': {
        visibility: 'hidden',
      },
      '& .MuiDataGrid-cell': {
        borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
      },
      '& .MuiDataGrid-columnHeaders': {
        borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
      },
    },
  })

  const classes = useStyle()

  return (
    <div style={{ width: '1024px', backgroundColor: 'transparent', height: '500px' }}>
      <DataGrid rows={rows} columns={columns} className={classes.grid} />
    </div>
  )
}
