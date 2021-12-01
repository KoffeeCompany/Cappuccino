import styled from 'styled-components/macro'

export const NetworkContainer = styled.div`
  -webkit-box-align: center;
  align-items: center;
  border: 2px solid ${({ theme }) => theme.text1};
  border-radius: 100%;
  display: flex;
  height: 26px;
  -webkit-box-pack: center;
  justify-content: center;
  min-height: 26px;
  min-width: 26px;
  width: 26px;
`
