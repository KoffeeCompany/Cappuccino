import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { Wrapper } from 'pages/Market/styled'
import { Table } from 'reactstrap'
import styled from 'styled-components/macro'

const Container = styled(Wrapper)`
  font-size: 13px;
  height: 600px;
`

const TableContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  overflow-x: auto;
`

export default function OptionsGrid() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <Container>
      <TableContainer>
        <Table hover>
          <thead>
            <tr>
              <th>LP</th>
              <th>
                <Trans>Low. tick</Trans>
              </th>
              <th>
                <Trans>Up. tick</Trans>
              </th>
              <th>
                <Trans>Pos. size</Trans>
              </th>
              <th>
                <Trans>Mat.</Trans>
              </th>
              <th>
                <Trans>K</Trans>
              </th>
              <th>
                <Trans>Cur. price</Trans>
              </th>
              <th>Tok. 0</th>
              <th>Tok. 1</th>
              <th>
                <Trans>Value</Trans>
              </th>
              <th>Delta</th>
              <th>Beta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">ETH/Dai</th>
              <td>1500</td>
              <td>2600</td>
              <td>1</td>
              <td>7D</td>
              <td>2300</td>
              <td>1990</td>
              <td>0.45</td>
              <td>947.06</td>
              <td>0.93</td>
              <td>0.4518</td>
              <td>1</td>
            </tr>
            <tr>
              <th scope="row">ETH/WBTC</th>
              <td>0.05</td>
              <td>0.1</td>
              <td>1</td>
              <td>10D</td>
              <td>0.07</td>
              <td>0.06</td>
              <td>0.6841</td>
              <td>0.0174</td>
              <td>0.9708</td>
              <td>0.6841</td>
              <td>0.545</td>
            </tr>
            <tr>
              <th scope="row">ETH/UNI</th>
              <td>50</td>
              <td>175</td>
              <td>1</td>
              <td>1M</td>
              <td>120</td>
              <td>105.5143</td>
              <td>0.33</td>
              <td>48.6256</td>
              <td>0.79</td>
              <td>0.33</td>
              <td>0.912</td>
            </tr>
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  )
}
