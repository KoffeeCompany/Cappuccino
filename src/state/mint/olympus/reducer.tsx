import { createReducer } from '@reduxjs/toolkit'
import { Field, resetMintState } from '../actions'
import { bcvValueInput, strikeValueInput } from './actions'

export interface MintState {
  readonly independentField: Field
  readonly bcvValue: string
  readonly strikeValue: string
}

export const initialState: MintState = {
  independentField: Field.CURRENCY_A,
  bcvValue: '',
  strikeValue: '',
}

export default createReducer<MintState>(initialState, (builder) =>
  builder
    .addCase(resetMintState, () => initialState)
    .addCase(bcvValueInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        bcvValue: typedValue,
      }
    })
    .addCase(strikeValueInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        strikeValue: typedValue,
      }
    })
)
