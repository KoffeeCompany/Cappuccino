import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { BodyWrapper } from 'pages/AppBody'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'

export const ScrollablePage = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 480px;
    margin: 0 auto;
  `};
`

export const PageWrapper = styled(BodyWrapper)<{ wide: boolean }>`
  max-width: ${({ wide }) => (wide ? '880px' : '480px')};
  width: 100%;

  padding: ${({ wide }) => (wide ? '10px' : '0')};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 480px;
  `};
`

export const MediumOnly = styled.div`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

export const Wrapper = styled.div`
  position: relative;
  padding: 26px 16px;
  min-width: 480px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 400px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  min-width: 340px;
`};
`

export const CurrencyDropdown = styled(CurrencyInputPanel)`
  width: 48.5%;
`

export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
`

export const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)};
  }
`

export const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
`

export const ResponsiveText = styled(TYPE.label)`
  line-height: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    line-height: 12px;
  `};
`
export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`
