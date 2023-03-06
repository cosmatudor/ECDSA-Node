import server from "./server";
import * as secp from '@noble/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';


function Wallet({ privateKey, setPrivateKey, address, setAddress, balance, setBalance }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(secp.getPublicKey(privateKey));
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Pivate Key for signing:
        <input placeholder="Put your private key" value={privateKey} onChange={onChange}></input>
      </label>
      <div>
        <label>Public Key:</label>
        Adress: ...{address.slice(-40)} <br />
        </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
