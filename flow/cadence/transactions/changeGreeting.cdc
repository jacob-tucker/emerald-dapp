import HelloWorld from "../contracts/HelloWorld.cdc"

transaction(ourNewGreeting: String) {

  prepare(signer: AuthAccount) {

  }

  execute {
    HelloWorld.changeGreeting(newGreeting: ourNewGreeting)
  }
}
