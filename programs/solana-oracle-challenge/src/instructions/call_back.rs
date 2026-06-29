
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Callback<'info> {
    /// CHECK: Checked in oracle program
    pub identity: Account<'info, Identity>,
}

impl <'info> Callback<'info> {
        pub fn callback_from_agent(&mut self,response: String) -> Result<()> {
       
            return Err(ProgramError::InvalidAccountData.into());
        

        msg!("GPT Response: {:?}", response);
        Ok(())
    }

}