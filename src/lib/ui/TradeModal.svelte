<script>
	import { slide, fade } from 'svelte/transition';
	
	let { engine, activePlayerId, open, onClose } = $props();

	// Computed players
	let myPlayer = $derived(engine.players[activePlayerId]);
	let otherPlayers = $derived(Object.keys(engine.players).filter(id => id !== activePlayerId));
	
	// Local Draft State
	let targetPlayerId = $state(otherPlayers[0]);
	let draftedFromMoney = $state(0);
	let draftedToMoney = $state(0);
	let draftedFromProps = $state([]);
	let draftedToProps = $state([]);
	let draftedFromCards = $state([]);
	let draftMessage = $state('');

	// Sync local state when incoming trade arrives or when starting a new one
	$effect(() => {
		if (open) {
			if (engine.activeTrade && engine.activeTrade.receiverId === activePlayerId && engine.activeTrade.status === 'pending') {
				// We are receiving a trade! Load it up to view or counter.
				targetPlayerId = engine.activeTrade.senderId;
				// Reversed from our perspective
				draftedFromMoney = engine.activeTrade.requestedMoney;
				draftedToMoney = engine.activeTrade.offeredMoney;
				draftedFromProps = [...engine.activeTrade.requestedProperties];
				draftedToProps = [...engine.activeTrade.offeredProperties];
				// currently they can't request our cards in protocol, so we leave it empty
				draftedFromCards = []; 
				draftMessage = ''; 
			} else if (!engine.activeTrade) {
				// Clean slate
				draftedFromMoney = 0;
				draftedToMoney = 0;
				draftedFromProps = [];
				draftedToProps = [];
				draftedFromCards = [];
				draftMessage = '';
			}
		}
	});

	let targetPlayer = $derived(engine.players[targetPlayerId]);

	// Filter out selected properties so we know what's available
	let myAvailableProps = $derived(
		myPlayer?.properties.filter((pos) => !draftedFromProps.includes(pos)) || []
	);
	let theirAvailableProps = $derived(
		targetPlayer?.properties.filter((pos) => !draftedToProps.includes(pos)) || []
	);
	
	let myAvailableCards = $derived(
		myPlayer?.inventory?.filter(c => !draftedFromCards.some(d => d.eventId === c.eventId)) || []
	);

	// Actions - Click to add/remove
	function toggleMyProp(pos) {
		if (draftedFromProps.includes(pos)) {
			draftedFromProps = draftedFromProps.filter((p) => p !== pos);
		} else {
			draftedFromProps = [...draftedFromProps, pos];
		}
	}

	function toggleTheirProp(pos) {
		if (draftedToProps.includes(pos)) {
			draftedToProps = draftedToProps.filter((p) => p !== pos);
		} else {
			draftedToProps = [...draftedToProps, pos];
		}
	}

	function toggleMyCard(card) {
		if (draftedFromCards.some(c => c.eventId === card.eventId)) {
			draftedFromCards = draftedFromCards.filter((c) => c.eventId !== card.eventId);
		} else {
			draftedFromCards = [...draftedFromCards, card];
		}
	}

	// Helpers
	const propertyColors = {
		1: 'red', 2: 'red', 4: 'red',
		6: '#964B00', 8: '#964B00', 9: '#964B00',
		11: 'yellow', 13: 'yellow', 15: 'yellow',
		16: 'white', 18: 'white',
		17: 'green', 19: 'green',
		22: 'purple', 24: 'purple', 25: 'purple',
		27: '#FFB6C1', 28: '#FFB6C1',
		31: '#005EB8', 33: '#005EB8', 35: '#005EB8',
		37: 'darkred', 39: 'darkred',
		// utilities etc...
		7: 'utility', 26: 'utility', 34: 'utility'
	};

	let isReceivingTrade = $derived(
		engine.activeTrade && 
		engine.activeTrade.receiverId === activePlayerId && 
		engine.activeTrade.status === 'pending'
	);

	let isWaitingForResponse = $derived(
		engine.activeTrade &&
		engine.activeTrade.senderId === activePlayerId &&
		engine.activeTrade.status === 'pending'
	);

	// Fairness Calculation
	let totalValueOffered = $derived.by(() => {
		let total = draftedFromMoney;
		for (const p of draftedFromProps) total += (engine.properties[p].price * 0.8) + (engine.properties[p].houses * engine.properties[p].houseCost * 0.5);
		// evaluate cards roughly
		total += draftedFromCards.length * 100; 
		return total;
	});

	let totalValueRequested = $derived.by(() => {
		let total = draftedToMoney;
		for (const p of draftedToProps) total += (engine.properties[p].price * 0.8) + (engine.properties[p].houses * engine.properties[p].houseCost * 0.5);
		return total;
	});

	let tradeFairness = $derived(totalValueOffered - totalValueRequested);
	let fairnessColor = $derived(
		tradeFairness > 150 ? '#ef4444' // red / too generous? wait, positive means I offer MORE than I request. Red if bad for me?
			: tradeFairness < -150 ? '#eab308' // yellow / demanding
			: '#22c55e' // green / fair
	);
	
	let fairnessText = $derived(
		tradeFairness > 150 ? 'Generous (You lose value)'
			: tradeFairness < -150 ? 'Demanding (Hard to accept)'
			: 'Fair Trade'
	);

	let fairnessPercent = $derived(() => {
		const total = totalValueOffered + totalValueRequested;
		if (total === 0) return 50;
		return (totalValueOffered / total) * 100;
	});

	function handlePropose() {
		const res = engine.proposeTrade(targetPlayerId, draftedFromMoney, draftedFromProps, draftedFromCards, draftedToMoney, draftedToProps, draftMessage);
		if (res.ok) onClose();
		else engine.addBigNotification('Error', res.error, '⚠️', 'error', 3000);
	}

	function handleAccept() {
		const res = engine.acceptTrade(activePlayerId);
		if (res.ok) onClose();
		else engine.addBigNotification('Error', res.error, '⚠️', 'error', 3000);
	}

	function handleReject() {
		const res = engine.rejectTrade(activePlayerId);
		if (res.ok) onClose();
	}

	function handleCounter() {
		const res = engine.counterOffer(draftedFromMoney, draftedFromProps, draftedFromCards, draftedToMoney, draftedToProps, draftMessage);
		if (res.ok) onClose();
		else engine.addBigNotification('Error', res.error, '⚠️', 'error', 3000);
	}

</script>

{#if open}
	<!-- UI omitted for brevity -->
	<div class="modal-backdrop" in:fade={{duration: 200}} out:fade={{duration: 200}}>
		<div class="modal-content" in:slide={{duration: 300}}>
			<div class="modal-header">
				<h2>🤝 Trade Exchange</h2>
				<button class="close-btn" onclick={onClose}>×</button>
			</div>

			{#if isWaitingForResponse}
				<div class="waiting-state">
					<h3>⏳ Waiting for Player {engine.activeTrade.receiverId} to respond...</h3>
					<button class="btn btn-secondary" onclick={() => { engine.cancelTrade(); onClose(); }}>Cancel Trade</button>
				</div>
			{:else}

				<!-- If Receiving Trade -->
				{#if isReceivingTrade && engine.activeTrade.message}
					<div class="trade-message">
						💬 Player {engine.activeTrade.senderId} says: "{engine.activeTrade.message}"
					</div>
				{/if}

				<!-- Two Columns Layout -->
				<div class="trade-split">
					<!-- LEFT: MY SIDE -->
					<div class="trade-side my-side">
						<div class="side-header">
							<h3>Player {activePlayerId} (You)</h3>
							<div class="money-stat">Balance: ${myPlayer?.money}</div>
						</div>

						<div class="offer-section">
							<h4>Offer Money</h4>
							<input type="range" min="0" max={myPlayer?.money || 0} step="10" bind:value={draftedFromMoney} />
							<div class="money-display">${draftedFromMoney}</div>
						</div>

						<div class="offer-section">
							<h4>Offer Properties (Click to Table)</h4>
							<div class="cards-grid">
								{#each myAvailableProps as pos}
									<button class="prop-card" style:border-top={`4px solid ${propertyColors[pos] || '#ccc'}`} onclick={() => toggleMyProp(pos)}>
										<span class="prop-name">{engine.properties[pos].name}</span>
										<span class="prop-price">${engine.properties[pos].price}</span>
									</button>
								{/each}
								{#each myAvailableCards as card}
									<button class="prop-card inventory-card" onclick={() => toggleMyCard(card)}>
										<span class="prop-name">{card.emoji} {card.name}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- CENTER: THE TABLE -->
					<div class="trade-table">
						<div class="table-zone">
							<div class="table-half left-table">
								<h4>You Offer</h4>
								{#if draftedFromMoney > 0} <div class="table-item cash">💵 ${draftedFromMoney}</div> {/if}
								{#each draftedFromProps as pos}
									<button class="table-item prop" style:border-left={`3px solid ${propertyColors[pos] || '#ccc'}`} onclick={() => toggleMyProp(pos)}>
										{engine.properties[pos].name} ✖
									</button>
								{/each}
								{#each draftedFromCards as c}
									<button class="table-item card" onclick={() => toggleMyCard(c)}>
										{c.emoji} {c.name} ✖
									</button>
								{/each}
							</div>
							<div class="table-divider"></div>
							<div class="table-half right-table">
								<h4>They Offer</h4>
								{#if draftedToMoney > 0} <div class="table-item cash">💵 ${draftedToMoney}</div> {/if}
								{#each draftedToProps as pos}
									<button class="table-item prop" style:border-left={`3px solid ${propertyColors[pos] || '#ccc'}`} onclick={() => toggleTheirProp(pos)}>
										{engine.properties[pos].name} ✖
									</button>
								{/each}
							</div>
						</div>

						<!-- Fairness Bar -->
						<div class="fairness-container">
							<div class="fairness-title">Trade Fairness Bar</div>
							<div class="fairness-bar">
								<div class="fairness-fill" style="width: {fairnessPercent()}%"></div>
								<div class="fairness-marker" style="left: 50%"></div>
							</div>
							<div class="fairness-text" style="color: {fairnessColor}">{fairnessText}</div>
						</div>

						{#if !isReceivingTrade}
							<input type="text" class="message-input" placeholder="Type a message (e.g. Ber nebo nechej být!)" bind:value={draftMessage} />
						{/if}
					</div>

					<!-- RIGHT: THEIR SIDE -->
					<div class="trade-side their-side">
						<div class="side-header">
							{#if isReceivingTrade}
								<h3>Player {targetPlayerId}</h3>
							{:else}
								<select class="player-select" bind:value={targetPlayerId}>
									{#each otherPlayers as pId}
										<option value={pId}>Player {pId}</option>
									{/each}
								</select>
							{/if}
							<div class="money-stat">Balance: ${targetPlayer?.money}</div>
						</div>

						<div class="offer-section">
							<h4>Request Money</h4>
							<input type="range" min="0" max={targetPlayer?.money || 0} step="10" bind:value={draftedToMoney} />
							<div class="money-display">${draftedToMoney}</div>
						</div>

						<div class="offer-section">
							<h4>Request Properties (Click to Table)</h4>
							<div class="cards-grid">
								{#each theirAvailableProps as pos}
									<button class="prop-card" style:border-top={`4px solid ${propertyColors[pos] || '#ccc'}`} onclick={() => toggleTheirProp(pos)}>
										<span class="prop-name">{engine.properties[pos].name}</span>
										<span class="prop-price">${engine.properties[pos].price}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					{#if isReceivingTrade}
						<button class="btn btn-success" onclick={handleAccept}>✅ Accept Deal</button>
						<button class="btn btn-warning" onclick={handleCounter}>🔄 Counter Offer</button>
						<button class="btn btn-danger" onclick={handleReject}>❌ Reject</button>
					{:else}
						<button class="btn btn-primary" onclick={handlePropose} disabled={!targetPlayerId || (draftedFromMoney===0 && draftedToMoney===0 && draftedFromProps.length===0 && draftedToProps.length===0)}>
							✉️ Propose Trade
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(12px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(10px, 2vmin, 20px);
	}

	.modal-content {
		width: min(95vw, 1200px);
		height: min(90vh, 800px);
		background: linear-gradient(145deg, #1f2937, #111827);
		border-radius: clamp(12px, 2vmin, 20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
		overflow: hidden;
		color: #e5e7eb;
	}

	.modal-header {
		padding: clamp(12px, 2vmin, 20px);
		border-bottom: 1px solid rgba(255,255,255,0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(0,0,0,0.2);
	}

	.modal-header h2 { margin: 0; font-size: clamp(1.2rem, 2.5vmin, 1.8rem); font-weight: 800; }

	.close-btn {
		background: none; border: none; color: #9ca3af; font-size: 2rem; cursor: pointer; transition: 0.2s;
	}
	.close-btn:hover { color: #fff; transform: scale(1.1); }

	.trade-split {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.trade-side {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: clamp(10px, 2vmin, 20px);
		overflow-y: auto;
		background: rgba(255,255,255,0.02);
	}

	.my-side { border-right: 1px solid rgba(255,255,255,0.05); }
	.their-side { border-left: 1px solid rgba(255,255,255,0.05); }

	.side-header {
		display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
	}
	.side-header h3 { margin: 0; font-size: 1.2rem; }
	.money-stat { font-weight: bold; color: #10b981; }
	.player-select { 
		background: #374151; color: white; border: 1px solid #4b5563; padding: 6px 12px; border-radius: 6px; font-size: 1rem;
	}

	.trade-table {
		flex: 1.2;
		background: rgba(0,0,0,0.3);
		display: flex;
		flex-direction: column;
		padding: clamp(10px, 2vmin, 20px);
	}

	.table-zone {
		display: flex; flex: 1;
		background: rgba(255,255,255,0.03);
		border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
	}

	.table-half {
		flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;
	}
	.table-divider { width: 2px; background: rgba(255,255,255,0.1); }

	.table-item {
		padding: 8px 12px; border-radius: 6px; background: rgba(55, 65, 81, 0.8);
		border: 1px solid rgba(255,255,255,0.1); color: white; text-align: left; cursor: pointer;
		display: flex; justify-content: space-between; transition: 0.2s;
	}
	.table-item:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }

	.cards-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;
	}

	.prop-card {
		background: #374151; border: 1px solid #4b5563; border-radius: 8px; padding: 10px;
		color: white; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; text-align: left;
	}
	.prop-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); background: #4b5563;}
	.inventory-card { border-top: 4px solid #8b5cf6; }

	.offer-section { margin-bottom: 20px; }
	.offer-section h4 { margin: 0 0 10px 0; color: #9ca3af; font-size: 0.9rem; text-transform: uppercase; }

	input[type="range"] {
		width: 100%; accent-color: #10b981;
	}
	.money-display { text-align: center; font-size: 1.5rem; font-weight: bold; margin-top: 5px; color: #34d399; }

	.fairness-container {
		margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; text-align: center;
	}
	.fairness-title { font-size: 0.9rem; color: #9ca3af; margin-bottom: 10px; }
	.fairness-bar {
		height: 12px; border-radius: 6px; background: #374151; position: relative; overflow: hidden;
	}
	.fairness-fill {
		position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, #ef4444, #eab308, #22c55e, #10b981);
		transition: width 0.3s ease;
	}
	.fairness-marker {
		position: absolute; top: 0; bottom: 0; width: 4px; background: white; z-index: 10; transform: translateX(-50%); box-shadow: 0 0 5px rgba(0,0,0,0.5);
	}
	.fairness-text { margin-top: 8px; font-weight: bold; }

	.message-input {
		margin-top: 15px; width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #4b5563; background: rgba(0,0,0,0.2); color: white;
	}

	.modal-footer {
		padding: 15px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);
		display: flex; justify-content: flex-end; gap: 15px;
	}

	.btn {
		padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; border: none; cursor: pointer; transition: 0.2s;
	}
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
	.btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
	.btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
	.btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
	.btn-secondary { background: #4b5563; color: white; }
	.btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }

	.trade-message { background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); padding: 12px; margin: 15px; border-radius: 8px; font-style: italic; }
	.waiting-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
</style>
<!-- 
    Trade Modal Component for Svelte Monopoly
    - Allows players to propose, accept, reject, and counter trade offers
    - Supports trading money, properties, and inventory cards
    - Includes a fairness bar to visually indicate how balanced the trade is
    - Responsive and visually engaging design with smooth transitions
    have to finish after getting tokens -->