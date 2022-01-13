import { useEffect, useRef, useState } from "react";

import Head from "next/head";
import { chainMap } from "../utils/chains";
import { ethers } from "ethers";
import { getContract } from "../utils/contracts";
import { hasEthereum } from "../utils/ethereum";
import { saveGame } from "../utils/api";

export default function Home() {
  const [greeting, setGreetingState] = useState("");
  const [newGreeting, setNewGreetingState] = useState("");
  const [newGreetingMessage, setNewGreetingMessageState] = useState("");
  const [connectedWalletAddress, setConnectedWalletAddressState] = useState("");
  const [contracts, setContracts] = useState();
  const newGreetingInputRef = useRef();
  // Provider is the Metamask Signer, account just stores the wallet address
  const [{ provider, account, chainId }, setWeb3] = useState({});

  // Listens for network changes to reload the page
  // Updates Contracts
  useEffect(() => {
    function newChain(_chainId) {
      setWeb3((prev) => ({
        ...prev,
        chainId: _chainId,
      }));
      setContracts({
        Greeter: getContract("Greeter", _chainId),
        SaveManager: getContract("SaveManager", _chainId),
      });
    }
    window.ethereum.on("chainChanged", newChain);
    return () => window.ethereum.removeListener("chainChanged", newChain);
  }, []);

  // Listens for a change in account and updates state
  useEffect(() => {
    function newAccount(accounts) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(accounts[0]);
      console.log("🚀 | newAccount | signer", signer);

      setWeb3((prev) => ({
        ...prev,
        provider: signer,
        account: signer._address,
      }));

      setConnectedWalletAddressState(`Connected wallet: ${signer._address}`);
    }

    window.ethereum.on("accountsChanged", newAccount);
    return () => window.ethereum.removeListener("accountsChanged", newAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If wallet is already connected...
  useEffect(() => {
    let _provider, _signer, _chainId;
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`);
      return;
    } else {
      _provider = new ethers.providers.Web3Provider(window.ethereum);
      _signer = _provider.getSigner();
      _chainId = _provider.provider.networkVersion;
    }
    async function setConnectedWalletAddress() {
      let signerAddress;
      try {
        signerAddress = await _signer.getAddress();
        setConnectedWalletAddressState(`Connected wallet: ${signerAddress}`);
      } catch {
        setConnectedWalletAddressState("No wallet connected");
        return;
      }

      setWeb3((prev) => ({
        ...prev,
        chainId: _chainId,
        provider: _signer,
        account: signerAddress,
      }));
    }
    setConnectedWalletAddress();
    setContracts({
      Greeter: getContract("Greeter", _chainId),
      SaveManager: getContract("SaveManager", _chainId),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request access to MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // Request nonce
  async function requestNonce() {
    await window.ethereum.request({ method: "eth_getTransactionCount" });
  }

  // Call smart contract, fetch current value
  async function fetchGreeting() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`);
      return;
    }
    try {
      const data = await contracts.Greeter.connect(provider).greet();
      console.log("🚀 | fetchGreeting | data", data);
      setGreetingState(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Call smart contract, set new value
  async function setGreeting() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`);
      return;
    }
    if (!newGreeting) {
      setNewGreetingMessageState("Add a new greeting first.");
      return;
    }

    const transaction = await contracts.Greeter.connect(provider).setGreeting(
      newGreeting
    );
    await transaction.wait();
    setNewGreetingMessageState(
      `Greeting updated to ${newGreeting} from ${greeting}.`
    );
    newGreetingInputRef.current.value = "";
    setNewGreetingState("");
  }

  // Call smart contract, set new value
  async function save() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`);
      return;
    }
    if (!newGreeting) {
      setNewGreetingMessageState("Add a new greeting first.");
      return;
    }

    // Call API
    let { ipfsHash, signature, nonce } = await saveGame(
      newGreeting,
      account,
      chainMap[chainId]
    );
    console.log(ipfsHash, signature, nonce);

    // Call Blockchain
    const transaction = await contracts.SaveManager.connect(provider).save(
      ipfsHash,
      signature,
      nonce
    );
    console.log("🚀 | save | transaction", transaction);
  }

  // Call smart contract, set new value
  async function load() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`);
      return;
    }

    console.log("🚀 | load | account", account);

    const ipfsHash = await contracts.SaveManager.connect(provider).load(
      account
    );
    console.log("🚀 | load | ipfsHash", ipfsHash);

    setGreetingState(ipfsHash);
  }

  return (
    <div className="max-w-lg mt-36 mx-auto text-center px-4">
      <Head>
        <title>IPFS Save Manager</title>
        <meta
          name="description"
          content="Interact with a simple smart contract from the client-side."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-8">
        {
          <>
            <h1 className="text-4xl font-semibold mb-8">IPFS Save Manager</h1>
            <div className="space-y-8">
              <div className="flex flex-col space-y-4">
                <input
                  className="border p-4 w-100 text-center"
                  placeholder="A fetched greeting will show here"
                  value={greeting}
                  disabled
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full"
                  onClick={load}
                >
                  Load IPFS Hash
                </button>
              </div>
              <div className="space-y-8">
                <div className="flex flex-col space-y-4">
                  <input
                    className="border p-4 text-center"
                    onChange={(e) => setNewGreetingState(e.target.value)}
                    placeholder="{'farm_level':10, 'experience':1000}"
                    ref={newGreetingInputRef}
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md"
                    onClick={save}
                  >
                    Save JSON to IPFS
                  </button>
                  <div className="h-2">
                    {newGreetingMessage && (
                      <span className="text-sm text-gray-500 italic">
                        {newGreetingMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-4">
                {connectedWalletAddress && (
                  <p className="text-md">{connectedWalletAddress}</p>
                )}
              </div>
            </div>
          </>
        }
      </main>

      <footer className="mt-20">
        <a
          href="https://github.com/tomhirst/solidity-nextjs-starter/blob/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700"
        >
          Read the docs
        </a>
      </footer>
    </div>
  );
}
