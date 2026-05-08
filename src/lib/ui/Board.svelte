<script>
	let { players, properties, children } = $props();
	
	// Event tile pozice
	const EVENT_TILES = [5, 12, 21, 29, 36];
	
	// Property colors pro dynamické proužky
	const propertyColors = {
		1: 'red', 2: 'red', 4: 'red',
		6: '#964B00', 8: '#964B00', 9: '#964B00',
		11: 'yellow', 13: 'yellow', 15: 'yellow',
		16: 'white', 18: 'white',
		17: 'green', 19: 'green',
		22: 'purple', 24: 'purple', 25: 'purple',
		27: '#FFB6C1', 28: '#FFB6C1',
		31: '#005EB8', 33: '#005EB8', 35: '#005EB8',
		37: 'darkred', 39: 'darkred'
	};
</script>

<div class="board">
	{#each Array(40) as _, i}
		<div 
			class="cell" 
			class:corner={[0, 10, 20, 30].includes(i)}
			class:top-edge={i > 0 && i < 10}
			class:right-edge={i > 10 && i < 20}
			class:bottom-edge={i > 30 && i < 40}
			class:left-edge={i > 20 && i < 30}
			class:event-tile={EVENT_TILES.includes(i)}
			data-position={i}
			style:--property-color={propertyColors[i]}
		>
			<!-- Slot pro obrázek políčka (bude vložen později) -->
			<div class="cell-bg">
				<!-- <img src="/assets/tiles/tile-{i}.png" alt="Tile {i}" /> -->
			</div>
			
			<!-- Event tile indikátor -->
			{#if EVENT_TILES.includes(i)}
				<div class="event-indicator">⚡</div>
			{/if}
			
			<!-- Barevný proužek pro properties -->
			{#if propertyColors[i]}
				<div class="property-stripe"></div>
			{/if}
			
			<!-- Název políčka -->
			{#if properties && properties[i]}
				<div class="cell-name">
					{properties[i].name}
				</div>
			{/if}
			
			<!-- Player tokens -->
			<div class="tokens">
				{#each Object.entries(players) as [id, player]}
					{#if player.position === i}
						<div class="token" data-player={id}></div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
	
	<div class="board-center">
		{@render children?.()}
	</div>
</div>

<style>
	.board {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 1fr repeat(9, 1fr) 1fr;
		grid-template-rows: repeat(13, 1fr);
		gap: 0;
		background: 
			linear-gradient(135deg, rgba(5, 46, 22, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
		padding: clamp(2px, 0.4vmin, 6px);
	}

	.board-center {
		grid-area: 3 / 3 / 12 / 10;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none; /* Let clicks pass if needed, though GameLog might need them */
	}

	:global(.board-center > *) {
		pointer-events: auto;
	}

	.cell {
		position: relative;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		overflow: hidden;
	}

	.cell:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(251, 191, 36, 0.3);
	}

	/* Corner cells – větší plocha */
	.cell.corner {
		grid-column: span 1;
		grid-row: span 2;
		background: rgba(251, 191, 36, 0.08);
	}

	.cell.top-edge,
	.cell.bottom-edge {
		grid-row: span 2;
	}

	.cell.left-edge,
	.cell.right-edge {
		grid-column: span 2;
	}

	/* Property stripe – barevný proužek nahoře */
	.property-stripe {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 25%;
		background: var(--property-color, transparent);
	}

	.cell.bottom-edge .property-stripe {
		top: auto;
		bottom: 0;
	}

	.cell.left-edge .property-stripe,
	.cell.right-edge .property-stripe {
		top: 0;
		bottom: 0;
		left: 0;
		right: auto;
		width: 25%;
		height: auto;
	}

	.cell.right-edge .property-stripe {
		left: auto;
		right: 0;
	}

	/* Event tile indikátor */
	.event-tile {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%) !important;
		border: 1.5px solid rgba(139, 92, 246, 0.4) !important;
		animation: eventPulse 2s ease-in-out infinite;
	}

	.event-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: clamp(16px, 3vmin, 24px);
		animation: eventBounce 1.5s ease-in-out infinite;
		pointer-events: none;
		z-index: 10;
	}

	@keyframes eventPulse {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3);
		}
		50% {
			box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
		}
	}

	@keyframes eventBounce {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.15);
		}
	}

	/* Background slot pro obrázek */
	.cell-bg {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	/* Název políčka */
	.cell-name {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: clamp(0.75rem, 1.2vmin, 1.15rem);
		font-weight: 600;
		color: #e5e7eb;
		padding: clamp(1px, 0.4vmin, 4px);
		line-height: 1.2;
		word-break: break-word;
		pointer-events: none;
		max-width: 100%;
		max-height: 100%;
		overflow: hidden;
	}

	.cell.left-edge .cell-name {
		transform: rotate(90deg);
	}

	.cell.right-edge .cell-name {
		transform: rotate(-90deg);
	}

	/* Player tokens */
	.tokens {
		position: absolute;
		bottom: clamp(2px, 0.5vmin, 4px);
		right: clamp(2px, 0.5vmin, 4px);
		display: flex;
		gap: clamp(1px, 0.3vmin, 2px);
		flex-wrap: wrap;
		max-width: 80%;
		pointer-events: none;
	}

	.token {
		width: clamp(14px, 2.5vmin, 24px);
		aspect-ratio: 1;
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0.3);
	}

	.token[data-player="0"] {
		background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
	}

	.token[data-player="1"] {
		background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
	}

	.token[data-player="2"] {
		background: linear-gradient(135deg, #15803d 0%, #22c55e 100%);
	}

	/* Layout pro políčka (GO v levém horním rohu, jde doprava) */
	.cell[data-position="0"] { grid-area: 1 / 1 / 3 / 2; } /* GO - top-left */
	.cell[data-position="10"] { grid-area: 1 / 11 / 3 / 12; } /* Jail - top-right */
	.cell[data-position="20"] { grid-area: 12 / 11 / 14 / 12; } /* Casino - bottom-right */
	.cell[data-position="30"] { grid-area: 12 / 1 / 14 / 2; } /* Epstein Island - bottom-left */

	/* Top row (1-9) zleva doprava */
	.cell[data-position="1"] { grid-area: 1 / 2 / 3 / 3; }
	.cell[data-position="2"] { grid-area: 1 / 3 / 3 / 4; }
	.cell[data-position="3"] { grid-area: 1 / 4 / 3 / 5; }
	.cell[data-position="4"] { grid-area: 1 / 5 / 3 / 6; }
	.cell[data-position="5"] { grid-area: 1 / 6 / 3 / 7; }
	.cell[data-position="6"] { grid-area: 1 / 7 / 3 / 8; }
	.cell[data-position="7"] { grid-area: 1 / 8 / 3 / 9; }
	.cell[data-position="8"] { grid-area: 1 / 9 / 3 / 10; }
	.cell[data-position="9"] { grid-area: 1 / 10 / 3 / 11; }

	/* Right column (11-19) shora dolů */
	.cell[data-position="11"] { grid-area: 3 / 10 / 4 / 12; }
	.cell[data-position="12"] { grid-area: 4 / 10 / 5 / 12; }
	.cell[data-position="13"] { grid-area: 5 / 10 / 6 / 12; }
	.cell[data-position="14"] { grid-area: 6 / 10 / 7 / 12; }
	.cell[data-position="15"] { grid-area: 7 / 10 / 8 / 12; }
	.cell[data-position="16"] { grid-area: 8 / 10 / 9 / 12; }
	.cell[data-position="17"] { grid-area: 9 / 10 / 10 / 12; }
	.cell[data-position="18"] { grid-area: 10 / 10 / 11 / 12; }
	.cell[data-position="19"] { grid-area: 11 / 10 / 12 / 12; }

	/* Bottom row (31-39) zprava doleva */
	.cell[data-position="31"] { grid-area: 12 / 10 / 14 / 11; }
	.cell[data-position="32"] { grid-area: 12 / 9 / 14 / 10; }
	.cell[data-position="33"] { grid-area: 12 / 8 / 14 / 9; }
	.cell[data-position="34"] { grid-area: 12 / 7 / 14 / 8; }
	.cell[data-position="35"] { grid-area: 12 / 6 / 14 / 7; }
	.cell[data-position="36"] { grid-area: 12 / 5 / 14 / 6; }
	.cell[data-position="37"] { grid-area: 12 / 4 / 14 / 5; }
	.cell[data-position="38"] { grid-area: 12 / 3 / 14 / 4; }
	.cell[data-position="39"] { grid-area: 12 / 2 / 14 / 3; }

	/* Left column (21-29) zdola nahoru */
	.cell[data-position="21"] { grid-area: 11 / 1 / 12 / 3; }
	.cell[data-position="22"] { grid-area: 10 / 1 / 11 / 3; }
	.cell[data-position="23"] { grid-area: 9 / 1 / 10 / 3; }
	.cell[data-position="24"] { grid-area: 8 / 1 / 9 / 3; }
	.cell[data-position="25"] { grid-area: 7 / 1 / 8 / 3; }
	.cell[data-position="26"] { grid-area: 6 / 1 / 7 / 3; }
	.cell[data-position="27"] { grid-area: 5 / 1 / 6 / 3; }
	.cell[data-position="28"] { grid-area: 4 / 1 / 5 / 3; }
	.cell[data-position="29"] { grid-area: 3 / 1 / 4 / 3; }
</style>
