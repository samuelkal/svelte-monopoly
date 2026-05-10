<script>
	// Event Card Zone - Placeholder for two deck piles (Chance/Event cards)
</script>

<div class="event-card-zone">
	<div class="deck-pile">
		<div class="deck-label">Chance</div>
		<div class="deck-stack">
			{#each Array(3) as _, i}
				<div class="card-back" style:--offset={i}></div>
			{/each}
		</div>
	</div>

	<div class="divider"></div>

	<div class="deck-pile">
		<div class="deck-label">Events</div>
		<div class="deck-stack">
			{#each Array(3) as _, i}
				<div class="card-back" style:--offset={i}></div>
			{/each}
		</div>
	</div>
</div>

<style>
	.event-card-zone {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(32px, 8vw, 64px);
		pointer-events: auto;
	}

	.deck-pile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(12px, 2vh, 20px);
		pointer-events: auto;
	}

	.deck-label {
		font-size: clamp(0.95rem, 2vmin, 1.25rem);
		font-weight: 700;
		color: #fbbf24;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: var(--font-display, system-ui);
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.deck-stack {
		position: relative;
		width: clamp(60px, 10vmin, 100px);
		height: clamp(80px, 13vmin, 140px);
		perspective: 1000px;
	}

	.card-back {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
		border: 2px solid rgba(251, 191, 36, 0.6);
		border-radius: clamp(6px, 1vmin, 12px);
		box-shadow: 
			0 10px 30px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		transform: translateY(calc(var(--offset) * 4px)) rotateX(calc(var(--offset) * 2deg));
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.card-back:hover {
		transform: translateY(calc(var(--offset) * 4px - 8px)) rotateX(calc(var(--offset) * 2deg)) scale(1.02);
		box-shadow: 
			0 15px 40px rgba(251, 191, 36, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		border-color: rgba(251, 191, 36, 0.8);
	}

	.divider {
		width: 2px;
		height: clamp(120px, 20vmin, 200px);
		background: linear-gradient(180deg, transparent 0%, rgba(251, 191, 36, 0.4) 50%, transparent 100%);
		border-radius: 1px;
	}
</style>
