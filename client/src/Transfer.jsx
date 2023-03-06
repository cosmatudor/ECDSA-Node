import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import { toHex } from 'ethereum-cryptography/utils';
import * as secp from '@noble/secp256k1';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // We create a message here so we can sign it with out private key
    const msgStr = getMsg(sendAmount, recipient)
    const msgToBytes = utf8ToBytes(msgStr)
    
    // Now that we have the message, we can hash it
    const msgHash = keccak256(msgToBytes)

    // Finally, we sign the message
    let signature = await secp.sign(msgHash, privateKey, {recovered: true})
    console.log("signature=" + signature);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        msgStr,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  function getMsg(amount, recipient) {
    /***
     * Returns a JSON object that represent the message
     */
    return JSON.stringify({
      recipient: recipient,
      amount: amount,
    })
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
