#![cfg_attr(not(feature = "std"), no_std)]
#![cfg_attr(not(feature = "std"), no_main)]

pub use achievement_badge::achievement_badge::AchievementBadgeRef;

/// Utility helpers available only when built with `std` (host-side tools).
#[cfg(feature = "std")]
pub mod extract;

/* -------------------------------------------------------------------------- */
/*                          E N T R Y  P O I N T S                            */
/* -------------------------------------------------------------------------- */

#[cfg(feature = "std")]
#[allow(dead_code)]
fn main() {}

#[cfg(not(feature = "std"))]
#[no_mangle]
pub extern "C" fn _start() -> ! {
    loop {}
}
