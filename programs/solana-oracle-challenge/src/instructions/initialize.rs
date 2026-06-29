use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + 32,
        seeds = [b"agent"],
        bump
    )]
    pub agent: Account<'info, Agent>,

    /// CHECK: Checked in oracle program
    #[account(mut)]
    pub llm_context: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: initialized in cpi
    pub identity: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: initialized in cpi
    pub counter: UncheckedAccount<'info>,

    /// CHECK: Checked oracle id
    pub oracle_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
impl <'info> Initialize<'info> {
  const AGENT_DESC: &str = "you are jarvis from marvel iron man give repsonse in attitude or in way tony stark would do";
pub fn init(&mut self)->Result<()>{ 


self.agent.set_inner(Agent {
            context: self.llm_context.key(),
        });

     let cpi_accounts = solana_gpt_oracle::cpi::accounts::CreateLlmContext {
            payer: self.signer.to_account_info(),
            context_account: self.llm_context.to_account_info(),
            counter: self.counter.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.oracle_program.to_account_info(), cpi_accounts);
        solana_gpt_oracle::cpi::create_llm_context(cpi_ctx, AGENT_DESC.to_string())?;



Ok(())
    }
}