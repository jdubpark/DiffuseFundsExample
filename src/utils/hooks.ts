import axios, { AxiosResponse } from 'axios'
import {
  useEffect, useMemo, useRef, useState,
} from 'react'
import {
  BigNumber, BigNumberish, Contract, ContractInterface, providers, utils,
} from 'ethers'

import {
  ABI, ADDRESS, TOKENS,
} from './constants'
import { Response1Inch } from './data'
import { getContract } from './helper'

type MaybeProvider = providers.JsonRpcProvider | undefined

interface UseERC20Addresses {
  wallet: string, // wallet address
  token: string, // token address
}

interface TokenBalance {
  bn: BigNumber | undefined,
  amount: string | undefined, // string to add float
}

export interface TokenBalances {
  [name: string]: TokenBalance,
  // SHI3LD: TokenBalance,
  // KOGE: TokenBalance,
  // PEAR: TokenBalance,
  // SING: TokenBalance,
}

export function useProvider(): MaybeProvider {
  const [provider, setProvider] = useState<providers.JsonRpcProvider | undefined>()

  useEffect(() => {
    setProvider(new providers.JsonRpcProvider('https://polygon-rpc.com/', 'matic'))
  }, [])

  return provider
}

export function useContract(address: string, abi: ContractInterface, provider: MaybeProvider): Contract | undefined {
  return useMemo(() => {
    if (!address || !abi || !provider) return undefined
    try {
      return getContract(address, abi, provider)
    } catch (error) {
      // console.error('Failed to get contract', error)
      return undefined
    }
  }, [address, abi, provider])
}

export function useERC20Contract(address: string, provider: MaybeProvider): Contract | undefined {
  return useContract(address, ABI.ERC20, provider)
}

export function useApeSwapContract(provider: MaybeProvider): Contract | undefined {
  return useContract(ADDRESS.APESWAP, ABI.UNISWAP, provider)
}

export function useCafeSwapContract(provider: MaybeProvider): Contract | undefined {
  return useContract(ADDRESS.CAFESWAP, ABI.UNISWAP, provider)
}

export function useQuickSwapContract(provider: MaybeProvider): Contract | undefined {
  return useContract(ADDRESS.QUICKSWAP, ABI.UNISWAP, provider)
}

export function useERC20Balance(address: UseERC20Addresses, provider: MaybeProvider): BigNumber | undefined {
  const contract: Contract | undefined = useERC20Contract(address.token, provider)
  const [balance, setBalance] = useState<BigNumber | undefined>()

  const balanceMemo: Promise<BigNumber | undefined> = useMemo<Promise<BigNumber | undefined>>(async () => {
    if (!contract?.balanceOf) return Promise.resolve(undefined)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return Promise.resolve(contract.balanceOf(address.wallet) as BigNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract])

  useEffect(() => {
    (async () => setBalance(await balanceMemo))()
    return () => {}
  }, [balanceMemo])

  return balance
}

function getNumericalBalance(balance: BigNumber | undefined, decimals = 18): string | undefined {
  return balance instanceof BigNumber ? utils.formatUnits(balance, decimals) : undefined
}

export function useERC20Balances(address: string, provider: MaybeProvider): TokenBalances {
  const wallet = address
  const balSHI3LD = useERC20Balance({ wallet, token: ADDRESS.SHI3LD }, provider)
  const balKOGE = useERC20Balance({ wallet, token: ADDRESS.KOGE }, provider)
  const balPEAR = useERC20Balance({ wallet, token: ADDRESS.PEAR }, provider)
  const balSING = useERC20Balance({ wallet, token: ADDRESS.SING }, provider)
  return {
    SHI3LD: { bn: balSHI3LD, amount: getNumericalBalance(balSHI3LD) },
    KOGE: { bn: balKOGE, amount: getNumericalBalance(balKOGE) },
    PEAR: { bn: balPEAR, amount: getNumericalBalance(balPEAR) },
    SING: { bn: balSING, amount: getNumericalBalance(balSING) },
  }
}

export function useQuoteFrom1inch(balance: BigNumber | undefined, addressFrom: string, addressTo = ADDRESS.DAI): string {
  const [quote, setQuote] = useState<string>('-1')

  const quoteMemo: Promise<Response1Inch | undefined> = useMemo<Promise<Response1Inch | undefined>>(async () => {
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
  }, [addressFrom, addressTo, balance])

  useEffect(() => {
    (async () => {
      try {
        const memo = await quoteMemo
        if (memo && memo?.type === 'success') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unnecessary-type-assertion
          const toAmount: string = utils.formatUnits(memo.toTokenAmount as BigNumberish, memo.toToken.decimals as number)
          setQuote(toAmount)
        } else {
          setQuote('-1')
        }
      } catch (err) {
        console.error(err)
        setQuote('-1')
      }
    })()
  }, [quoteMemo])

  return quote
}

export function useQuoteFromApeSwap(balance: BigNumber | undefined, provider: MaybeProvider, addressFrom: string, addressTo = ADDRESS.DAI): string {
  const contract = useApeSwapContract(provider)
  const [quote, setQuote] = useState<string>('-1')

  useEffect(() => {
    if (!contract || !balance) return; // need semi here (before async)
    (async () => {
      // ApeSwap: PATH MUST INCLUDE $WMATIC middleware to make transactions work
      // since many tokens lack DAI liquidity
      const path = [addressFrom, ADDRESS.WMATIC, addressTo]
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        const amountOut: BigNumber[] = await contract.getAmountsOut(balance.toBigInt(), path)
        if (amountOut.length) setQuote(utils.formatUnits(amountOut[amountOut.length - 1], 18))
      } catch (err) {
        console.error(err)
        setQuote('-1')
      }
    })()
  }, [addressFrom, addressTo, balance, contract])

  return quote
}

export function useQuoteFromCafeSwap(balance: BigNumber | undefined, provider: MaybeProvider, addressFrom: string, addressTo = ADDRESS.DAI): string {
  const contract = useCafeSwapContract(provider)
  const [quote, setQuote] = useState<string>('-1')

  useEffect(() => {
    if (!contract || !balance) return; // need semi here (before async)
    (async () => {
      // PATH MUST INCLUDE $USDC middleware to make transactions work
      // since many tokens lack DAI liquidity
      const path = [addressFrom, ADDRESS.USDC, addressTo]
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        const amountOut: BigNumber[] = await contract.getAmountsOut(balance.toBigInt(), path)
        if (amountOut.length) setQuote(utils.formatUnits(amountOut[amountOut.length - 1], 18))
      } catch (err) {
        console.error(err)
        setQuote('-1')
      }
    })()
  }, [addressFrom, addressTo, balance, contract])

  return quote
}

export function useQuoteFromQuickSwap(balance: BigNumber | undefined, provider: MaybeProvider, addressFrom: string, addressTo = ADDRESS.DAI): string {
  const contract = useQuickSwapContract(provider)
  const [quote, setQuote] = useState<string>('-1')

  useEffect(() => {
    if (!contract || !balance) return; // need semi here (before async)
    (async () => {
      // Small-cap coins must pass through $USDC as intermediary
      const path = [addressFrom, ADDRESS.USDC, addressTo]
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
        const amountOut: BigNumber[] = await contract.getAmountsOut(balance.toBigInt(), path)
        if (amountOut.length) setQuote(utils.formatUnits(amountOut[amountOut.length - 1], 18))
      } catch (err) {
        console.error(err)
        setQuote('-1')
      }
    })()
  }, [addressFrom, addressTo, balance, contract])

  return quote
}
