<script>
	let { messages } = $props();
</script>

<div class="game-log">
	<div class="log-header">
		<h3>Game Log</h3>
	</div>
	
	{#if messages.length > 0}
		<div class="messages-list">
			{#each [...messages].reverse().slice(0, 12) as msg (msg.id)}
				<div class="msg-item" data-type={msg.type}>
					{msg.text}
				</div>
			{/each}
		</div>
	{:else}
		<p class="empty-log">Roll the dice to start</p>
	{/if}
</div>

<style>
	.game-log {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: 
			linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%);
		border: 1.5px solid rgba(251, 191, 36, 0.5);
		border-radius: clamp(12px, 2vmin, 18px);
		backdrop-filter: blur(12px) saturate(1.3);
		overflow: hidden;
	}

	.log-header {
		padding: clamp(12px, 2vh, 18px) clamp(16px, 3vw, 24px);
		background: linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, transparent 100%);
		border-bottom: 1px solid rgba(251, 191, 36, 0.3);
	}

	.log-header h3 {
		margin: 0;
		color: #fbbf24;
		font-size: clamp(0.95rem, 2vmin, 1.15rem);
		font-family: var(--font-display, system-ui);
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		text-align: center;
	}

	.messages-list {
		flex: 1;
		overflow-y: auto;
		padding: clamp(12px, 2vh, 18px);
		display: flex;
		flex-direction: column;
		gap: clamp(6px, 1vh, 10px);
	}

	.msg-item {
		padding: clamp(8px, 1.5vh, 12px) clamp(10px, 2vw, 14px);
		border-left: 3px solid var(--msg-color, #fbbf24);
		border-radius: 6px;
		font-size: clamp(0.8rem, 1.8vmin, 0.9rem);
		color: #e5e7eb;
		background: rgba(255, 255, 255, 0.04);
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		line-height: 1.4;
	}

	.msg-item:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateX(4px);
	}

	.msg-item[data-type="error"] {
		--msg-color: #f87171;
		background: rgba(220, 38, 38, 0.15);
	}

	.msg-item[data-type="success"] {
		--msg-color: #4ade80;
		background: rgba(21, 128, 61, 0.15);
	}

	.msg-item[data-type="warning"] {
		--msg-color: #f59e0b;
		background: rgba(180, 83, 9, 0.15);
	}

	.empty-log {
		flex: 1;
		display: grid;
		place-items: center;
		color: rgba(163, 163, 163, 0.7);
		font-size: clamp(0.85rem, 2vmin, 1rem);
		margin: 0;
		font-style: italic;
	}

	/* Scrollbar styling */
	.messages-list::-webkit-scrollbar {
		width: 6px;
	}

	.messages-list::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
	}

	.messages-list::-webkit-scrollbar-thumb {
		background: rgba(251, 191, 36, 0.3);
		border-radius: 3px;
	}

	.messages-list::-webkit-scrollbar-thumb:hover {
		background: rgba(251, 191, 36, 0.5);
	}
</style>
