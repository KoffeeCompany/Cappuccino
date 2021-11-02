import { Trans } from '@lingui/macro'
import { AgGridReact } from 'ag-grid-react'
import { useActiveWeb3React } from 'hooks/web3'
import { useDarkModeManager } from 'state/user/hooks'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'

export default function OptionsGrid() {
  const { account, chainId } = useActiveWeb3React()
  const [darkMode] = useDarkModeManager()

  const state = {
    columnDefs: [
      { headerName: 'LP', field: 'lp', flex: 1 },
      { headerName: 'Lower tick', field: 'lowerTick', flex: 1 },
      { headerName: 'Upper tick', field: 'upperTick', flex: 1 },
      { headerName: 'Position size', field: 'positionSize', flex: 1 },
      { headerName: 'Maturity', field: 'maturity', flex: 1 },
      { headerName: 'Strike', field: 'strike', flex: 1 },
      { headerName: 'Current price', field: 'currentPrice', flex: 1 },
      { headerName: 'Token 0', field: 'token0', flex: 1 },
      { headerName: 'Token 1', field: 'token1', flex: 1 },
      { headerName: 'Value (ETH)', field: 'value', flex: 1 },
      { headerName: 'Delta', field: 'delta', flex: 1 },
      { headerName: 'Beta', field: 'beta', flex: 1 },
    ],
    rowData: [
      {
        lp: 'ETH/Dai',
        lowerTick: 1500,
        upperTick: 2600,
        positionSize: 1,
        maturity: '7D',
        strike: 2300,
        currentPrice: 1990,
        token0: 0.45,
        token1: 947.06,
        value: 0.93,
        delta: 0.4518,
        beta: 1,
      },
      {
        lp: 'ETH/WBTC',
        lowerTick: 0.05,
        upperTick: 0.1,
        positionSize: 1,
        maturity: '10D',
        strike: 0.07,
        currentPrice: 0.06,
        token0: 0.6841,
        token1: 0.0174,
        value: 0.9708,
        delta: 0.6841,
        beta: 0.545,
      },
      {
        lp: 'ETH/UNI',
        lowerTick: 50,
        upperTick: 175,
        positionSize: 1,
        maturity: '1M',
        strike: 120,
        currentPrice: 105.5143,
        token0: 0.33,
        token1: 48.6256,
        value: 0.79,
        delta: 0.33,
        beta: 0.912,
      },
    ],
  }

  return (
    <div style={{ height: '300px' }} className={darkMode ? 'ag-theme-balham-dark' : 'ag-theme-balham'}>
      <AgGridReact columnDefs={state.columnDefs} rowData={state.rowData}></AgGridReact>
    </div>
  )
}
