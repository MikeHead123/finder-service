const axios = require('axios');
const web3 = require('web3');

class Finder {
    constructor () {
        this.blockIds = [];
        this.responseData = [];
        this.balances = new Map();
        this.apiKey = process.env.APIKEY || '';
    }

    async find() {
        const lastBlock = await this.getLastBlock();
        this.createArrayOfBlockIds(lastBlock);
        await this.startProccessingBlocks();
        await this.saveBalanceToMap();
        return this.findTheBiggestChangeAddressBalance();
    }

    async getLastBlock() {
       const response = await axios.get(
            `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`
        );
        return response.data.result;
    }

    createArrayOfBlockIds(id) {
        this.blockIds = [id];
        for (let i = 0; i < 99; i++) {
            this.blockIds.push('0x' + (parseInt(this.blockIds[i], 16) - 1).toString(16));
        }
    }

    createRequest (hash) {
        return axios.get(
            `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=${hash}&boolean=true&apikey=${this.apiKey}`
        );
    }

    async startProccessingBlocks() {
        const concurrentPromises = []; 
        for (let id of this.blockIds) {
            concurrentPromises.push(this.createRequest(id));
            if (concurrentPromises.length === 4) {
                    const responses = await Promise.all(concurrentPromises)
                    const data = responses.map(response => response.data.result)
                    this.responseData.push(...data)
                    concurrentPromises.length = 0;
            }
        }
    }

    saveBalanceToMap() {
        this.responseData.map((curr) => {
            curr.transactions.map((transaction) => {
                if (this.balances.has(transaction.to)) {
                    const curValue = this.balances.get(transaction.to);
                    const valueFromTransaction = web3.utils.toBN(transaction.value);
                    this.balances.set(transaction.to, curValue.add(valueFromTransaction));
                } else {
                    this.balances.set(transaction.to, web3.utils.toBN(transaction.value));
                }
                if (this.balances.has(transaction.from)) {
                    const curValue = this.balances.get(transaction.from);
                    const valueFromTransaction = web3.utils.toBN(transaction.value);
                    this.balances.set(transaction.from, curValue.sub(valueFromTransaction));
                } else {
                    this.balances.set(transaction.from, web3.utils.toBN(transaction.value));
                }
            })
        })
    }

    findTheBiggestChangeAddressBalance() {
        let theBiggestChange = 0;
        let address;
        this.balances.forEach((value, key) => {
            const balanceBN = web3.utils.toBN(value);
            const balanceNumber = web3.utils.fromWei(balanceBN);
            if (theBiggestChange < balanceNumber * -1) {
                theBiggestChange = balanceNumber * -1;
                address = key;
            }
        });
        console.log(`address ${address}`);
        console.log(`theBiggestChange ${theBiggestChange}`);
        return address;
    }
}

module.exports = new Finder();

