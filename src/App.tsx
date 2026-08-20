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
import { 
  Wallet, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw 
} from "lucide-react";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

export default function App() {
  const [account, setAccount] = useState<string>("" );
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const fetchBalance = async (publicKey: string) => {
    setIsRefreshing(true);
    try {
      const acc = await server.loadAccount(publicKey);
      const nativeBalance = acc.balances.find((b) => b.asset_type === "native");
      setBalance(nativeBalance ? nativeBalance.balance : "0");
    } catch {
      setBalance("0 (Unfunded Account)");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = async () => {
    setStatusMessage(null);
    try {
      const connected = await isConnected();
      if (!connected) {
        setStatusMessage({ text: "Freighter extension not detected. Please install it.", type: "error" });
        return;
      }
      const accessObj = await requestAccess();
      if (accessObj.error) {
        setStatusMessage({ text: accessObj.error, type: "error" });
        return;
      }
      const pubKey = accessObj.address;
      setAccount(pubKey);
      await fetchBalance(pubKey);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to connect wallet.", type: "error" });
    }
  };

  const handleDisconnect = () => {
    setAccount("");
    setBalance("0");
    setTxHash("");
    setStatusMessage(null);
  };

  const copyToClipboard = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ text: "Signing and submitting transaction...", type: "info" });
    setTxHash("");

    try {
      const sourceAccount = await server.loadAccount(account);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient.trim(),
            asset: Asset.native(),
            amount: amount.trim(),
          })
        )
        .setTimeout(30)
        .build();

      const signed = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      if (signed.error) throw new Error(signed.error);

      const txToSubmit = TransactionBuilder.fromXDR(
        signed.signedTxXdr,
        Networks.TESTNET
      );
      const result = await server.submitTransaction(txToSubmit);

      setStatusMessage({ text: "Payment Sent Successfully! Updating balance...", type: "success" });
      setTxHash(result.hash);
      setAmount("");
      setRecipient("");

      // Wait 2.5 seconds for the Stellar ledger to update before fetching new balance
      setTimeout(async () => {
        await fetchBalance(account);
      }, 2500);

    } catch (err: any) {
      setStatusMessage({ text: `Transaction Failed: ${err.message || "Unknown error"}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "480px",
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "16px",
      padding: "28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f0f6fc" }}>Stellar Pay</h1>
          <span style={{ fontSize: "12px", color: "#58a6ff", background: "#0c2d6b", padding: "2px 8px", borderRadius: "12px", fontWeight: "500" }}>
            Testnet
          </span>
        </div>
        {account && (
          <button 
            onClick={handleDisconnect} 
            title="Disconnect Wallet"
            style={{
              background: "#21262d",
              border: "1px solid #30363d",
              color: "#c9d1d9",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {!account ? (
        <div style={{ textAlign: "center", padding: "40px 10px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "#21262d",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            color: "#58a6ff"
          }}>
            <Wallet size={30} />
          </div>
          <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Connect your wallet</h2>
          <p style={{ fontSize: "14px", color: "#8b949e", marginBottom: "24px" }}>
            Connect with Freighter to send and receive Testnet XLM seamlessly.
          </p>
          <button
            onClick={handleConnect}
            style={{
              width: "100%",
              background: "#238636",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Connect Freighter
          </button>
        </div>
      ) : (
        <div>
          {/* Balance Card */}
          <div style={{
            background: "#21262d",
            border: "1px solid #30363d",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.5px" }}>Available Balance</span>
              <button 
                onClick={() => fetchBalance(account)} 
                style={{ background: "transparent", border: "none", color: "#8b949e", cursor: "pointer" }}
                title="Refresh Balance"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#f0f6fc", marginBottom: "12px" }}>
              {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 })}{" "}
              <span style={{ fontSize: "16px", color: "#58a6ff" }}>XLM</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#161b22",
              padding: "8px 12px",
              borderRadius: "6px"
            }}>
              <span style={{ fontSize: "12px", color: "#8b949e", fontFamily: "monospace" }}>
                {account.slice(0, 8)}...{account.slice(-8)}
              </span>
              <button
                onClick={copyToClipboard}
                style={{ background: "transparent", border: "none", color: copied ? "#3fb950" : "#8b949e", cursor: "pointer" }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSendPayment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", color: "#c9d1d9", display: "block", marginBottom: "6px" }}>Recipient Address</label>
              <input
                type="text"
                required
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  color: "#f0f6fc",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", color: "#c9d1d9" }}>Amount</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["1", "5", "10"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      style={{
                        background: "#21262d",
                        border: "1px solid #30363d",
                        color: "#8b949e",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  step="0.00001"
                  min="0.00001"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#0d1117",
                    border: "1px solid #30363d",
                    color: "#f0f6fc",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    paddingRight: "50px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <span style={{ position: "absolute", right: "12px", top: "10px", fontSize: "13px", color: "#8b949e" }}>XLM</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#238636",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px"
              }}
            >
              <Send size={16} />
              {loading ? "Processing..." : "Send Payment"}
            </button>
          </form>
        </div>
      )}

      {/* Status & Feedback */}
      {statusMessage && (
        <div style={{
          marginTop: "20px",
          padding: "12px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          background: statusMessage.type === "success" ? "rgba(46,160,67,0.15)" : statusMessage.type === "error" ? "rgba(248,81,73,0.15)" : "#21262d",
          border: `1px solid ${statusMessage.type === "success" ? "#3fb950" : statusMessage.type === "error" ? "#f85149" : "#30363d"}`,
          color: statusMessage.type === "success" ? "#3fb950" : statusMessage.type === "error" ? "#f85149" : "#c9d1d9"
        }}>
          {statusMessage.type === "success" && <CheckCircle2 size={16} />}
          {statusMessage.type === "error" && <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Explorer Link */}
      {txHash && (
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#58a6ff",
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            View on Stellar Expert <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
