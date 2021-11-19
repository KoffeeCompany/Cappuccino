import { AgGridReact } from 'ag-grid-react'
import { useDarkModeManager } from 'state/user/hooks'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'
import { Option, OptionUI } from '../../types/option'
import { useEffect, useState } from 'react'
import { CHAIN_SUBGRAPH_URL, queryOption } from 'state/option/slice'
import { useActiveWeb3React } from 'hooks/web3'
import { OptionType } from 'state/data/generated'
import { getContract } from 'utils'
import ERC20_ABI from 'abis/erc20.json'
import { Contract } from 'ethers'

interface OptionsGridProps {
  onRowSelect: (row: any) => void
  optionType: OptionType
}

export default function OptionsGrid({ onRowSelect, optionType }: OptionsGridProps) {
  const [darkMode] = useDarkModeManager()
  // set to default data
  const [rowData, setRowData] = useState<OptionUI[]>([])
  const { account, chainId, library } = useActiveWeb3React()

  const toDataUI = (item: Option): OptionUI => {
    const res: OptionUI = {
      lp: '-',
      id: item.id,
      status: item.status,
      buyer: item.buyer,
      strike: item.strike,
      optionType: item.optionType,
      notional: item.notional,
      maturity: item.maturity,
      feeToken: item.feeToken,
      price: item.price,
      maxFeeAmount: item.maxFeeAmount,
      feeAmount: item.feeAmount,
      amount0: item.amount0,
      amount1: item.amount1,
      pool: item.pool,
      token0: item.token0,
      token1: item.token1,
      poolFee: item.poolFee,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
    return res
  }

  const subgraphUrl = chainId ? CHAIN_SUBGRAPH_URL[chainId] : undefined

  useEffect(() => {
    if (!subgraphUrl) {
      console.log(`Subgraph queries against ChainId ${chainId} are not supported.`)
    } else {
      queryOption(subgraphUrl, optionType).then((data) => {
        const dataUI: OptionUI[] = []
        data.map((item) => {
          dataUI.push(toDataUI(item))
        })
        setRowData(dataUI)
        console.log('>>>>>>>data', data)
      })
    }
  }, [optionType])

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
    rowData: rowData,
  }

  return (
    <div style={{ height: '300px' }} className={darkMode ? 'ag-theme-balham-dark' : 'ag-theme-balham'}>
      <AgGridReact
        columnDefs={state.columnDefs}
        rowData={state.rowData}
        onRowClicked={(e) => {
          onRowSelect(e.data as Option)
        }}
      ></AgGridReact>
    </div>
  )
}
