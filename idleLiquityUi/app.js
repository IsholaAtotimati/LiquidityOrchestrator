let provider;
let signer;
let userAddress;

let tick = 50;
let yieldAmount = 0;
let eventStreamTimer = null;
let eventStreamEnabled = false;

const feed = document.getElementById("feed");
const tickEl = document.getElementById("tick");
const yieldEl = document.getElementById("yield");
const lpStatus = document.getElementById("lpStatus");
const streamToggleBtn = document.getElementById("streamToggle");

/* -------------------------
   EVENT STREAM UI
--------------------------*/
function addEvent(text) {
  const div = document.createElement("div");
  div.className = "event";
  div.innerText = "› " + text;
  feed.prepend(div);
}

function updateStreamToggleLabel() {
  if (!streamToggleBtn) return;

  streamToggleBtn.textContent = eventStreamEnabled
    ? "Pause live feed"
    : "Start live feed";
}

/* -------------------------
   WALLET CONNECT (REAL)
--------------------------*/
function setWalletButtonLabel(address) {
  const walletBtn = document.getElementById("walletBtn");
  if (!walletBtn) return;

  if (address) {
    walletBtn.innerText = address.slice(0, 6) + "..." + address.slice(-4);
    return;
  }

  walletBtn.innerText = "Connect Wallet";
}

function showWalletConnectionError(error) {
  console.error("Wallet connection failed:", error);

  setWalletButtonLabel(null);
  addEvent("Wallet connection failed. Please install or enable MetaMask and try again.");

  const message = error?.message || "Could not connect to MetaMask.";
  alert(message + " Please install or enable the MetaMask extension and try again.");
}

async function connectWallet() {
  if (location.protocol === "file:") {
    showWalletConnectionError(new Error("Open this app from a local web server such as http://127.0.0.1:8000/ instead of file://. Wallet providers require an HTTP origin."));
    return;
  }

  if (!window.ethereum) {
    showWalletConnectionError(new Error("MetaMask extension not found."));
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error("MetaMask did not return any accounts.");
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    setWalletButtonLabel(userAddress);
    addEvent("Wallet connected: " + userAddress);
    addEvent("Live feed is ready — press Start live feed when you want protocol updates.");
  } catch (error) {
    showWalletConnectionError(error);
  }
}

const walletBtn = document.getElementById("walletBtn");
if (walletBtn) {
  walletBtn.addEventListener("click", () => {
    connectWallet().catch((error) => {
      showWalletConnectionError(error);
    });
  });
}

/* -------------------------
   FAKE LIVE STREAM
--------------------------*/
function startEventStream() {
  if (eventStreamTimer) return;

  eventStreamEnabled = true;
  updateStreamToggleLabel();

  addEvent("Connecting to PoolManager stream...");
  setTimeout(() => {
    if (eventStreamEnabled) {
      addEvent("Event stream active");
    }
  }, 800);

  eventStreamTimer = setInterval(() => {
    const events = [
      "Swap executed",
      "Tick updated",
      "LiquidityIdle detected",
      "Rebalance triggered",
      "Yield index updated"
    ];

    const e = events[Math.floor(Math.random() * events.length)];
    addEvent(e);

    if (e.includes("LiquidityIdle")) {
      lpStatus.innerText = "IDLE";
    }

    if (e.includes("Tick")) {
      tick += Math.floor(Math.random() * 20 - 10);
      tickEl.innerText = tick;
    }

    if (e.includes("Yield")) {
      yieldAmount += 0.5;
      yieldEl.innerText = yieldAmount.toFixed(2) + " USDC";
    }
  }, 2500);
}

function stopEventStream() {
  if (!eventStreamTimer) return;

  clearInterval(eventStreamTimer);
  eventStreamTimer = null;
  eventStreamEnabled = false;
  updateStreamToggleLabel();
  addEvent("Live feed paused by user");
}

function toggleEventStream() {
  if (eventStreamEnabled) {
    stopEventStream();
    return;
  }

  startEventStream();
}

/* -------------------------
   DEMO ACTIONS
--------------------------*/
function addLiquidity() {
  lpStatus.innerText = "ACTIVE";
  addEvent("Liquidity added");
}

function simulateSwap() {
  tick = 250;
  tickEl.innerText = tick;

  addEvent("Swap detected");
  setTimeout(() => {
    lpStatus.innerText = "IDLE";
    addEvent("Liquidity became idle");
  }, 600);
}

function rebalance() {
  addEvent("Rebalance initiated");

  setTimeout(() => {
    addEvent("Depositing into Aave");
  }, 700);

  let i = setInterval(() => {
    yieldAmount += 0.6;
    yieldEl.innerText = yieldAmount.toFixed(2) + " USDC";

    if (yieldAmount > 6) {
      clearInterval(i);
      addEvent("Yield accruing from protocol");
    }
  }, 400);
}