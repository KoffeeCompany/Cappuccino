import { createApi } from '@reduxjs/toolkit/query/react'
import { SupportedChainId } from 'constants/chains'
import { gql } from 'graphql-request'
import { graphqlRequestBaseQuery } from 'state/global/graph'

// List of supported subgraphs. Note that the app currently only support one active subgraph at a time
const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [SupportedChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',

  [SupportedChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one',

  [SupportedChainId.OPTIMISM]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-optimism',

  [SupportedChainId.LOCALHOST]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  [SupportedChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/storres93/uniswap-v3-goerli',
}

export const api = createApi({
  reducerPath: 'dataApi',
  baseQuery: graphqlRequestBaseQuery(CHAIN_SUBGRAPH_URL),
  endpoints: (builder) => ({
    allV3Ticks: builder.query({
      query: ({ poolAddress, skip = 0 }) => ({
        document: gql`
          query allV3Ticks($poolAddress: String!, $skip: Int!) {
            ticks(first: 1000, skip: $skip, where: { poolAddress: $poolAddress }, orderBy: tickIdx) {
              tickIdx
              liquidityNet
              price0
              price1
            }
          }
        `,
        variables: {
          poolAddress,
          skip,
        },
      }),
    }),
    feeTierDistribution: builder.query({
      query: ({ token0, token1 }) => ({
        document: gql`
          query feeTierDistribution($token0: String!, $token1: String!) {
            _meta {
              block {
                number
              }
            }
            asToken0: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token0, token1: $token1 }
            ) {
              feeTier
              totalValueLockedToken0
              totalValueLockedToken1
            }
            asToken1: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token1, token1: $token0 }
            ) {
              feeTier
              totalValueLockedToken0
              totalValueLockedToken1
            }
          }
        `,
        variables: {
          token0,
          token1,
        },
      }),
    }),
  }),
})
