<script>
	let { players, properties, activePlayerId, casinoOwner, casinoLevel } = $props();
	let expandedPlayer = $state(null);
	
	function getPropertyColor(prop) {
		const colorMap = {
			red: '#dc2626',
			yellow: '#eab308',
			blue: '#2563eb',
			green: '#16a34a',
			black: '#1f2937',
			brown: '#92400e',
			darkbrown: '#78350f',
			darkred: '#be123c',
			utility: '#6366f1',
			special: '#8b5cf6'
		};
		return colorMap[prop.color] || '#64748b';
	}

	function hasMonopoly(playerId, color) {
		const colorProperties = Object.entries(properties)
			.filter(([, prop]) => prop.color === color)
			.map(([pos]) => Number.parseInt(pos, 10));

		if (colorProperties.length === 0) {
			return false;
		}

		const owned = new Set(players[playerId]?.properties ?? []);
		return colorProperties.every((pos) => owned.has(pos));
	}
</script>

<section class="player-panel">
	<h3>Players</h3>
	{#each Object.entries(players) as [id, player] (id)}
		<div class="player-card" class:active={id === activePlayerId}>
			<button
				class="player-header"
				onclick={() => (expandedPlayer = expandedPlayer === id ? null : id)}
				type="button"
			>
				<div class="player-token" data-player={id}>P{id}</div>
				<div class="player-info">
					<div class="money">${player.money}</div>
					<div class="meta">Pos: {player.position}</div>
				</div>
				{#if player.properties && player.properties.length > 0}
					<div class="expand-icon" class:expanded={expandedPlayer === id}>▼</div>
				{/if}
			</button>
			
			{#if player.inJail}
				<div class="jail">In Jail ({player.jailTurns}/3)</div>
			{/if}
			
			{#if expandedPlayer === id && player.properties && player.properties.length > 0}
				<div class="properties-list">
					{#each player.properties as position (position)}
						{@const prop = properties[position]}
						{@const isMonopoly = hasMonopoly(id, prop.color)}
						<div class="property-card" class:monopoly={isMonopoly} style:--prop-color={getPropertyColor(prop)}>
							<div class="prop-content">
								<div class="prop-header">
									<div class="prop-name">{prop.name}</div>
									{#if isMonopoly}
										<div class="monopoly-badge">👑 MONOPOLY</div>
									{/if}
								</div>
								<div class="prop-price">Price: ${prop.price}</div>
								<div class="prop-rent">Rent: ${prop.rent}{isMonopoly ? ' (2x)' : ''}</div>
								{#if prop.houses > 0}
									<div class="prop-houses">🏠 {prop.houses}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	{#if casinoOwner !== null}
		<div class="casino-info">
			<div class="casino-title">🎰 Casino</div>
			<div>Owner: Player {casinoOwner}</div>
			<div>Level: {casinoLevel}</div>
		</div>
	{/if}
</section>

<style>
	.player-panel h3 {
		color: var(--color-gold, #fbbf24);
		margin: 0 0 clamp(12px, 2vh, 16px) 0;
		font-size: clamp(0.95rem, 2vmin, 1.1rem);
		font-family: var(--font-display, system-ui);
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.player-card {
		padding: clamp(10px, 2vh, 14px);
		margin-bottom: clamp(8px, 1.5vh, 12px);
		background: var(--color-bg-panel, rgba(255, 255, 255, 0.04));
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: clamp(8px, 1.5vmin, 12px);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.player-card:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.player-card.active {
		background: rgba(251, 191, 36, 0.12);
		border-color: #fbbf24;
		box-shadow: 
			0 0 0 1px rgba(251, 191, 36, 0.3),
			0 4px 16px rgba(251, 191, 36, 0.15);
	}

	.player-header {
		display: flex;
		align-items: center;
		gap: clamp(8px, 1.5vw, 12px);
		margin-bottom: clamp(6px, 1vh, 8px);
		background: none;
		border: none;
		width: 100%;
		cursor: pointer;
		padding: 0;
		text-align: left;
		color: inherit;
		font: inherit;
		transition: opacity 0.2s ease;
	}

	.player-header:hover {
		opacity: 0.8;
	}

	.player-token {
		width: clamp(36px, 6vmin, 44px);
		aspect-ratio: 1;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-weight: 700;
		font-size: clamp(0.85rem, 1.8vmin, 0.95rem);
		color: #fff;
		box-shadow: 
			0 2px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.player-token[data-player="0"] {
		background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
	}

	.player-token[data-player="1"] {
		background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
	}

	.player-token[data-player="2"] {
		background: linear-gradient(135deg, #15803d 0%, #22c55e 100%);
	}

	.player-info {
		flex: 1;
		min-width: 0;
	}

	.money {
		color: #fff;
		font-weight: 700;
		font-size: clamp(1rem, 2.2vmin, 1.15rem);
		line-height: 1.2;
	}

	.meta {
		color: #d4d4d4;
		font-size: clamp(0.75rem, 1.6vmin, 0.85rem);
	}

	.owns {
		font-size: clamp(0.75rem, 1.6vmin, 0.85rem);
		color: #fcd34d;
		margin-top: clamp(4px, 0.8vh, 6px);
	}

	.jail {
		font-size: clamp(0.75rem, 1.6vmin, 0.85rem);
		color: #fca5a5;
		margin-top: clamp(4px, 0.8vh, 6px);
		padding: clamp(3px, 0.6vh, 5px) clamp(6px, 1.2vw, 8px);
		background: rgba(153, 27, 27, 0.25);
		border-radius: 4px;
		display: inline-block;
	}

	.casino-info {
		padding: clamp(12px, 2vh, 16px);
		margin-top: clamp(12px, 2vh, 18px);
		background: linear-gradient(135deg, rgba(146, 64, 14, 0.2) 0%, rgba(120, 53, 15, 0.1) 100%);
		border: 1.5px solid rgba(251, 191, 36, 0.4);
		border-radius: clamp(8px, 1.5vmin, 12px);
		color: #fef3c7;
		font-size: clamp(0.8rem, 1.8vmin, 0.9rem);
		line-height: 1.5;
	}

	.casino-title {
		color: #fbbf24;
		font-weight: 700;
		margin-bottom: clamp(6px, 1vh, 8px);
		font-family: var(--font-display, system-ui);
	}

	.expand-icon {
		margin-left: auto;
		font-size: clamp(0.7rem, 1.5vmin, 0.85rem);
		color: #fbbf24;
		transition: transform 0.2s ease;
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.properties-list {
		margin-top: clamp(10px, 2vh, 14px);
		padding-top: clamp(10px, 2vh, 14px);
		border-top: 1px solid rgba(251, 191, 36, 0.2);
		display: flex;
		flex-direction: column;
		gap: clamp(8px, 1.5vh, 12px);
	}

	.property-card {
		display: flex;
		gap: clamp(6px, 1vw, 10px);
		padding: clamp(8px, 1.5vh, 12px);
		background: linear-gradient(90deg, rgba(251, 191, 36, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
		border: 1px solid rgba(251, 191, 36, 0.25);
		border-left: 4px solid var(--prop-color, #fbbf24);
		border-radius: clamp(6px, 1vmin, 10px);
		transition: all 0.2s ease;
	}

	.property-card.monopoly {
		background: linear-gradient(90deg, rgba(251, 191, 36, 0.18) 0%, rgba(251, 191, 36, 0.06) 100%);
		border: 2px solid var(--prop-color, #fbbf24);
		border-left-width: 4px;
		box-shadow: 0 0 12px rgba(251, 191, 36, 0.3), inset 0 0 12px rgba(251, 191, 36, 0.1);
	}

	.property-card:hover {
		background: linear-gradient(90deg, rgba(251, 191, 36, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
		border-color: var(--prop-color, #fbbf24);
		box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
	}

	.property-card.monopoly:hover {
		box-shadow: 0 0 16px rgba(251, 191, 36, 0.5), inset 0 0 12px rgba(251, 191, 36, 0.15);
	}

	.prop-content {
		flex: 1;
	}

	.prop-header {
		display: flex;
		align-items: center;
		gap: clamp(6px, 1vw, 10px);
		margin-bottom: clamp(2px, 0.4vh, 4px);
		justify-content: space-between;
	}

	.monopoly-badge {
		font-size: clamp(0.65rem, 1.4vmin, 0.75rem);
		font-weight: 800;
		color: #fbbf24;
		background: rgba(251, 191, 36, 0.25);
		padding: clamp(2px, 0.3vh, 4px) clamp(4px, 0.8vw, 6px);
		border-radius: 3px;
		white-space: nowrap;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
	}

	.prop-name {
		font-weight: 700;
		color: #fff;
		font-size: clamp(0.8rem, 1.8vmin, 0.9rem);
		margin-bottom: clamp(2px, 0.4vh, 4px);
	}

	.prop-price,
	.prop-rent,
	.prop-houses {
		font-size: clamp(0.7rem, 1.6vmin, 0.8rem);
		color: #d4d4d4;
		line-height: 1.3;
	}

	.prop-houses {
		color: #fbbf24;
		font-weight: 600;
		margin-top: clamp(2px, 0.4vh, 4px);
	}
</style>
