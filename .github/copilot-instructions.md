# Project Standards: Svelte 5 Monopoly (Web)

## Core Technical Stack
- **Frontend:** Svelte 5 (using Runes exclusively).
- **State Management:** Universal Reactivity via Svelte 5 classes/modules.
- **Backend:** Flask (Python) with Socket.io for real-time events.
- **Logic:** High-performance, decoupled from UI.



## Strict Coding Rules (Svelte 5)
- **NO SVELTE 4 SYNTAX:** Never use `writable`, `readable`, `derived` from 'svelte/store'. Never use `let` for reactivity unless it's a local non-reactive variable.
- **RUNES ONLY:** Use `$state`, `$derived`, `$props`, `$effect`, and `$inspect`.
- **CLASS-BASED LOGIC:** Logic for the game (Player, Board, Bank) must be in pure TypeScript/JavaScript classes using `$state` for properties. This ensures the logic is testable and separate from `.svelte` components.
- **PROPS DESTRUCTURING:** Use the new Svelte 5 destructuring for props: `let { prop1, prop2 } = $props();`.

## OOP & File Structure Rules
- **ENCAPSULATION:** Do not cram all logic into `.svelte` files. Use Javascript classes for business logic (e.g., `Player`, `Board`, `Property`, `GameEngine`).
- **SVELTE.TS FILES:** Complex logic classes must reside in `.svelte.ts` files to leverage universal reactivity.
- **SINGLE RESPONSIBILITY:** Each class should have one job. 
    - `Player.svelte.ts` handles player state and balance.
    - `Property.svelte.ts` handles rent logic and ownership.
    - `GameEngine.svelte.ts` orchestrates the flow and turns.
- **FACTORY PATTERN:** Use static methods or factory functions if creating complex objects (like the entire game board).
- **STATE IN CLASSES:** Use public `$state` fields for properties that need to be reactive and methods for actions that mutate that state.

## Quality Requirements (Anti-AI Slop Guardrails)
- **Robustness:** Always include error handling (e.g., checking if a player has enough balance before a transaction).
- **No Placeholders:** Do not write "implementation goes here" or "TODO". Write complete, production-ready logic.
- **Efficiency:** Use `$derived` for any state that can be computed from other states to prevent "syncing" bugs.
- **Naming:** Use clear, descriptive business terms (e.g., `calculateRent` instead of `handleCalc`).
- **Web Research:** If unsure about the latest Svelte 5 patterns (post-2024), simulate a search or use the most modern documentation patterns available in your knowledge base.

## Interaction Protocol
- **Step-by-Step:** Propose the architecture first, then implement one feature at a time.
- **Validation:** After each implementation, ask me if the logic aligns with my vision of Monopoly rules.
- **Refactoring:** If you see a way to make the code cleaner or more "Svelte-way", suggest it immediately.