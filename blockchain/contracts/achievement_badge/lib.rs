#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract(env = ink::env::DefaultEnvironment)]
pub mod achievement_badge {
    use ink::env::hash::{HashOutput, Keccak256};
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use primitive_types::H160;
    use scale::{Decode, Encode};

    /// Error codes returned by the badge contract.
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Caller is not authorized to mint or administer badges.
        NotAuthorized,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    type AddressKey = [u8; 20];

    /// Soulbound achievement badges addressed by deterministic content hashes.
    #[ink(storage)]
    pub struct AchievementBadge {
        owner: AddressKey,
        badges: Mapping<AddressKey, Vec<Hash>>,
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

        fn ensure_can_mint(&self, caller: H160, to: H160) -> Result<()> {
            if caller == self.owner_as_h160() || caller == to {
                Ok(())
            } else {
                Err(Error::NotAuthorized)
            }
        }

        fn h160_to_key(value: H160) -> AddressKey {
            let mut out = [0u8; 20];
            out.copy_from_slice(value.as_bytes());
            out
        }

        fn owner_as_h160(&self) -> H160 {
            H160::from(self.owner)
        }

        #[ink(constructor, selector = 0xdeadbeef)]
        pub fn new(owner: Option<H160>) -> Self {
            let caller = Self::account_to_h160(&Self::env().caller());
            let owner = owner.unwrap_or(caller);
            Self {
                owner: Self::h160_to_key(owner),
                badges: Mapping::default(),
                total_badges: 0,
            }
        }

        #[ink(message, selector = 0x6a627842)]
        pub fn mint_badge(&mut self, to: H160, content_hash: Hash) -> Result<()> {
            let caller = Self::account_to_h160(&self.env().caller());
            self.ensure_can_mint(caller, to)?;

            let key = Self::h160_to_key(to);
            let mut owned = self.badges.get(&key).unwrap_or_default();
            owned.push(content_hash);
            self.badges.insert(&key, &owned);
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
            if caller != self.owner_as_h160() {
                return Err(Error::NotAuthorized);
            }
            let previous = self.owner;
            self.owner = Self::h160_to_key(new_owner);
            self.env().emit_event(OwnerChanged {
                previous: H160::from(previous),
                new_owner,
            });
            Ok(())
        }

        #[ink(message, selector = 0x16653eef)]
        pub fn get_badges(&self, of: H160) -> Vec<Hash> {
            let key = Self::h160_to_key(of);
            self.badges.get(&key).unwrap_or_default()
        }

        #[ink(message)]
        pub fn badge_count(&self, of: H160) -> u64 {
            let key = Self::h160_to_key(of);
            self.badges
                .get(&key)
                .map(|list: Vec<Hash>| list.len() as u64)
                .unwrap_or(0)
        }

        #[ink(message)]
        pub fn total_supply(&self) -> u64 {
            self.total_badges
        }

        #[ink(message)]
        pub fn owner(&self) -> H160 {
            self.owner_as_h160()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        type Accounts =
            ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment>;
        type AccountId =
            <ink::env::DefaultEnvironment as ink::env::Environment>::AccountId;

        fn default_accounts() -> Accounts {
            ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        fn set_caller(account: AccountId) {
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(account);
        }

        fn h160<T: Encode>(account: T) -> H160 {
            AchievementBadge::account_to_h160(&account)
        }

        #[ink::test]
        fn constructor_sets_owner() {
            let accounts = default_accounts();
            set_caller(accounts.alice);
            let contract = AchievementBadge::new(None);
            assert_eq!(contract.owner(), h160(accounts.alice));
        }

        #[ink::test]
        fn mint_by_owner_for_other() {
            let accounts = default_accounts();
            set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            let hash = Hash::from([1u8; 32]);
            assert!(contract.mint_badge(h160(accounts.bob), hash).is_ok());
            assert_eq!(contract.badge_count(h160(accounts.bob)), 1);
        }

        #[ink::test]
        fn mint_by_self_allowed() {
            let accounts = default_accounts();
            set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            set_caller(accounts.bob);
            let hash = Hash::from([2u8; 32]);
            assert!(contract.mint_badge(h160(accounts.bob), hash).is_ok());
        }

        #[ink::test]
        fn mint_by_stranger_blocked() {
            let accounts = default_accounts();
            set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            set_caller(accounts.charlie);
            let hash = Hash::from([3u8; 32]);
            assert_eq!(
                contract.mint_badge(h160(accounts.bob), hash),
                Err(Error::NotAuthorized)
            );
        }

        #[ink::test]
        fn owner_transfer_works() {
            let accounts = default_accounts();
            set_caller(accounts.alice);
            let mut contract = AchievementBadge::new(None);
            let new_owner = h160(accounts.bob);
            assert!(contract.update_owner(new_owner).is_ok());
            assert_eq!(contract.owner(), new_owner);
        }
    }
}
