import styled from 'styled-components/macro'

export const FeatureCard = styled.a`
  background-color: ${({ theme }) => theme.bg0};
  border-radius: 24px;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  height: 350px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  -webkit-user-drag: none;
  user-select: none;
  width: 100%;
  will-change: transform;
  transition: box-shadow 0.25s ease-out 0s, border 0.25s ease-out 0s;
  &:hover {
    cursor: pointer;
    box-shadow: rgb(39 174 96 / 40%) 8px 16px 80px;
    border: 2px solid rgb(39, 174, 96);
  }
`

export const TopRowContainer = styled.div`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  padding: 30px 18px 0px 20px;
  width: 100%;
`

export const BottomRowContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 1 1 0%;
  padding: 0px 18px 30px 20px;
`

export const TopLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100px;
`

export const TopRightContainer = styled.div`
  display: flex;
  padding-bottom: 15px;
  position: relative;
`
