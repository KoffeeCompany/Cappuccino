import { BottomRowContainer, FeatureCard, TopLeftContainer, TopRightContainer, TopRowContainer } from './featureCard'
import {
  BaseTokenLabel,
  DescWrapper,
  MainInfo,
  MainInfoTitle,
  NetworkContainer,
  PriceLabel,
  Tick,
  TickContainer,
  TickLabel,
  TicksContainer,
  TokenBaseQuoteTokensContainer,
} from './featureTokenPairCard'
import { NetworkContainer as IconContainer } from './multichainIcons'
import {
  ContentRow,
  FeatureCardsContainer,
  FeatureContainer,
  LeftFillContainer,
  MainContainer,
  PageContainer,
  RightFillContainer,
  Search,
  SearchBar,
  SearchBarContainer,
  SearchBarContent,
  SearchInputWrapper,
} from './styled'
import './featureTokenPairCard.css'
import { SearchInput } from 'components/SearchModal/styleds'

export default function Strategies() {
  return (
    <>
      <SearchBarContainer>
        <SearchBarContent>
          <SearchBar>
            <Search>
              <SearchInputWrapper>
                <SearchInput placeholder="Search pools or tokens"></SearchInput>
              </SearchInputWrapper>
            </Search>
          </SearchBar>
        </SearchBarContent>
      </SearchBarContainer>
      <PageContainer>
        <LeftFillContainer />
        <MainContainer>
          <ContentRow>
            <FeatureContainer>
              <FeatureCardsContainer>
                <FeatureCard>
                  <TopRowContainer>
                    <TopLeftContainer>
                      <TokenBaseQuoteTokensContainer>
                        <BaseTokenLabel>ETH</BaseTokenLabel>
                      </TokenBaseQuoteTokensContainer>
                      <PriceLabel>$4,649.39</PriceLabel>
                      <BaseTokenLabel className="subTitle">+4.45%</BaseTokenLabel>
                    </TopLeftContainer>
                    <TopRightContainer>
                      <NetworkContainer>
                        <IconContainer>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="20"
                            fill="none"
                            viewBox="0 0 12 20"
                          >
                            <path
                              fill="#fff"
                              fillRule="evenodd"
                              d="M5.955 14.53L0 11.013l5.955 8.393 5.959-8.393-5.96 3.517h.001zM6.045 0L.09 9.882l5.955 3.521L12 9.886 6.045 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </IconContainer>
                      </NetworkContainer>
                    </TopRightContainer>
                  </TopRowContainer>
                  <BottomRowContainer>
                    <DescWrapper>Generates yield by running an automated AAVE covered call strategy.</DescWrapper>
                    <MainInfoTitle>Current Projected Yield (APY)</MainInfoTitle>
                    <MainInfo>10.17%</MainInfo>
                    <TicksContainer>
                      <TickContainer>
                        <TickLabel>Current Deposits</TickLabel>
                        <Tick>3,946.31 AAVE</Tick>
                      </TickContainer>
                      <TickContainer>
                        <TickLabel>Max Capacity</TickLabel>
                        <Tick>15.5K AAVE</Tick>
                      </TickContainer>
                    </TicksContainer>
                  </BottomRowContainer>
                </FeatureCard>
              </FeatureCardsContainer>
            </FeatureContainer>
          </ContentRow>
        </MainContainer>
        <RightFillContainer />
      </PageContainer>
    </>
  )
}
