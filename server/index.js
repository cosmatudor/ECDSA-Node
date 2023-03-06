const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "044387beb361ef30ea42068dd0877d0014ec0dec00587e9c6250d20887a7c45ac62928de9d326a6e9d7c1d8743c93180ac9cf41e37bb1b5cf2f895c9a5df948a21": 100,
  "048c336e8042ab76d96578b3e91e99e189f51c851071396c2b90e0fc638dce388f2a6fb8ed0886c65c83d06fef9d872327f1b43199237392c3aeff5078adb984f0": 50,
  "04f1bc2273dcf66bcfd2c23e1e8abdac0c7d3a752846def55c2053a4ef3bd780748b29dd406de03ac6246b299fb258c096a83c6498d4d7663f3abe40c237a1749c": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, msgStr, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const messageInBytes = utf8ToBytes(msgStr);
  const keccakHash = keccak256(messageInBytes);

  neededSignature = signature[0];
  recoveryByte = signature[1];

  // Now reconstructing the public Key in the server...
  const publicKeyRecovered = secp.recoverPublicKey(
    keccakHash,
    neededSignature,
    recoveryByte
  );

  // Verify
  const verification = secp.verify(
    formattedSignature,
    keccakHash,
    publicKeyRecovered
  );

  if (!verification) {
    res.status(400).send({ message: "Not verified!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender], message: "Transfer succesful" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
