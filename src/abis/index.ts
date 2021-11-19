import { Option__factory } from './types'
import { Signer } from 'ethers'

export default function GetOptionContract(address: string, signer: Signer) {
  return Option__factory.connect(address, signer)
}
