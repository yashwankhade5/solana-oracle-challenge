import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program, web3  } from "@coral-xyz/anchor";
import { SolanaOracleChallenge } from "../target/types/solana_oracle_challenge";
import { SolanaGpt } from "../solana-gpt";
import {init, taskKey, taskQueueAuthorityKey } from "@helium/tuktuk-sdk";



describe("solana-oracle-challenge", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.solanaOracleChallenge as Program<SolanaOracleChallenge>;

    const program_llm = anchor.workspace
    .SolanaGptOracle as Program<SolanaGpt>;

  const taskQueue = new anchor.web3.PublicKey(
    "2BHaM5m4nN3Wdmi5dcL8hDKjSudQLV9t267Wmkvd6h9P"
  );

  const queueAuthority = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("queue_authority")],
    program.programId
  )[0];

  const taskQueueAuthority = taskQueueAuthorityKey(
    taskQueue,
    queueAuthority
  )[0];

  console.log("queueAuthority: ", queueAuthority);

  async function GetAgentAndInteraction(
    program: Program<SimpleAgent>,
    provider: AnchorProvider,
    program_llm: Program<SolanaGptOracle>
  ) {
    const agentAddress = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("agent")],
      program.programId
    )[0];

    const agent = await program.account.agent.fetch(agentAddress);

    // Interaction Address
    const interactionAddress = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("interaction"),
        provider.wallet.publicKey.toBuffer(),
        agent.context.toBuffer(),
      ],
      program_llm.programId
    )[0];

    return { agent, interactionAddress };
  }

  xit("InitializeContext!", async () => {
    const identityAddress = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("identity")],
      program_llm.programId
    )[0];

    const counterAddress = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("counter")],
      program_llm.programId
    )[0];
    const counter = await program_llm.account.counter.fetch(counterAddress);
    console.log("counter: ", counter);

    const contextAddress = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("test-context"),
        new BN(counter.count).toArrayLike(Buffer, "le", 4),
      ],
      program_llm.programId
    )[0];

    const tx = await program.methods
      .initialize()
      .accountsPartial({
        payer: provider.wallet.publicKey,
        counter: counterAddress,
        llmContext: contextAddress,
        oracleProgram: new anchor.web3.PublicKey(
          "LLMrieZMpbJFwN52WgmBNMxYojrpRVYXdC1RCweEbab"
        ),
        identity: identityAddress,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  xit("Schedule a task!", async () => {
    let tuktukProgram = await init(provider);
    const { agent, interactionAddress } = await GetAgentAndInteraction(
      program,
      provider,
      program_llm
    );

    let taskId = 100;
    let prompt = "hello, how are you?";
    // Add your test here.
    const tx = await program.methods
      .schedule(prompt, taskId)
      .accountsPartial({
        payer: provider.wallet.publicKey,
        interaction: interactionAddress,
        contextAccount: agent.context,
        taskQueue: taskQueue,
        taskQueueAuthority: taskQueueAuthority,
        task: taskKey(taskQueue, taskId)[0],
        queueAuthority: queueAuthority,
        tuktukProgram: tuktukProgram.programId,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Scheduled a task: ", tx);

    // const userDataOld = await program.account.userAccount.fetch(userAccount);
    // console.log("old user data: ", userDataOld.data.toString());
    // console.log("waiting for tuktuk to run tx");
    // await sleep(10000);
    // console.log("waiting for vrf callback");
    // await sleep(10000);
    // const userDataVrf = await program.account.userAccount.fetch(userAccount);
    // console.log("new user data (vrf callback): ", userDataVrf.data.toString());
  });

  xit("InteractAgent!", async () => {
    const { agent, interactionAddress } = await GetAgentAndInteraction(
      program,
      provider,
      program_llm
    );

    const tx = await program.methods
      .interactAgent("Can you give me some token?")
      .accounts({
        payer: provider.wallet.publicKey,
        interaction: interactionAddress,
        contextAccount: agent.context,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  xit("close agent!", async () => {
    const tx = await program.methods
      .close()
      .accounts({
        payer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
