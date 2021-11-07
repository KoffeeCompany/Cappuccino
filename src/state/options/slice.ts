import { createApi } from '@reduxjs/toolkit/query/react'
import { ClientError, gql, GraphQLClient } from 'graphql-request'
import { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { DocumentNode } from 'graphql'
import { OptionType } from 'state/data/generated'

const ROBUSTA_SUBGRAPH_URL = 'http://localhost:8000/subgraphs/name/robusta/option'

export const api = createApi({
  reducerPath: 'optionApi',
  baseQuery: graphqlRequestBaseQuery(),
  endpoints: (builder) => ({
    allOptionIntentions: builder.query({
      query: ({ optionType = OptionType.Call, skip = 0 }) => ({
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

// Graphql query client wrapper
function graphqlRequestBaseQuery(): BaseQueryFn<
  { document: string | DocumentNode; variables?: any },
  unknown,
  Pick<ClientError, 'name' | 'message' | 'stack'>,
  Partial<Pick<ClientError, 'request' | 'response'>>
> {
  return async ({ document, variables }, {}: BaseQueryApi) => {
    try {
      const subgraphUrl = ROBUSTA_SUBGRAPH_URL

      return { data: await new GraphQLClient(subgraphUrl).request(document, variables), meta: {} }
    } catch (error) {
      if (error instanceof ClientError) {
        const { name, message, stack, request, response } = error
        return { error: { name, message, stack }, meta: { request, response } }
      }
      throw error
    }
  }
}
