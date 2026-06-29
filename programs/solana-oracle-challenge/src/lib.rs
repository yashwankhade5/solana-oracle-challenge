use anchor_lang::prelude::*;

declare_id!("6m2huz7kNbr4A5cbu94oEsmhPv7Sw3go7NnWpaVwrGHJ");

#[program]
pub mod solana_oracle_challenge {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
