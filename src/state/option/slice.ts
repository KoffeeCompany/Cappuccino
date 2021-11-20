/* eslint-disable prettier/prettier */
import { createApi } from '@reduxjs/toolkit/query/react'
import { SupportedChainId } from 'constants/chains'
import request, { gql } from 'graphql-request'
import { OptionType } from 'state/data/generated'
import { graphqlRequestOptionQuery } from 'state/global/graph'
import {Option} from '../../types/option'

// List of supported subgraphs. Note that the app currently only support one active subgraph at a time
export const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'http://localhost:8000/subgraphs/name/robusta/option',
  [SupportedChainId.RINKEBY]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.ARBITRUM_ONE]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.OPTIMISM]: 'http://localhost:8000/subgraphs/name/robusta/option',

  [SupportedChainId.LOCALHOST]: 'http://localhost:8000/subgraphs/name/robusta/option',
  [SupportedChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/gauddel/robusta-goerli',
}

export const api = createApi({
  reducerPath: 'optionApi',
  baseQuery: graphqlRequestOptionQuery(CHAIN_SUBGRAPH_URL),
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

const query = gql`
  query allQuickOptionIntentions($optionType: OptionType!, $skip: Int!) {
    options(first: 1000, skip: $skip, where: { optionType: $optionType, status_not: bought }, orderBy: id) {
      id
      status
      buyer
      strike
      maker
      resolver
      optionType
      notional
      maturity
      feeToken
      price
      maxFeeAmount
      feeAmount
      amount0
      amount1
      pool
      token0
      token1
      poolFee
      createdAt
      updatedAt
    }
  }
`

export async function queryOption(url: string, optionType: OptionType) : Promise<Option[]> {
  return await request(url, query, {
    optionType: optionType,
    skip: 0,
  }).then(data => {
    return data?.options as Option[]
  })
}