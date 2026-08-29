Markdown
# Stellar Pay (Testnet) - White Belt Level 1

A modern decentralized payment application built on the Stellar Testnet using React, TypeScript, Vite, Freighter API, and the Stellar SDK.

## 🚀 Project Overview
Stellar Pay demonstrates fundamental interactions on the Stellar blockchain network. The application allows users to connect their Freighter wallet, retrieve real-time native XLM account balances using the Horizon API, and execute testnet payment transactions with instant hash confirmations and direct block explorer links.

## ✨ Features
- **App Security Gate:** Username and PIN authentication screen for protected access.
- **Freighter Wallet Integration:** Seamless connect and disconnect handling.
- **Real-Time Horizon Balance Sync:** Dynamic fetching of native XLM testnet balance with auto-refresh post-transaction.
- **Payment Processing:** Fast recipient addressing with quick amount preset buttons.
- **Transaction Feedback & Explorer:** Real-time state messages, transaction hash, and direct links to Stellar Expert Explorer.

## 🛠️ Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/adewolescott/stellar-white-belt.git](https://github.com/adewolescott/stellar-white-belt.git)
   cd stellar-white-belt
## Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Wallet Configuration:

Install the Freighter Wallet browser extension.

In Freighter Settings, set the active network to Testnet.

Fund your account via the Stellar Laboratory Friendbot.

## 📸 Submission Proofs
1. Wallet Connected State
Shows active connection to the Freighter wallet with truncated public key.
https://github.com/adewolescott/stellar-white-belt/blob/main/screenshots/01-wallet-connected.png

2. Balance Displayed
Shows live native XLM balance loaded from Stellar Horizon Testnet.

https://github.com/adewolescott/stellar-white-belt/blob/main/screenshots/02-balance-displayed.png

4. Successful Testnet Transaction
Shows recipient address, amount, and payment submission.
https://github.com/adewolescott/stellar-white-belt/blob/main/screenshots/03-transaction-in-progress.png

5. Transaction Result Shown to User
Shows payment success confirmation, transaction hash, and clickable Stellar Expert link.
https://github.com/adewolescott/stellar-white-belt/blob/main/screenshots/04-transaction-result.png
