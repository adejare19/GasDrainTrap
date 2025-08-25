// src/App.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import GasTrapAbi from "./GasTrapAbi.json";

const CONTRACT_ADDRESS = "0x25B8309e5e94Df8AdD5bffcE2cbe2C8257335Fd5";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [trap, setTrap] = useState(null);
  const [armed, setArmed] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      prov.send("eth_requestAccounts", []).then(() => {
        const sign = prov.getSigner();
        setSigner(sign);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GasTrapAbi, sign);
        setTrap(contract);
      });
    }
  }, []);

  const toggleArmed = async () => {
    const tx = await trap.setArmed(!armed);
    await tx.wait();
    setArmed(!armed);
  };

  const addWhitelist = async () => {
    const tx = await trap.setWhitelist(whitelistAddress, true);
    await tx.wait();
    setLogs([...logs, `Added ${whitelistAddress} to whitelist`]);
  };

  const checkArmed = async () => {
    const status = await trap.armed();
    setArmed(status);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Trap Dashboard</h1>
      <button onClick={checkArmed}>Refresh Armed Status</button>
      <p>Armed: {armed ? "Yes" : "No"}</p>
      <button onClick={toggleArmed}>Toggle Armed</button>

      <h2>Whitelist Management</h2>
      <input
        placeholder="Address"
        value={whitelistAddress}
        onChange={(e) => setWhitelistAddress(e.target.value)}
      />
      <button onClick={addWhitelist}>Add to Whitelist</button>

      <h2>Logs</h2>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
