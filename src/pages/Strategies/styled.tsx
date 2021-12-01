import styled from 'styled-components/macro'

export const PageContainer = styled.div<{ margin?: string; maxWidth?: string }>`
  display: flex;
  flex: 1 1 0%;
  flex-direction: row;
  min-height: 100%;
  overflow-y: auto;
  position: relative;
`

export const LeftFillContainer = styled.div`
  display: flex;
  flex: 1 1 0px;
  -webkit-box-flex: 1;
  padding-left: 24px;
`

export const RightFillContainer = styled.div`
  background: transparent;
  display: flex;
  flex: 1 1 0px;
  -webkit-box-flex: 1;
  padding-right: 24px;
`

export const MainContainer = styled.div`
  display: flex;
  flex: 1000 1 1200px;
  -webkit-box-flex: 1000;
  max-width: 1200px;
  position: relative;
`

export const ContentRow = styled.div`
  margin: auto;
`

export const FeatureContainer = styled.div`
  margin-bottom: 120px;
`

export const FeatureCardsContainer = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr);
  margin: 20px auto 40px;
`

export const SearchBarContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  position: fixed;
  top: 70px;
  -webkit-box-pack: justify;
  justify-content: space-between;
  z-index: 2;
`

export const SearchBarContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
  box-shadow: rgb(0 0 0 / 12%) 0px 1px 3px, rgb(0 0 0 / 24%) 0px 1px 2px;
  background-color: rgb(25, 27, 31);
`

export const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  justify-self: flex-end;
`
export const Search = styled.div`
  position: relative;
  z-index: 30;
  width: 100%;
`
export const SearchInputWrapper = styled.div`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: start;
  justify-content: flex-start;
  background-color: rgb(0, 0, 0);
  padding: 10px 16px;
  width: 500px;
  height: 38px;
  border-radius: 20px;
  z-index: 9999;
`
export const SearchInput = styled.input`
  position: relative;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  width: 100%;
  font-size: 16px;
  outline: none;
  color: rgb(255, 255, 255);
`
