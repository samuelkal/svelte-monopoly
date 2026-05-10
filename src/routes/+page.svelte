<script>
	import { MonopolyEngine } from '$lib/game/monopoly-engine.svelte.js';
	import Board from '$lib/ui/Board.svelte';
	import BigNotifications from '$lib/ui/BigNotifications.svelte';
	import GameLog from '$lib/ui/GameLog.svelte';
	import PlayerPanel from '$lib/ui/PlayerPanel.svelte';
	import ActionPanel from '$lib/ui/ActionPanel.svelte';
	import TradeModal from '$lib/ui/TradeModal.svelte';

	const engine = new MonopolyEngine();
	let showTradeModal = $state(false);
	const specialNoBuyTiles = [0, 10, 20, 30, 5, 12, 21, 29, 36, 3, 14, 23, 7, 26, 34];
// DEBUG: Zpřístupní engine v konzoli prohlížeče
if (typeof window !== 'undefined') {
    window.game = engine;
}
	// Derived state – OOP metody vrací data, komponenty je jen zobrazí
	const activePlayerId = $derived(engine.activePlayerId);
	const currentPlayer = $derived(engine.players[activePlayerId]);
	const currentPosition = $derived(currentPlayer?.position);
	const property = $derived(engine.properties[currentPosition]);
	const canBuyProperty = $derived(
		currentPosition !== undefined &&
			property &&
			property.owner === null &&
			!specialNoBuyTiles.includes(currentPosition)
	);
	const hasMoneyForProperty = $derived(property && currentPlayer && currentPlayer.money >= property.price);
	const canBuyCasino = $derived(currentPosition === 20 && engine.casinoOwner === null);
	const hasMoneyForCasino = $derived(currentPlayer && currentPlayer.money >= 500);
	const hasMoneyForJail = $derived(currentPlayer && currentPlayer.money >= 50);
	const isInJail = $derived(currentPlayer?.inJail);

	const pendingProperty = $derived(engine.pendingUpgradePosition !== null ? engine.properties[engine.pendingUpgradePosition] : null);
	const canUpgradeProperty = $derived(
		engine.pendingUpgradePosition !== null &&
			pendingProperty &&
			pendingProperty.color !== 'special' &&
			pendingProperty.color !== 'utility' &&
			pendingProperty.houses < 5 &&
			angine.hasMonopoly(activePlayerId, pendingProperty.color)
	);
	const hasMoneyForUpgrade = $derived(
		pendingProperty && 
		currentPlayer && 
		currentPlayer.money >= pendingProperty.houseCost
	);

	// Jednoduchá metoda pro spuštění akcí s error handlingem
	function runAction(action) {
		const result = action();
		if (!result.ok && result.error) {
			console.warn(result.error);
		}
	}

	function removeNotification(id) {
		runAction(() => engine.removeNotification(id));
	}

	function skipUpgrade() {
		engine.pendingUpgradePosition = null;
	}

	function openTradeModal() {
		showTradeModal = true;
	}

	function closeTradeModal() {
		showTradeModal = false;
	}
</script>

<div class="app-shell">
	<BigNotifications notifications={engine.bigNotifications} onRemoveNotification={removeNotification} />

	<!-- Left Sidebar: Game Log -->
	<aside class="sidebar sidebar-left">
		<GameLog messages={engine.messages} />
	</aside>

	<!-- Center: Board (dominates the center) -->
	<div class="board-container">
		<div class="board-wrap">
			<Board players={engine.players} properties={engine.properties} />
		</div>
	</div>

	<!-- Right Sidebar: Actions & Player Info -->
	<aside class="sidebar sidebar-right">
		<ActionPanel 
			{engine}
			{runAction}
			{isInJail}
			{canBuyProperty}
			{hasMoneyForProperty}
			{property}
			{canBuyCasino}
			{hasMoneyForCasino}
			{hasMoneyForJail}
			{canUpgradeProperty}
			{hasMoneyForUpgrade}
			pendingProperty={pendingProperty}
			onTradeClick={openTradeModal}
			{skipUpgrade}
		/>

		<PlayerPanel 
			players={engine.players}
			properties={engine.properties}
			{activePlayerId}
			casinoOwner={engine.casinoOwner}
			casinoLevel={engine.casinoLevel}
		/>
	</aside>

	<TradeModal
		engine={engine}
		activePlayerId={activePlayerId}
		open={showTradeModal}
		onClose={closeTradeModal}
	/>
</div>

<style>
	:root {
		--board-gap: clamp(8px, 1vmin, 24px);
		--sidebar-width: clamp(280px, 20vw, 360px);
		--color-gold: #fbbf24;
		--color-gold-dim: rgba(251, 191, 36, 0.4);
		--color-bg-dark: rgba(15, 23, 42, 0.95);
		--color-bg-panel: rgba(255, 255, 255, 0.04);
	}

	.app-shell {
		display: grid;
		grid-template-columns: 300px 1fr 350px;
		height: 100vh;
		min-height: 100vh;
		max-height: 100vh;
		background: 
			radial-gradient(circle at 20% 80%, rgba(5, 46, 22, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(15, 23, 42, 0.4) 0%, transparent 50%),
			linear-gradient(135deg, #020617 0%, #0f172a 100%);
		gap: 0;
		overflow: hidden;
	}

	/* Board dominuje – aspect-ratio zajišťuje čtverec, clamp zajišťuje max velikost */
	.board-container {
		display: grid;
		place-items: center;
		padding: clamp(4px, 0.5vmin, 10px);
		min-width: 0;
		min-height: 0;
		height: 100%;
	}

	.board-wrap {
		position: relative;
		width: 100%;
		height: 100%;
		max-height: calc(100vh - (2 * clamp(4px, 0.5vmin, 10px)));
		border-radius: clamp(12px, 2vmin, 24px);
		overflow: hidden;
		background: var(--color-bg-dark);
	}

	/* Sidebar: čistý, scroll-friendly, barevné akcenty minimální */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: clamp(16px, 2vh, 32px);
		padding: clamp(16px, 3vh, 32px) clamp(12px, 2vw, 24px);
		background: var(--color-bg-dark);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.sidebar-left {
		border-right: 1px solid var(--color-gold-dim);
	}

	.sidebar-right {
		border-left: 1px solid var(--color-gold-dim);
	}

	/* Responsive: on smaller screens, stack vertically */
	@media (max-width: 1200px) {
		.app-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
		}

		.sidebar-left {
			order: 1;
			border-right: none;
			border-bottom: 1px solid var(--color-gold-dim);
			max-height: 25vh;
			overflow-y: auto;
		}

		.board-container {
			order: 2;
		}

		.sidebar-right {
			order: 3;
			border-left: none;
			border-top: 1px solid var(--color-gold-dim);
			max-height: 25vh;
			overflow-y: auto;
		}

		.board-wrap {
			width: min(90vmin, 100%);
		}
	}

	@media (max-width: 640px) {
		.app-shell {
			grid-template-rows: auto auto;
		}

		.sidebar {
			max-height: none;
			padding: clamp(12px, 2vh, 20px);
		}
	}
</style>