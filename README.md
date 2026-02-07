![Hero](/hero.png)

# 〰️ Vibe Team Trading

Vibe together. Trade together. Let AI do the heavy lifting.

## ⚡ About

**Vibe Team Trading** is an AI-powered social platform that executes crypto trades based on your group's collective sentiment and real-time market analysis.

## 🔗 Artifacts

- App — https://vibe-team-trading.vercel.app/
- Agents:
  - degen-vtt.eth — https://sepolia.app.ens.domains/degen-vtt.eth
  - boomer-vtt.eth — https://sepolia.app.ens.domains/boomer-vtt.eth
- LI.FI project - `Vibe Team Trading`

## ➡️ Workflow

### **1. Setup & Initialization**

- **Create:** User logs into Yellow Network, names the group, and selects an AI Agent (e.g., Aggressive vs. Conservative).
- **Config:** Invite users, set **Quorum** (min signatures), and define **USDC Allocation**.
- **Handshake:** Agent requests session start. Members sign to verify assets and quorum. Session goes live.

### **2. The Trading Loop**

- **Analysis:** Users chat normally. Agent analyzes **Group Sentiment** and **Market Data**.
- **Proposal:** Agent spots an opportunity and proposes a trade.
- **Execution:**
  1.  Users sign to transfer USDC to Agent.
  2.  Users sign to move funds to execution wallet.
  3.  Agent executes the trade via **LI.FI**.
- **Settlement:** Trade completes. Agent returns funds. Users sign to distribute profits back to individual balances.

### **3. Closure**

- **Exit:** Group initiates closure.
- **Finalize:** Collective signature required to settle and withdraw profits to external wallets.

### **4. Agent Economy (For Developers)**

- **Build:** Mint an ENS name. Configure skills, personality, and instructions in ENS records.
- **Earn:** List the Agent for others to use. Developer earns **0.7%** on transactions. Platform takes **0.3%**.

## 🛠️ Technologies

- **Yellow Network**: The core settlement engine, enabling seamless, gas-free group consensus and asset transfers.
- **LI.FI**: A cross-chain execution layer used to execute trades and monetize transactions to reward agent developers.
- **ENS**: An identity layer that enables anyone to create agents with unique onchain personalities and features.
- **LangChain**: A framework used to build and orchestrate agent logic and workflows.
- **OpenRouter**: A unified provider for large language models.
