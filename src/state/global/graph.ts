import { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { DocumentNode } from 'graphql'
import { ClientError, GraphQLClient } from 'graphql-request'
import { AppState } from 'state'

// Graphql query client wrapper that builds a dynamic url based on chain id
export function graphqlRequestBaseQuery(
  chain_subgraph_url: Record<number, string>
): BaseQueryFn<
  { document: string | DocumentNode; variables?: any },
  unknown,
  Pick<ClientError, 'name' | 'message' | 'stack'>,
  Partial<Pick<ClientError, 'request' | 'response'>>
> {
  return async ({ document, variables }, { getState }: BaseQueryApi) => {
    try {
      const chainId = (getState() as AppState).application.chainId

      const subgraphUrl = chainId ? chain_subgraph_url[chainId] : undefined

      if (!subgraphUrl) {
        return {
          error: {
            name: 'UnsupportedChainId',
            message: `Subgraph queries against ChainId ${chainId} are not supported.`,
            stack: '',
          },
        }
      }

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
