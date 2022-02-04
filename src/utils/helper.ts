import {
  constants, utils, Contract, ContractInterface,
} from 'ethers'
import { JsonRpcSigner, AlchemyProvider } from '@ethersproject/providers'

export function isAddress(value: string): string | false {
  try {
    return utils.getAddress(value)
  } catch {
    return false
  }
}

export function getSigner(library: AlchemyProvider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: AlchemyProvider, account?: string): AlchemyProvider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

export function getContract(address: string, ABI: ContractInterface, library: AlchemyProvider, account?: string): Contract {
  if (!isAddress(address) || address === constants.AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}
