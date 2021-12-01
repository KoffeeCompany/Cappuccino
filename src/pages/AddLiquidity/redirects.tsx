import { useActiveWeb3React } from 'hooks/web3'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { WETH9_EXTENDED } from '../../constants/tokens'
import AddLiquidity from './index'

// currencyId could be a currency symbol or currency address
export function RedirectDuplicateTokenIds(
  props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string; feeAmount?: string; maturity?: string }>
) {
  const {
    match: {
      params: { currencyIdA, currencyIdB },
    },
  } = props

  const { chainId } = useActiveWeb3React()

  // prevent weth + eth
  const isETHOrWETHA =
    currencyIdA === 'ETH' || (chainId !== undefined && currencyIdA === WETH9_EXTENDED[chainId]?.address)
  const isETHOrWETHB =
    currencyIdB === 'ETH' || (chainId !== undefined && currencyIdB === WETH9_EXTENDED[chainId]?.address)

  if (
    currencyIdA &&
    currencyIdB &&
    (currencyIdA.toLowerCase() === currencyIdB.toLowerCase() || (isETHOrWETHA && isETHOrWETHB))
  ) {
    return <Redirect to={`/create/${currencyIdA}`} />
  }
  return <AddLiquidity {...props} />
}
