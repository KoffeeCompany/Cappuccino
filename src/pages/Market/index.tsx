import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import OptionsGrid from 'components/OptionsGrid'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components/macro'
import { ExternalLink, TYPE } from 'theme'
import { Link } from 'react-router-dom'
import Row, { RowBetween, RowFixed, AutoRow } from '../../components/Row'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonText, ButtonYellow } from '../../components/Button'
import {
  DynamicSection,
  CurrencyDropdown,
  StyledInput,
  Wrapper,
  ScrollablePage,
  ResponsiveTwoColumns,
  PageWrapper,
  StackedContainer,
  StackedItem,
  RightContainer,
  MediumOnly,
  HideMedium,
} from './styled'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { Currency, CurrencyAmount, Percent, Token, Price } from '@uniswap/sdk-core'
import OptionsDetail from 'components/OptionsDetail'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const Container = styled.div.attrs((props) => ({
  className: props.className,
}))

export default function Market() {
  const { account, chainId } = useActiveWeb3React()

  return (
    <>
      <PageWrapper>
        <AddRemoveTabs
          creating={false}
          adding={true}
          positionID={undefined}
          defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
          showBackLink={false}
        >
          <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
            <MediumOnly>
              <ButtonPrimary
                as={Link}
                to="/add/ETH"
                style={{ width: 'fit-content', borderRadius: '8px' }}
                padding="8px"
              >
                <Trans>Create Options</Trans>
              </ButtonPrimary>
            </MediumOnly>
          </Row>
        </AddRemoveTabs>

        <Wrapper>
          <ResponsiveTwoColumns wide={true} style={{ position: 'relative' }}>
            <AutoColumn gap="lg">
              <OptionsDetail />
              <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Call</TYPE.mediumHeader>
              <OptionsGrid />
            </AutoColumn>
            <RightContainer gap="lg">
              <OptionsDetail />
              <TYPE.mediumHeader style={{ margin: '0.5rem 0.5rem 0.5rem 0', flexShrink: 0 }}>Put</TYPE.mediumHeader>
              <OptionsGrid />
            </RightContainer>
          </ResponsiveTwoColumns>
        </Wrapper>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
