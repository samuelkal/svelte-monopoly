<script>
	let { 
		engine, 
		runAction, 
		isInJail, 
		canBuyProperty, 
		hasMoneyForProperty, 
		property,
		canBuyCasino,
		hasMoneyForCasino,
		hasMoneyForJail,
		canUpgradeProperty,
		hasMoneyForUpgrade,
		pendingProperty,
		onTradeClick = () => {},
		skipUpgrade
	} = $props();
</script>

<section class="action-panel">
	<h3>Actions</h3>
	<div class="actions">
		{#if !engine.hasRolled || engine.canRollAgain}
			<button class="btn btn-roll" onclick={() => runAction(() => engine.rollDice())}>
				{isInJail ? 'Try Doubles' : engine.canRollAgain ? 'Roll Again' : 'Roll Dice'}
			</button>
		{/if}

		{#if engine.hasRolled || engine.canRollAgain}
			<button class="btn btn-end" onclick={() => runAction(() => engine.endTurn())}>
				End Turn
			</button>
		{/if}

		{#if canBuyProperty && (engine.hasRolled || engine.canRollAgain)}
			<button
				class="btn btn-buy"
				onclick={() => runAction(() => engine.buyProperty())}
				disabled={!hasMoneyForProperty}
			>
				Buy Property (${property?.price})
			</button>
		{/if}

		{#if canBuyCasino && (engine.hasRolled || engine.canRollAgain)}
			<button
				class="btn btn-casino"
				onclick={() => runAction(() => engine.buyCasino())}
				disabled={!hasMoneyForCasino}
			>
				Buy Casino ($500)
			</button>
		{/if}

		<button class="btn btn-trade" onclick={onTradeClick} type="button">
			🤝 Trade
		</button>

		{#if isInJail}
			<button
				class="btn btn-jail"
				onclick={() => runAction(() => engine.payJailFee())}
				disabled={!hasMoneyForJail}
			>
				Pay Jail Fee ($50)
			</button>
		{/if}

		{#if canUpgradeProperty}
			<div class="upgrade-section">
				<button
					class="btn btn-upgrade"
					onclick={() => {
						runAction(() => engine.buildHouse(engine.pendingUpgradePosition));
						skipUpgrade();
					}}
					disabled={!hasMoneyForUpgrade}
				>
					🏠 Upgrade (${pendingProperty?.houseCost})
				</button>
				<button
					class="btn btn-skip-upgrade"
					onclick={() => skipUpgrade()}
					type="button"
				>
					Skip
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	.action-panel h3 {
		color: var(--color-gold, #fbbf24);
		margin: 0 0 clamp(12px, 2vh, 16px) 0;
		font-size: clamp(0.95rem, 2vmin, 1.1rem);
		font-family: var(--font-display, system-ui);
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: clamp(8px, 1.5vh, 12px);
	}

	.btn {
		width: 100%;
		padding: clamp(10px, 2vh, 14px) clamp(12px, 2.5vw, 16px);
		font-size: clamp(0.85rem, 1.8vmin, 0.95rem);
		font-weight: 700;
		color: #fff;
		border: none;
		border-radius: clamp(8px, 1.5vmin, 12px);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.btn:hover:enabled {
		transform: translateY(-2px);
		box-shadow: 
			0 6px 18px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.btn:active:enabled {
		transform: translateY(0);
		box-shadow: 
			0 2px 6px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		filter: saturate(0.5);
	}

	.btn-roll {
		background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
	}

	.btn-end {
		background: linear-gradient(135deg, #166534 0%, #22c55e 100%);
	}

	.btn-buy {
		background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
	}

	.btn-casino {
		background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
	}

	.btn-trade {
		background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
		border: 1px solid rgba(251, 191, 36, 0.25);
	}

	.btn-jail {
		background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%);
	}

	.btn-upgrade {
		background: linear-gradient(135deg, #6b21a8 0%, #d946ef 100%);
	}

	.btn-skip-upgrade {
		background: linear-gradient(135deg, #374151 0%, #6b7280 100%);
		font-size: clamp(0.8rem, 1.6vmin, 0.9rem);
		padding: clamp(8px, 1.5vh, 12px) clamp(12px, 2.5vw, 16px);
	}

	.upgrade-section {
		display: flex;
		flex-direction: column;
		gap: clamp(6px, 1vh, 10px);
		padding: clamp(10px, 1.5vh, 14px);
		background: rgba(251, 191, 36, 0.08);
		border: 1px solid rgba(251, 191, 36, 0.2);
		border-radius: clamp(8px, 1.5vmin, 12px);
	}

	.upgrade-section .btn {
		margin: 0;
	}
</style>
