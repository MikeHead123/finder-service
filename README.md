# finder-service

Simple express app for calculate the biggest ETH address balance changes<br />

Install and run locally<br />

Install:
```sh
npm install
```
Run:
```sh
node APIKEY=<YOUR_ETHERSCAN_APIKEY> src/index.js
```
Or build and run with docker<br />

Build:
```sh
docker build --tag node-test .
```
Run: 
```sh
docker run -p 3000:3000 -e APIKEY=<YOUR_ETHERSCAN_APIKEY> -d node-test
```
Endpoint:<br />
```sh
localhost:3000
```