import React, { useEffect, useMemo, useState } from 'react'
import {
  providers,
} from 'ethers'

import './style/index.css'

import { ADDRESS } from './utils/constants'
import {
  TokenBalances,
  useERC20Balances,
  useProvider,
  useQuoteFrom1inch,
  useQuoteFromApeSwap,
  useQuoteFromCafeSwap,
  useQuoteFromQuickSwap,
} from './utils/hooks'

function displayQuote(quotes: Record<string, Record<string, string>>, token: string, swap: string, precision = 6): string {
  if (quotes[token][swap] !== '-1') return Number(quotes[token][swap]).toPrecision(precision)
  return '-'
}

function getBestQuote(token: string, quotes: Record<string, string>): [string, number] {
  let bestSwap = '-'
  let bestQuote = 0
  Object.keys(quotes).forEach((swap) => {
    const swapQuote = parseFloat(quotes[swap])
    if (swapQuote > bestQuote) {
      bestSwap = swap
      bestQuote = parseFloat(quotes[swap])
    }
  })
  return [bestSwap, bestQuote]
}

function App() {
  const provider: providers.JsonRpcProvider | undefined = useProvider()
  const balances: TokenBalances = useERC20Balances(ADDRESS.WALLET, provider)
  const [block, setBlock] = useState<number>(0)
  // console.log(balances)

  if (provider) {
    provider.on('block', (blockNumber: number) => {
      setBlock(blockNumber)
    })
  }

  const quotes: Record<string, Record<string, string>> = {
    SHI3LD: {
      '1inch': useQuoteFrom1inch(balances.SHI3LD.bn, ADDRESS.SHI3LD),
      apeSwap: useQuoteFromApeSwap(balances.SHI3LD.bn, provider, ADDRESS.SHI3LD),
      cafeSwap: useQuoteFromCafeSwap(balances.SHI3LD.bn, provider, ADDRESS.SHI3LD),
      quickSwap: useQuoteFromQuickSwap(balances.SHI3LD.bn, provider, ADDRESS.SHI3LD),
    },
    KOGE: {
      '1inch': useQuoteFrom1inch(balances.KOGE.bn, ADDRESS.KOGE),
      apeSwap: useQuoteFromApeSwap(balances.KOGE.bn, provider, ADDRESS.KOGE),
      cafeSwap: useQuoteFromCafeSwap(balances.KOGE.bn, provider, ADDRESS.KOGE),
      quickSwap: useQuoteFromQuickSwap(balances.KOGE.bn, provider, ADDRESS.KOGE),
    },
    PEAR: {
      '1inch': useQuoteFrom1inch(balances.PEAR.bn, ADDRESS.PEAR),
      apeSwap: useQuoteFromApeSwap(balances.PEAR.bn, provider, ADDRESS.PEAR),
      cafeSwap: useQuoteFromCafeSwap(balances.PEAR.bn, provider, ADDRESS.PEAR),
      quickSwap: useQuoteFromQuickSwap(balances.PEAR.bn, provider, ADDRESS.PEAR),
    },
    SING: {
      '1inch': useQuoteFrom1inch(balances.SING.bn, ADDRESS.SING),
      apeSwap: useQuoteFromApeSwap(balances.SING.bn, provider, ADDRESS.SING),
      cafeSwap: useQuoteFromCafeSwap(balances.SING.bn, provider, ADDRESS.SING),
      quickSwap: useQuoteFromQuickSwap(balances.SING.bn, provider, ADDRESS.SING),
    },
  }

  return (
    <div className="w-screen min-h-screen bg-slate-50">
      <div className="max-w-5xl m-auto py-16">
        <section className="py-4">
          <div className="text-2xl font-semibold">Minimalistic App for Diffuse Fund</div>
          <div className="text-slate-500 font-semibold">
            <span>Made by&nbsp;</span>
            <a className="text-orange-500 opacity-80 hover:opacity-100 hover:underline transition" href="https://parkjongwon.com?ref=diffuse" target="_blank" rel="noreferrer">Jongwon Park</a>
          </div>
          <div className="mt-2 text-slate-500">
            <div>{`Data is updated upon page refresh. Current block is: ${block}`}</div>
          </div>
        </section>
        <section className="py-4">
          <div className="text-cyan-500 text-lg font-semibold">Balances</div>
          <table className="table-auto mt-4 border-collapse border shadow-sm">
            <thead>
              <tr>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">Currency</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">Amount</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">Best Swap</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">Quote</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">Value (DAI)</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {
                balances && Object.keys(balances).map((token) => {
                  const [bestSwap, bestQuote] = getBestQuote(token, quotes[token])
                  return (
                    <tr key={token} className="hover:bg-slate-100">
                      <td className="py-3 px-4 border border-slate-200 text-slate-500">{token}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-500">{balances[token]?.amount}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-500">{bestSwap}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-500">{bestQuote.toPrecision(6)}</td>
                      <td className="py-3 px-4 border border-slate-200 text-slate-500">
                        {balances[token]?.amount ? (parseFloat(balances[token].amount as string) * bestQuote).toPrecision(6) : ''}
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </section>
        <section className="py-4">
          <div className="text-purple-500 text-lg font-semibold">Quotes</div>
          <table className="table-auto mt-4 border-collapse border shadow-sm">
            <thead>
              <tr>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">(Token)</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">1inch</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">ApeSwap</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">CafeSwap</th>
                <th className="py-3 px-4 border border-slate-200 text-slate-400 text-left font-medium">QuickSwap</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {
                balances && Object.keys(balances).map((token) => (
                  <tr key={token} className="hover:bg-slate-100">
                    <td className="py-3 px-4 border border-slate-200 text-slate-500">{token}</td>
                    <td className="py-3 px-4 border border-slate-200 text-slate-500">{displayQuote(quotes, token, '1inch')}</td>
                    <td className="py-3 px-4 border border-slate-200 text-slate-500">{displayQuote(quotes, token, 'apeSwap')}</td>
                    <td className="py-3 px-4 border border-slate-200 text-slate-500">{displayQuote(quotes, token, 'cafeSwap')}</td>
                    <td className="py-3 px-4 border border-slate-200 text-slate-500">{displayQuote(quotes, token, 'quickSwap')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

export default App
