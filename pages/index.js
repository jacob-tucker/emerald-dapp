import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/Nav.jsx';
import { useState, useEffect } from 'react';
import * as fcl from "@onflow/fcl";

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [newGreeting, setNewGreeting] = useState('');
  const [txStatus, setTxStatus] = useState("Run Transaction");

  async function runTransaction() {
    // fcl.mutate is for transactions
    const transactionId = await fcl.mutate({
      cadence: `
      import HelloWorld from 0xc940482edf7c1e5d

      transaction(ourNewGreeting: String) {

        prepare(signer: AuthAccount) {

        }

        execute {
          HelloWorld.changeGreeting(newGreeting: ourNewGreeting)
        }
      }
      `,
      args: (arg, t) => [
        arg(newGreeting, t.String)
      ],
      proposer: fcl.authz, // PROPOSER GOES HERE
      payer: fcl.authz, // PAYER GOES HERE
      authorizations: [fcl.authz], // AUTHORIZATIONS GO HERE
      limit: 999 // GAS LIMIT GOES HERE
    })

    console.log(transactionId);
    // Waiting for the transaction to be "sealed" before going on to the next line
    // "Sealed" means the transaction has completely finished. Note: this does not 
    // mean it was successful.
    // await fcl.tx(transactionId).onceSealed();
    // executeScript();

    fcl.tx(transactionId).subscribe(res => {
      console.log(res);
      if (res.status === 0 || res.status === 1) {
        setTxStatus('Pending...');
      } else if (res.status === 2) {
        setTxStatus('Finalized...')
      } else if (res.status === 3) {
        setTxStatus('Executed...');
      } else if (res.status === 4) {
        setTxStatus('Sealed!');
        if (res.statusCode === 0) {
          console.log('Success!')
        }
      }
    })
  }

  async function executeScript() {
    // fcl.query is for scripts
    const response = await fcl.query({
      cadence: `
      import HelloWorld from 0xc940482edf7c1e5d // THIS WAS MY ADDRESS, USE YOURS
  
      pub fun main(): String {
          return HelloWorld.greeting
      }
      `,
      args: (arg, t) => []
    })

    setGreeting(response);
  }

  useEffect(() => {
    executeScript()
  }, [])

  return (
    <div>
      <Head>
        <title>Emerald DApp</title>
        <meta name="description" content="Created by Emerald Academy" />
        <link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
      </Head>

      <Nav />

      <div className={styles.welcome}>
        <h1 className={styles.title}>
          Welcome to my <a href="https://academy.ecdao.org" target="_blank">Emerald DApp!</a>
        </h1>
        <p>This is a DApp created by Jacob Tucker (<i>tsnakejake#8364</i>).</p>
      </div>

      <main className={styles.main}>
        <p>{greeting}</p>
        <div className={styles.flex}>
          <input onChange={(e) => setNewGreeting(e.target.value)} placeholder="Hello, Idiots!" />
          <button onClick={runTransaction}>{txStatus}</button>
        </div>
      </main>
    </div>
  )
}