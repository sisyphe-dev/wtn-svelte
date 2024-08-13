# e2e Testing

Here is a brief overview of how to setup the testing environment before running the tests: 

We are using a mocking minting account that will act as the intermediary between Ledger minting accounts and the supply of tokens of the Internet Identity accounts created withing the tests. 

The minting account has the following addresses: 

- Account id: 90526bdfd692793cba1f96bde9079994ce4d40033746f04c12064ea599e2c274
- Principal: syna7-6ipnd-myx4g-ia46u-nxwok-u5nrr-yxgpi-iang7-lvru2-i7n23-tqe

You can run the following to supply ICP: 
dfx identity use icp-ident-RqOPnjj5ERjAEnwlvfKw
dfx ledger transfer --memo 0 --icp 1_000_000_000 90526bdfd692793cba1f96bde9079994ce4d40033746f04c12064ea599e2c274

Because WaterNeuron is the minting account of the nICP ledger, it is a bit trickier. 
You can run `npm run dev` then use the app and connect to an address. Look for its account id in the wallet then send ICP on it (running the command above for the corresponding address). After that, convert ICP into nICP and send the nICP to the principal of the minting account. 

You can run `npm run test`. 
