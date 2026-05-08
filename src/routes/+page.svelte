<script>
	import { MonopolyEngine } from '$lib/game/monopoly-engine.svelte.js';
	import Board from '$lib/ui/Board.svelte';
	import BigNotifications from '$lib/ui/BigNotifications.svelte';
	import GameLog from '$lib/ui/GameLog.svelte';
	import PlayerPanel from '$lib/ui/PlayerPanel.svelte';
	import ActionPanel from '$lib/ui/ActionPanel.svelte';

	const engine = new MonopolyEngine();
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
</script>

<div class="app-shell">
	<BigNotifications notifications={engine.bigNotifications} onRemoveNotification={removeNotification} />

	<!-- Board je dominantní element – zabere max plochu, je vždy čtvercový -->
	<div class="board-container">
		<div class="board-wrap">
			<Board players={engine.players} properties={engine.properties}>
				<GameLog messages={engine.messages} />
			</Board>
		</div>
	</div>

	<!-- Sidebar: minimalistický, flexibilní, fokus na data, ne na dekoraci -->
	<aside class="sidebar">
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
		grid-template-columns: 1fr var(--sidebar-width);
		min-height: 100vh;
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
		border-left: 1px solid var(--color-gold-dim);
		overflow-y: auto;
		overflow-x: hidden;
	}

	/* Responsive: na menších obrazovkách přepneme na column layout */
	@media (max-width: 1024px) {
		.app-shell {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.board-container {
			order: 2;
		}

		.sidebar {
			order: 1;
			border-left: none;
			border-bottom: 1px solid var(--color-gold-dim);
			max-height: 40vh;
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