import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components/macro'

export const MuiBox = styled(Box)`
  opacity: 1;
  transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`
export const MuiTypography = styled(Typography)`
  color: ${({ theme }) => theme.text2};
  font-weight: 400;
  margin: 10px;
`

export const MuiIcon = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 32px;
  font-weight: 400;
`
export const DynamicSection = styled(AutoColumn)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
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
export const MediumOnly = styled.div`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`
