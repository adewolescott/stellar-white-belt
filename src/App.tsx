import React, { useState } from "react";
import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

export default function App() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const fetchBalance = async (publicKey: string) => {
    try {
      const acc = await server.loadAccount(publicKey);
      const nativeBalance = acc.balances.find((b) => b.asset_type === "native");
      setBalance(nativeBalance ? nativeBalance.balance : "0");
    } catch {
      setBalance("0 (Unfunded Account)");
    }
  };

  const handleConnect = async () => {
    setStatusMessage("");
    try {
      const connected = await isConnected();
      if (!connected) {
        alert("Please install Freighter extension!");
        return;
      }
      const accessObj = await requestAccess();
      if (accessObj.error) {
        setStatusMessage(`Connection Error: ${accessObj.error}`);
        return;
      }
      const pubKey = accessObj.address;
      setAccount(pubKey);
      await fetchBalance(pubKey);
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to connect wallet.");
    }
  };

  const handleDisconnect = () => {
    setAccount("");
    setBalance("0");
    setTxHash("");
    setStatusMessage("");
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("Building and signing transaction...");
    setTxHash("");

    try {
      const sourceAccount = await server.loadAccount(account);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      const signed = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) throw new Error(signed.error);

      setStatusMessage("Submitting to Stellar Testnet...");
      const txToSubmit = TransactionBuilder.fromXDR(
        signed.signedTxXdr,
        Networks.TESTNET
      );
      const result = await server.submitTransaction(txToSubmit);

      setStatusMessage("Payment Sent Successfully!");
      setTxHash(result.hash);
      setAmount("");
      setRecipient("");
      await fetchBalance(account);
    } catch (err: any) {
      setStatusMessage(`Transaction Failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", fontFamily: "sans-serif", padding: 20 }}>
      <h2>Stellar White Belt dApp</h2>

      {!account ? (
        <button onClick={handleConnect} style={{ padding: "10px 18px", cursor: "pointer" }}>
          Connect Freighter Wallet
        </button>
      ) : (
        <div>
          <div style={{ background: "#f3f4f6", padding: 15, borderRadius: 8, marginBottom: 20 }}>
            <p><strong>Connected:</strong> {account.slice(0, 6)}...{account.slice(-6)}</p>
            <p><strong>XLM Balance:</strong> {balance} XLM</p>
            <button onClick={handleDisconnect} style={{ padding: "6px 12px", cursor: "pointer" }}>
              Disconnect
            </button>
          </div>

          <form onSubmit={handleSendPayment}>
            <h3>Send Testnet XLM</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Recipient Address:</label>
              <input
                type="text"
                required
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Amount (XLM):</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ padding: "10px 18px", cursor: "pointer" }}>
              {loading ? "Processing..." : "Send XLM"}
            </button>
          </form>
        </div>
      )}

      {statusMessage && <p style={{ marginTop: 20, color: "#333" }}>{statusMessage}</p>}

      {txHash && (
        <p>
          <strong>View on Explorer:</strong>{" "}
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer">
            {txHash.slice(0, 12)}...
          </a>
        </p>
      )}
    </div>
  );
}
