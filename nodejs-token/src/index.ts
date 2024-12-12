
import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';

const app = express();
const port = 3000;


app.use(express.json());

type Address = string;

 let balances: { [address: Address]: number } = {};

let allowances: {
    [address: Address]: {
        [address: Address]: number;
    }
} = {};

// @ts-ignore
app.post('/create', (req: Request, res: Response) => {
    const { userId, initialBalance } = req.body;
    if (balances[userId]) {
        return res.status(400).send("Account already exists!");
    }

    balances[userId] = initialBalance;
    res.send(`Account for ${userId} created with balance: ${initialBalance}`);
});

// @ts-ignore
app.post('/transfer', (req: Request, res: Response) => {
    const { fromUserId, toUserId, amount } = req.body;
    if(!balances[fromUserId] || !balances[toUserId]) {
        return res.status(400).send("Account doesn't exist!");
    }
    if(balances[fromUserId] < amount) {
        return res.status(400).send("Insufficient funds!");
    }
    balances[fromUserId] -= amount;
    balances[toUserId] += amount;
    res.send(`Transferred ${amount} tokens form ${fromUserId} to ${toUserId}`);
});

//@ts-ignore
app.post('/approve', (req, res) => {
    const { ownerId, spenderId, amount } = req.body;
    if(!balances[ownerId]) {
        return res.status(400).send("Account doesn't exists!");
    }
    if(!allowances[ownerId]) {
        allowances[ownerId] = {};
    }

    allowances[ownerId][spenderId] = amount;
    res.send(`${ownerId} has approved ${spenderId} to spend ${amount} tokens on their behalf.`);
});

//@ts-ignore
app.post('/transferFrom', (req, res) => {
    const { fromUserId, toUserId, spenderId, amount } = req.body;
    if (!balances[fromUserId] || !balances[toUserId]) {
      return res.status(400).send("Account doesn't exist!");
    }
  
    const allowedAmount = allowances[fromUserId] && allowances[fromUserId][spenderId];
  
    if (!allowedAmount || allowedAmount < amount) {
      return res.status(400).send("Insufficient allowance!");
    }
    if (balances[fromUserId] < amount) {
      return res.status(400).send("Insufficient funds!");
    }
  
    balances[fromUserId] -= amount;
    balances[toUserId] += amount;
    allowances[fromUserId][spenderId] -= amount;
  
    res.send(`${spenderId} transferred ${amount} tokens from ${fromUserId} to ${toUserId}`);
  });
  

//@ts-ignore
app.get('/balance/:userId', (req, res) => {
    const balance = balances[req.params.userId];
    if (balance === undefined) {
      return res.status(404).send("Account not found!");
    }
    res.send(`Balance of ${req.params.userId}: ${balance}`);
  });

app.listen(port, () => {
    console.log(`Token simulator app listening on http://localhost:${port}`);
});