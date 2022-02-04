import axios, { AxiosResponse } from 'axios'
import { BigNumber } from 'ethers'

import { ADDRESS } from './constants'

export type Response1Inch = ResponseSuccess1Inch | ResponseFail1Inch

export interface ResponseSuccess1Inch {
  type: 'success',
  fromToken: {
    symbol: string,
    name: string,
    address: string,
    decimals: number,
    logoURI: string,
  },
  toToken: {
    symbol: string,
    name: string,
    address: string,
    decimals: number,
    logoURI: string,
  },
  toTokenAmount: string,
  fromTokenAmount: string,
  protocols: [
    {
      name: string,
      part: number,
      fromTokenAddress: string,
      toTokenAddress: string
    },
  ],
  estimatedGas: number,
}

export interface ResponseFail1Inch {
  type: 'fail',
  statusCode: number,
  error: string
  description: string,
  requestId: string,
  meta: [
    {
      type: string,
      value: string,
    },
  ],
}

export function getQuoteFrom1inch(balance: BigNumber | undefined, addressFrom: string, addressTo = ADDRESS.DAI): Promise<Response1Inch | undefined> {
  if (!balance) return Promise.resolve(undefined)

  // balances.SHI3LD.bn?
  const amount: string = balance?.toString() // already multiplied by 10^18
  const qs = `fromTokenAddress=${addressFrom}&toTokenAddress=${addressTo}&amount=${amount}`

  return axios.request<Response1Inch>({
    url: `https://api.1inch.io/v4.0/137/quote?${qs}`,
  })
    .then((res: AxiosResponse<Response1Inch>) => {
      const { data } = res // `response` is of type `AxiosResponse<Response1Inch>`
      if ('error' in data && data.error) data.type = 'fail'
      else data.type = 'success'
      return data // `data` is of type Response1Inch, correctly inferred
    })
}
