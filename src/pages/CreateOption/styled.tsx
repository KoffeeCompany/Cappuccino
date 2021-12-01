import styled from 'styled-components/macro'

export const ScrollablePage = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 480px;
    margin: 0 auto;
  `};
`
