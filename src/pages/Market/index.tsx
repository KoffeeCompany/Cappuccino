/* eslint-disable prettier/prettier */
import { Trans } from '@lingui/macro'
import { useState, useCallback, useEffect } from 'react'
import { AutoColumn } from 'components/Column'
import OptionsGrid from 'components/OptionsGrid'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { TYPE } from 'theme'
import { Link } from 'react-router-dom'
import Row from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import {
  Wrapper,
  ResponsiveTwoColumns,
  ResponsiveTwoDetailColumns,
  PageWrapper,
  RightContainer,
  MediumOnly,
} from './styled'
import { AddRemoveTabs } from 'components/NavigationTabs'
import { Percent } from '@uniswap/sdk-core'
import OptionsDetail from 'components/OptionsDetail'
import { useActiveWeb3React } from 'hooks/web3'
import { Option, OptionUI } from 'types/option'
import { CHAIN_SUBGRAPH_URL, queryOption } from 'state/option/slice'
import { OptionType } from 'state/data/generated'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export default function Market() {
  // track and parse user input
  const [callValue, setTypedCallValue] = useState({})
  const [putValue, setTypedPutValue] = useState({})

  const onCallSelect = useCallback((callRow: OptionUI) => {
    setTypedCallValue(callRow.originalItem)
  }, [])

  const onPutSelect = useCallback((putRow: OptionUI) => {
    setTypedPutValue(putRow.originalItem)
  }, [])

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
              <TYPE.mediumHeader style={{ flexShrink: 0 }}>Call</TYPE.mediumHeader>
              <OptionsDetail option={callValue as Option} />
            </AutoColumn>
            <RightContainer gap="lg">
              <TYPE.mediumHeader style={{ flexShrink: 0 }}>Put</TYPE.mediumHeader>
              <OptionsDetail option={putValue as Option} />
            </RightContainer>
          </ResponsiveTwoColumns>
          <ResponsiveTwoDetailColumns wide={true} style={{ position: 'relative', height: '100%' }}>
            <AutoColumn gap="lg">
              <OptionsGrid onRowSelect={onCallSelect} optionType={OptionType.Call} />
            </AutoColumn>
            <RightContainer gap="lg">
              <OptionsGrid onRowSelect={onPutSelect}  optionType={OptionType.Put} />
            </RightContainer>
          </ResponsiveTwoDetailColumns>
        </Wrapper>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
