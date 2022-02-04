# Minimalistic App for Diffuse Fund

By Jongwon Park

## Usage
First, install all necessary dependencies (in the root folder)
```shell
npm install
```

Then, run the web app on `localhost:3000`
```shell
npm start
```

## Description

For a given address with certain tokens, the app aggregates swap quotes from 1inch API and other DEX smart contracts and displays the best quote.

The app is written to be flexible, ie. it can add more tokens and APIs/DEXs with a few more lines of code.

Built in React.js on Polygon. The app doesn't use Redux as it's built to be minimalistic, but it uses hooks extensively.
