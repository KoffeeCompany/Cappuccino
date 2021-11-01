import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import OptionsGrid from 'components/OptionsGrid'
import { AutoRow, RowBetween } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'
import { Link } from 'react-router-dom'
import { Box, Flex, Heading } from 'rebass'

const PageWrapper = styled(AutoColumn)`
  width: 98%;
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`
const WrapSmall = styled(RowBetween)`
  margin-bottom: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
  `};
`
const Flex100 = styled(Flex)`
  width: 100%;
`

const GridContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 13px;
`

const Container = styled.div.attrs((props) => ({
  className: props.className,
}))

export default function Market() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <TopSection gap="2px">
          <WrapSmall>
            <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>
              <Trans>Options</Trans>
            </TYPE.mediumHeader>
            <div></div>
            <AutoRow gap="6px" justify="flex-end">
              <ButtonPrimary
                as={Link}
                to="/create-option"
                style={{ width: 'fit-content', borderRadius: '8px' }}
                padding="8px"
              >
                <Trans>Create Options</Trans>
              </ButtonPrimary>
            </AutoRow>
          </WrapSmall>
          <GridContainer>
            <Flex100>
              <Box p={1} width={1 / 2}>
                <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Call</TYPE.mediumHeader>
                <OptionsGrid />
              </Box>
              <Box p={1} width={1 / 2}>
                <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Put</TYPE.mediumHeader>
                <OptionsGrid />
              </Box>
            </Flex100>
          </GridContainer>
        </TopSection>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
