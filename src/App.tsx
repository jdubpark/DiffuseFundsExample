import React from 'react'

import { ethers } from 'ethers'

import './index.css'

import { ADDRESSES } from './constants'

function App() {
  const network = ethers.providers.getNetwork('matic')
  console.log(network)
  return (
    <div className="App">
      test
    </div>
  )
}

export default App
