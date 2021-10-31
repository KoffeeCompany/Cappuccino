import { AutoColumn } from 'components/Column'
import OptionsGrid from 'components/OptionsGrid'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'

const PageWrapper = styled(AutoColumn)``

export default function Market() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <OptionsGrid></OptionsGrid>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
