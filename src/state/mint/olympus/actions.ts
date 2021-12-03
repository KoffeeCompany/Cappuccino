import { createAction } from '@reduxjs/toolkit'

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

export const strikeValueInput = createAction<{ field: Field; typedValue: string }>('olympus/strikeValueInput')
export const liquidityValueInput = createAction<{ field: Field; typedValue: string }>('olympus/liquidityValueInput')
export const bcvValueInput = createAction<{ typedValue: string }>('olympus/bcvValueInput')
