import * as React from 'react'
import { ThemeContext } from 'styled-components/macro'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useContext } from 'react'
import Button from '@mui/material/Button'
import { darken, lighten } from 'polished'
import { useDarkModeManager } from 'state/user/hooks'

const columns = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'code', label: 'ISO\u00a0Code', minWidth: 100 },
  {
    id: 'population',
    label: 'Population',
    minWidth: 150,
    align: 'right',
    format: (value: any) => value.toLocaleString('en-US'),
  },
  {
    id: 'size',
    label: 'Size\u00a0(km\u00b2)',
    minWidth: 150,
    align: 'right',
    format: (value: any) => value.toLocaleString('en-US'),
  },
  {
    id: 'density',
    label: 'Density',
    minWidth: 150,
    align: 'right',
    format: (value: any) => value.toFixed(2),
  },
]

function createData(name: string, code: string, population: number, size: number) {
  const density = population / size
  return { name, code, population, size, density }
}

const rows = [
  createData('India', 'IN', 1324171354, 3287263),
  createData('China', 'CN', 1403500365, 9596961),
  createData('Italy', 'IT', 60483973, 301340),
  createData('United States', 'US', 327167434, 9833520),
  createData('Canada', 'CA', 37602103, 9984670),
  createData('Australia', 'AU', 25475400, 7692024),
  createData('Germany', 'DE', 83019200, 357578),
  createData('Ireland', 'IE', 4857000, 70273),
  createData('Mexico', 'MX', 126577691, 1972550),
  createData('Japan', 'JP', 126317000, 377973),
  createData('France', 'FR', 67022000, 640679),
  createData('United Kingdom', 'GB', 67545757, 242495),
  createData('Russia', 'RU', 146793744, 17098246),
  createData('Nigeria', 'NG', 200962417, 923768),
  createData('Brazil', 'BR', 210147125, 8515767),
]

export default function StickyHeadTable() {
  const theme = useContext(ThemeContext)
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const buyBtn = (
    <Button
      variant="outlined"
      color="success"
      size="small"
      style={{
        fontFamily: "'Inter var', sans-serif",
      }}
    >
      Exercise
    </Button>
  )
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: 'transparent' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{
                    minWidth: column.minWidth,
                    fontFamily: "'Inter var', sans-serif",
                    color: theme.text2,
                    backgroundColor: theme.bg0,
                    borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell
                style={{
                  minWidth: '30px',
                  fontFamily: "'Inter var', sans-serif",
                  color: theme.text2,
                  backgroundColor: theme.bg0,
                  borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column) => {
                    const value = (row as any)[column.id]
                    return (
                      <TableCell
                        key={column.id}
                        style={{
                          fontFamily: "'Inter var', sans-serif",
                          color: theme.text2,
                          borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
                        }}
                      >
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    )
                  })}
                  <TableCell
                    style={{
                      borderBottomColor: darkMode ? darken(0.1, theme.text3) : lighten(0.4, theme.text3),
                    }}
                  >
                    {buyBtn}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
