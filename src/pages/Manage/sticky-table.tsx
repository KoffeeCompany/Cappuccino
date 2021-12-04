/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
import * as React from 'react'
import { ThemeContext } from 'styled-components/macro'
import { useContext, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { darken, lighten } from 'polished'
import { useDarkModeManager } from 'state/user/hooks'
import { Maturity } from 'constants/maturity'
import { useGetOhmDaiPrice } from 'state/mint/v3/hooks'
import { DAI, OHM } from 'constants/tokens'
import { unwrappedToken } from 'utils/unwrappedToken'
import { DataGrid, GridApi, GridCellValue, GridColDef, GridValueFormatterParams } from '@mui/x-data-grid'
import { makeStyles } from '@material-ui/core'

function createData(
  id: number,
  optionType: string,
  currencyA: string,
  currencyB: string,
  liquidity: number,
  bcv: number,
  strike: number,
  bondPrice: string,
  marketPrice: string,
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
    bondPrice: bondPrice,
    marketPrice: marketPrice,
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

interface StickyHeadTableProps {
  onUserClick?: (row: any) => void
}

export default function StickyHeadTable({ onUserClick }: StickyHeadTableProps) {
  const theme = useContext(ThemeContext)
  const [rows, setRows] = useState<any[]>([])
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const currencyA = unwrappedToken(OHM)
  const currencyB = unwrappedToken(DAI)
  const { bondPrice, marketPrice } = useGetOhmDaiPrice(currencyA, currencyB)
  let row = 0

  const columns: GridColDef[] = [
    { field: 'optionType', headerName: 'Type' },
    { field: 'pair', headerName: 'Pair' },
    {
      field: 'liquidity',
      headerName: 'Liquidity (OHM)',
      align: 'right',
      valueFormatter: formatNumber,
    },
    {
      field: 'bcv',
      headerName: 'BCV value',
      align: 'right',
      valueFormatter: formatNumber,
    },
    {
      field: 'strike',
      headerName: 'Strike (DAI)',
      align: 'right',
      valueFormatter: formatNumber,
    },
    {
      field: 'bondPrice',
      headerName: 'Bond price',
      align: 'right',
      valueFormatter: formatNumber,
    },
    {
      field: 'marketPrice',
      headerName: 'Market price',
      align: 'right',
      valueFormatter: formatNumber,
    },
    {
      field: 'maturity',
      headerName: 'Maturity',
      align: 'right',
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
        return (
          <Button
            variant="outlined"
            color="error"
            size="small"
            style={{
              fontFamily: "'Inter var', sans-serif",
            }}
            onClick={onClick}
          >
            Add liquidity
          </Button>
        )
      },
    },
  ]

  useEffect(() => {
    const bp = bondPrice ? bondPrice.divide(Math.pow(10, currencyB.decimals)).toSignificant(6) : '0'
    const mp = marketPrice
      ? marketPrice.divide(Math.pow(10, currencyB.decimals)).divide(Math.pow(10, currencyA.decimals)).toSignificant(6)
      : '0'
    setRows([
      createData(row++, 'CALL', 'OHM', 'DAI', 100, 1.2, 600, bp, mp, Maturity.FIVE_DAYS),
      createData(row++, 'CALL', 'OHM', 'DAI', 400, 1.1, 720, bp, mp, Maturity.FIVE_DAYS),
      createData(row++, 'PUT', 'OHM', 'DAI', 130, 1.05, 690, bp, mp, Maturity.FIVE_DAYS),
      createData(row++, 'CALL', 'OHM', 'DAI', 200, 2, 680, bp, mp, Maturity.FIVE_DAYS),
      createData(row++, 'PUT', 'OHM', 'DAI', 300, 1.4, 700, bp, mp, Maturity.SEVEN_DAYS),
    ])
  }, [bondPrice, marketPrice])

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
