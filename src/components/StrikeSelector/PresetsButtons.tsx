import React from 'react'
import { ButtonOutlined } from 'components/Button'
import { AutoRow } from 'components/Row'
import { TYPE } from 'theme'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

const Button = styled(ButtonOutlined).attrs(() => ({
  padding: '8px',
  $borderRadius: '8px',
}))`
  color: ${({ theme }) => theme.text1};
  flex: 1;
`

export default function CoveredCall({ setCoveredCallRange }: { setCoveredCallRange: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setCoveredCallRange()}>
        <TYPE.body fontSize={12}>
          <Trans>Call</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function ProtectedPut({ setProtectedPutRange }: { setProtectedPutRange: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setProtectedPutRange()}>
        <TYPE.body fontSize={12}>
          <Trans>Put</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Strangle({ setStrangleRange }: { setStrangleRange: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setStrangleRange()}>
        <TYPE.body fontSize={12}>
          <Trans>Strangle</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Straddle({ setStraddleRange }: { setStraddleRange: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setStraddleRange()}>
        <TYPE.body fontSize={12}>
          <Trans>Straddle</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Maturity1D({ setMaturity1D }: { setMaturity1D: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setMaturity1D()}>
        <TYPE.body fontSize={12}>
          <Trans>24h</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Maturity7D({ setMaturity7D }: { setMaturity7D: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setMaturity7D()}>
        <TYPE.body fontSize={12}>
          <Trans>7D</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Maturity1M({ setMaturity1M }: { setMaturity1M: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setMaturity1M()}>
        <TYPE.body fontSize={12}>
          <Trans>1M</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}

export function Maturity3M({ setMaturity3M }: { setMaturity3M: () => void }) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={() => setMaturity3M()}>
        <TYPE.body fontSize={12}>
          <Trans>3M</Trans>
        </TYPE.body>
      </Button>
    </AutoRow>
  )
}
