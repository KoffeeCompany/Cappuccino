import { createApi } from '@reduxjs/toolkit/query/react'
import { SupportedChainId } from 'constants/chains'
import { gql } from 'graphql-request'
import { graphqlRequestBaseQuery } from 'state/global/graph'

// List of supported subgraphs. Note that the app currently only support one active subgraph at a time
const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'http://localhost:8000/subgraphs/name/robusta/option',
  [SupportedChainId.RINKEBY]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.ARBITRUM_ONE]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.OPTIMISM]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.LOCALHOST]: 'http://localhost:8000/subgraphs/name/robusta/option',
}

export const api = createApi({
  reducerPath: 'optionApi',
  baseQuery: graphqlRequestBaseQuery(CHAIN_SUBGRAPH_URL),
  endpoints: (builder) => ({
    allOptionIntentions: builder.query({
      query: ({ optionType, skip = 0 }) => ({
        document: gql`
          query allOptionIntentions($optionType: OptionType!, $skip: Int!) {
            options(first: 1000, skip: $skip, where: { optionType: $optionType }, orderBy: id) {
              id
              status
              maker
              strike
              optionType
              maturity
              price
              amount0
              amount1
              token0
              token1
            }
          }
        `,
        variables: {
          optionType,
          skip,
        },
      }),
    }),
  }),
})
