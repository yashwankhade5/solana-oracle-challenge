use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::{Discriminator, InstructionData};
use solana_gpt_oracle::{ContextAccount, Identity};
use tuktuk_program::{
    compile_transaction,
    tuktuk::{
        cpi::{accounts::QueueTaskV0, queue_task_v0},
        program::Tuktuk,
        types::TriggerV0,
    },
    types::QueueTaskArgsV0,
    TransactionSourceV0,
};

pub mod instructions;
pub use instructions::*;

declare_id!("6m2huz7kNbr4A5cbu94oEsmhPv7Sw3go7NnWpaVwrGHJ");

#[program]
pub mod solana_oracle_challenge {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
       
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
