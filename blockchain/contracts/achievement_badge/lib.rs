#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract(env = ink::env::DefaultEnvironment)]
pub mod achievement_badge {
    use ink::env::hash::{HashOutput, Keccak256};
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use primitive_types::H160;
    use scale::Encode;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotAuthorized,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct AchievementBadge {
        owner: H160,
        badges: Mapping<H160, Vec<Hash>>,
        total_badges: u64,
    }

    #[ink(event)]
    pub struct BadgeMinted {
        #[ink(topic)]
        to: H160,
        hash: Hash,
        index: u64,
    }

    #[ink(event)]
    pub struct OwnerChanged {
        #[ink(topic)]
        previous: H160,
        #[ink(topic)]
        new_owner: H160,
    }

    impl AchievementBadge {
        fn account_to_h160<T: Encode>(account: &T) -> H160 {
            let encoded = account.encode();
            if encoded.len() == 20 {
                return H160::from_slice(&encoded);
            }
            let mut result = <Keccak256 as HashOutput>::Type::default();
            ink::env::hash_encoded::<Keccak256, _>(account, &mut result);
            H160::from_slice(&result[12..])
        }

        #[ink(constructor, selector = 0xdeadbeef)]
        pub fn new(owner: Option<H160>) -> Self {
            let caller = Self::account_to_h160(&Self::env().caller());
            let owner = owner.unwrap_or(caller);
            Self {
                owner,
                badges: Mapping::default(),
                total_badges: 0,
            }
        }

        #[ink(message, selector = 0x6a627842)]
        pub fn mint_badge(&mut self, to: H160, content_hash: Hash) -> Result<()> {
            let caller = Self::account_to_h160(&self.env().caller());
            let is_self = caller == to;
            let is_owner = caller == self.owner;

            if !is_self && !is_owner {
                return Err(Error::NotAuthorized);
            }

            let mut owned = self.badges.get(&to).unwrap_or_default();
            owned.push(content_hash);
            self.badges.insert(&to, &owned);
            self.total_badges = self.total_badges.saturating_add(1);

            self.env().emit_event(BadgeMinted {
                to,
                hash: content_hash,
                index: self.total_badges,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn update_owner(&mut self, new_owner: H160) -> Result<()> {
            let caller = Self::account_to_h160(&self.env().caller());
            if caller != self.owner {
                return Err(Error::NotAuthorized);
            }
            let previous = core::mem::replace(&mut self.owner, new_owner);
            self.env().emit_event(OwnerChanged {
                previous,
                new_owner: self.owner,
            });
            Ok(())
        }

        #[ink(message, selector = 0x16653eef)]
        pub fn get_badges(&self, of: H160) -> Vec<Hash> {
            self.badges.get(&of).unwrap_or_default()
        }

        #[ink(message)]
        pub fn badge_count(&self, of: H160) -> u64 {
            self.badges
                .get(&of)
                .map(|list: Vec<Hash>| list.len() as u64)
                .unwrap_or(0)
        }

        #[ink(message)]
        pub fn total_supply(&self) -> u64 {
            self.total_badges
        }

        #[ink(message)]
        pub fn owner(&self) -> H160 {
            self.owner
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        fn default_accounts() -> ink::env::test::DefaultAccounts {
            ink::env::test::default_accounts()
        }

        fn h160<T: scale::Encode>(account: T) -> H160 {
            AchievementBadge::account_to_h160(&account)
        }

        #[ink::test]
        fn constructor_sets_owner() {
            let accounts = default_accounts();
            ink::env::test::set_caller(accounts.alice);
            let contract = AchievementBadge::new(None);
            assert_eq!(contract.owner(), h160(accounts.alice));
        }

        #[ink::test]
        fn mint_by_owner_for_other() {
            let accounts = default_accounts();
            ink::env::test::set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            ink::env::test::set_caller(accounts.alice);
            let hash = Hash::from([1u8; 32]);
            assert!(contract.mint_badge(h160(accounts.bob), hash).is_ok());
            assert_eq!(contract.badge_count(h160(accounts.bob)), 1);
        }

        #[ink::test]
        fn mint_by_self_allowed() {
            let accounts = default_accounts();
            ink::env::test::set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            ink::env::test::set_caller(accounts.bob);
            let hash = Hash::from([2u8; 32]);
            assert!(contract.mint_badge(h160(accounts.bob), hash).is_ok());
        }

        #[ink::test]
        fn mint_by_stranger_blocked() {
            let accounts = default_accounts();
            ink::env::test::set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            ink::env::test::set_caller(accounts.charlie);
            let hash = Hash::from([3u8; 32]);
            assert_eq!(
                contract.mint_badge(h160(accounts.bob), hash),
                Err(Error::NotAuthorized)
            );
        }

        #[ink::test]
        fn owner_transfer_works() {
            let accounts = default_accounts();
            ink::env::test::set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            ink::env::test::set_caller(accounts.alice);
            assert!(contract.update_owner(h160(accounts.bob)).is_ok());
            assert_eq!(contract.owner(), h160(accounts.bob));
        }
    }
}
