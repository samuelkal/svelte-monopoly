<script>
	import EventCardZone from './EventCardZone.svelte';
	import czechFlagImg from '$lib/assets/tiles/IMG_0404.JPG';
	import jamaicaImg from '$lib/assets/tiles/Jamaica.JPG';
	import israelImg from '$lib/assets/tiles/Izrael.JPG';

	let { players, properties } = $props();
	
	// Event tile pozice
	const EVENT_TILES = [5, 12, 39, 31];
	
	// Property colors pro dynamické proužky
	const propertyColors = {
		1: 'red', 2: 'red', 4: 'red',
		6: '#964B00', 8: '#964B00', 9: '#964B00',
		11: 'black', 13: 'black', 15: 'black',
		16: 'ORANGE', 18: 'ORANGE',
		17: 'green', 19: 'green',
		32: 'purple', 34: 'purple', 35: 'purple',
		27: '#AA336A', 28: '#AA336A', 29: '#AA336A',
		21: '#005EB8', 22: '#005EB8', 24: '#005EB8',
		37: 'darkred', 38: 'darkred',

		//utilities
		7: 'Gold', 36: 'Gold', 25: 'utility', 17: 'utility'

	};

	function formatAmount(value) {
		return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
	}

	function getRentValue(property, allProperties) {
		const baseRent = formatAmount(property?.rent);
		const houses = formatAmount(property?.houses);

		if (houses <= 0) {
			// Check for monopoly: if owner holds all properties of this color, double rent
			if (property && property.owner !== null && property.color) {
				// Find all properties with the same color
				const sameColorProperties = Object.values(allProperties)
					.filter(p => p && p.color === property.color);
				
				// Check if owner has all properties of this color
				const hasMonopoly = sameColorProperties.length > 0 && 
					sameColorProperties.every(p => p.owner === property.owner);
				
				if (hasMonopoly) {
					return baseRent * 2;
				}
			}
			return baseRent;
		}

		return baseRent * (houses + 1);
	}

	function getPriceTag(property) {
		if (!property) {
			return null;
		}

		const price = formatAmount(property.price);
		const rent = getRentValue(property, properties);
		const hasEconomicValue = price > 0 || rent > 0;

		if (!hasEconomicValue) {
			return null;
		}

		if (property.owner === null) {
			return { text: `B: $${price}`, type: 'buy' };
		}

		return { text: `R: $${rent}`, type: 'rent' };
	}

	// Player colors mapping
	const playerColors = {
		'0': '#ef4444', // Red
		'1': '#3b82f6', // Blue
		'2': '#22c55e'  // Green
	};

	function getOwnerColor(property) {
		if (!property || property.owner === null) {
			return 'transparent';
		}
		return playerColors[property.owner] || 'transparent';
	}
</script>

<div class="board">
	{#each Array(40) as _, i}
		<div 
			class="cell" 
			class:corner={[0, 10, 20, 30].includes(i)}
			class:top-edge={i > 0 && i < 10}
			class:right-edge={i > 10 && i < 20}
			class:bottom-edge={i > 20 && i < 30}
			class:left-edge={i > 30 && i < 40}
			class:event-tile={EVENT_TILES.includes(i)}
			class:owned={properties && properties[i] && properties[i].owner !== null}
			data-position={i}
			style:--property-color={propertyColors[i]}
			style:--owner-color={properties && properties[i] ? getOwnerColor(properties[i]) : 'transparent'}
		>
			<!-- Slot pro obrázek políčka (bude vložen později) -->
		<div class="cell-bg" class:has-bg-image={properties && properties[i] && (properties[i].name === 'Brno' || properties[i].name === 'Picin' || properties[i].name === 'Kingston' || properties[i].name === 'Negril' || properties[i].name === 'Tel Aviv' || properties[i].name === 'Herzliya')}>
			{#if properties && properties[i] && properties[i].name === 'Picin'}
				<img src={czechFlagImg} alt="Picin" class="tile-bg-img tile-bg-left" />
			{:else if properties && properties[i] && properties[i].name === 'Brno'}
				<img src={czechFlagImg} alt="Brno" class="tile-bg-img tile-bg-right" />
			{:else if properties && properties[i] && properties[i].name === 'Kingston'}
				<img src={jamaicaImg} alt="Kingston" class="tile-bg-img tile-bg-top" />
			{:else if properties && properties[i] && properties[i].name === 'Negril'}
				<img src={jamaicaImg} alt="Negril" class="tile-bg-img tile-bg-bottom" />
			{:else if properties && properties[i] && properties[i].name === 'Tel Aviv'}
				<img src={israelImg} alt="Tel Aviv" class="tile-bg-img tile-bg-right-iz" />
			{:else if properties && properties[i] && properties[i].name === 'Herzliya'}
				<img src={israelImg} alt="Herzliya" class="tile-bg-img tile-bg-left-iz" />
			{/if}
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
				{@const priceTag = getPriceTag(properties[i])}
				<div class="cell-label-area">
					<div class="cell-name" title={properties[i].name}>
						{properties[i].name}
					</div>
					{#if priceTag}
						<div class="cell-price price-tag" class:buy-tag={priceTag.type === 'buy'} class:rent-tag={priceTag.type === 'rent'}>
							{priceTag.text}
						</div>
					{/if}
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
		<EventCardZone />
	</div>
</div>

<style>
	.board {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 2fr repeat(9, 1fr) 2fr;
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
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s ease;
		overflow: hidden;
		border-radius: clamp(6px, 1.5vmin, 12px);
	}

	.cell:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(251, 191, 36, 0.3);
	}

	/* Owned property glow effect */
	.cell.owned {
		box-shadow: inset 0 0 15px var(--owner-color);
		border: 2px solid var(--owner-color) !important;
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
		height: 17%;
		background: var(--property-color, transparent);
		z-index: 5; /* raise above background */
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		padding: 0 6px;
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
		width: 10%;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 0;
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

	.cell-bg.has-bg-image {
		background-color: rgba(0, 0, 0, 0.2);
		background-blend-mode: multiply;
	}

/* Toto ovládá samotný obrázek */
.tile-bg-img {
    inset: 0;
    width: 100%;
    height: 100%;
	object-fit: cover;
    pointer-events: none;
    z-index: 0;
}

/* Toto ho posune doleva */
.tile-bg-left {
    /* calc(50% - 10px) znamená: buď na středu a jdi o 10px vlevo */
    object-position: calc(50% + 30px) center !important;
}
.tile-bg-left-iz {
    /* calc(50% - 10px) znamená: buď na středu a jdi o 10px vlevo */
    object-position: calc(50% + 30px) center !important;
}

/* Toto ho posune doprava (pokud chceš) */
.tile-bg-right {
    object-position: calc(50% - 40px) center !important;

}
.tile-bg-right-iz {
    object-position: calc(50% - 36px) center !important;

}

/* Toto ho posune nahoru */
.tile-bg-top {
    object-position: center calc(50% - 55px) !important;
	object-fit: cover;
}

/* Toto ho posune dolů */
.tile-bg-bottom {
    object-position: center calc(50% -1px) !important;
	object-fit: cover;
}

	/* Název a cena políčka */
	.cell-label-area {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		padding: 4px 2px;
		gap: 4px;
		pointer-events: none;
		min-width: 0;
		z-index: 10;
	}

	.cell-name {
		display: block;
		text-align: center;
		font-family: var(--font-primary, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 900;
		color: #e5e7eb;
		line-height: 1.05;
		width: 100%;
		max-width: 100%;
		white-space: normal;
		word-break: keep-all;
		overflow-wrap: normal;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Top and bottom edge names stay horizontal in label-area */
	.cell.top-edge .cell-name {
		font-size: 0.75rem;
		font-weight: 900;
		line-height: 1.05;
		overflow: visible;
	}

	.cell.bottom-edge .cell-name {
		font-size: 0.75rem;
		font-weight: 900;
		line-height: 1;
		overflow: visible;
	}

	.cell-price {
		position: absolute;
		top: 4px;
		right: 4px;
		width: auto;
		max-width: calc(100% - 8px);
		text-align: center;
		font-size: 0.72rem;
		font-weight: 800;
		z-index: 13;
		opacity: 0.8;
		letter-spacing: 0.2px;
		color: rgba(229, 231, 235, 0.85);
		white-space: nowrap;
		padding: 2px 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 0;
	}

	.price-tag {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0);
		border: 1px solid rgba(0, 0, 0, 0);
		padding: 2px 4px;
		width: auto;
		max-width: calc(100% - 8px);
		font-size: 0.72rem;
		font-weight: 800;
		z-index: 14;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.buy-tag {
		color: #fde68a;
		border-color: rgba(253, 230, 138, 0.45);
		background-color: rgba(0,0,0,100);
	}

	.rent-tag {
		color: #86efac;
		border-color: rgba(134, 239, 172, 0.45);
	}

	/* Stripe is at bottom on these tiles (21-29), so price moves to top (opposite end) */
	.cell.bottom-edge .cell-label-area {
		flex-direction: column-reverse;
		overflow: visible;
	}

	.cell.top-edge .cell-price {
		top: auto;
		bottom: 4px;
		left: center;
		right: auto;
	}

	.cell.bottom-edge .cell-price {
		/* Place price at the top of bottom-row tiles (21-29) and let it overlap the name */
		top: 4px;
		bottom: auto;
		right: 4px;
		left: auto;
		z-index: 12; /* above .cell-label-area (10) */
	}

	/* Side tiles stay horizontal and wrap naturally instead of rotating */
	.cell.left-edge .cell-label-area,
	.cell.right-edge .cell-label-area {
		flex-direction: column;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}

	.cell.left-edge .cell-label-area,
	.cell.right-edge .cell-label-area {
		padding: 4px 2px;
		gap: 4px;
	}

	.cell.left-edge .cell-price,
	.cell.right-edge .cell-price {
		top: 50%;
		bottom: auto;
		transform-origin: center;
		padding: 2px 3px;
	}

	.cell.left-edge .cell-price {
		right: 4px;
		left: auto;
		transform: translateY(-50%) rotate(90deg);
	}

	.cell.right-edge .cell-price {
		left: 4px;
		right: auto;
		transform: translateY(-50%) rotate(-90deg);
	}

	.cell.left-edge .cell-name,
	.cell.right-edge .cell-name {
		position: absolute;
		font-size: 0.75rem;
		font-weight: 900;
		margin: 0;
		line-height: 1.05;
		white-space: normal;
		overflow: visible;
		text-overflow: ellipsis;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		text-shadow: 0 1px 0 rgba(0,0,0,0.6);
		z-index: 16;
		top: 0;
		bottom: 0;
		width: 10%;
		padding: 0;
		box-sizing: border-box;
		transform-origin: center;
	}

	.cell.left-edge .cell-name {
		left: 0;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		line-height: 1;
		white-space: nowrap;
	}

	.cell.right-edge .cell-name {
		right: 0;
		transform: rotate(-90deg);
	}

	.cell.bottom-edge .cell-name {
		line-height: 1;
		overflow: visible;
	}

	.cell.bottom-edge .cell-price {
		/* Ensure price stays at the top and visible above the label */
		top: 4px;
		bottom: auto;
		overflow: visible;
		z-index: 12;
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

/* Bottom row (21-29) zprava doleva (POKRAČUJE PO CASINU) */
    .cell[data-position="21"] { grid-area: 12 / 10 / 14 / 11; }
    .cell[data-position="22"] { grid-area: 12 / 9 / 14 / 10; }
    .cell[data-position="23"] { grid-area: 12 / 8 / 14 / 9; }
    .cell[data-position="24"] { grid-area: 12 / 7 / 14 / 8; }
    .cell[data-position="25"] { grid-area: 12 / 6 / 14 / 7; }
    .cell[data-position="26"] { grid-area: 12 / 5 / 14 / 6; }
    .cell[data-position="27"] { grid-area: 12 / 4 / 14 / 5; }
    .cell[data-position="28"] { grid-area: 12 / 3 / 14 / 4; }
    .cell[data-position="29"] { grid-area: 12 / 2 / 14 / 3; }

    /* Corner - Epstein Island je teď logicky ID 30 */
    .cell[data-position="30"] { grid-area: 12 / 1 / 14 / 2; }

    /* Left column (31-39) zdola nahoru (SMĚREM KE GO) */
    .cell[data-position="31"] { grid-area: 11 / 1 / 12 / 3; }
    .cell[data-position="32"] { grid-area: 10 / 1 / 11 / 3; }
    .cell[data-position="33"] { grid-area: 9 / 1 / 10 / 3; }
    .cell[data-position="34"] { grid-area: 8 / 1 / 9 / 3; }
    .cell[data-position="35"] { grid-area: 7 / 1 / 8 / 3; }
    .cell[data-position="36"] { grid-area: 6 / 1 / 7 / 3; }
    .cell[data-position="37"] { grid-area: 5 / 1 / 6 / 3; }
    .cell[data-position="38"] { grid-area: 4 / 1 / 5 / 3; }
    .cell[data-position="39"] { grid-area: 3 / 1 / 4 / 3; }
</style>
