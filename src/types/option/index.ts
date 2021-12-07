import { OptionType } from 'constants/optiontype'
import { BigNumber } from 'ethers'
import { OptionStatus } from 'state/data/generated'

export interface Option {
  id: BigNumber
  status: OptionStatus
  maker: string
  resolver?: string
  buyer?: string
  strike?: BigNumber
  optionType?: OptionType
  notional?: BigNumber
  maturity?: BigNumber
  feeToken?: string
  price?: BigNumber
  maxFeeAmount?: BigNumber
  feeAmount?: BigNumber
  amount0?: BigNumber
  amount1?: BigNumber
  pool?: string
  token0?: string
  token1?: string
  poolFee?: BigNumber
  createdAt: BigNumber
  updatedAt: BigNumber
}

export interface OptionUI {
  id: BigNumber
  lp: string
  status: OptionStatus
  maker: string
  resolver?: string
  buyer?: string
  strike?: BigNumber
  optionType?: OptionType
  notional?: BigNumber
  maturity?: string
  feeToken?: string
  price?: BigNumber
  maxFeeAmount?: BigNumber
  feeAmount?: BigNumber
  amount0?: BigNumber
  amount1?: BigNumber
  pool?: string
  token0?: string
  token1?: string
  poolFee?: BigNumber
  createdAt: BigNumber
  updatedAt: BigNumber
  originalItem: Option
}
