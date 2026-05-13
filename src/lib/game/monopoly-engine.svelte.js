import { EVENTS, drawRandomEvent } from './EventDatabase.svelte.js';

const BOARD_SIZE = 40;
const START_REWARD_PASS = 200;
const START_REWARD_LAND = 100;
const JAIL_FEE = 50;
const TAX_TILES = [3, 14, 28, 33];
const TAX_AMOUNT = 200;
const JAIL_TILE = 10;
const CASINO_TILE = 20;
const CASINO_PRICE = 500;
const SPECIAL_NOTIFICATION_DURATION = 2500;
const MAX_MESSAGES = 10;
const MAX_NOTIFICATIONS = 5;

const EVENT_TILES = [5, 12, 21, 39, 33];

function defaultRng() {
	return {
		die(sides) {
			if (sides < 1) {
				throw new Error('Die must have at least one side');
			}
			return Math.floor(Math.random() * sides) + 1;
		}
	};
}

function createDefaultPlayers() {
	return {
		'0': { position: 0, money: 1500, inJail: false, jailTurns: 0, properties: [], doublesCount: 0, inventory: [] },
		'1': { position: 0, money: 1500, inJail: false, jailTurns: 0, properties: [], doublesCount: 0, inventory: [] },
		'2': { position: 0, money: 1500, inJail: false, jailTurns: 0, properties: [], doublesCount: 0, inventory: [] }
	};
}

function createDefaultProperties() {
	return {
    0: { name: 'GO', price: 0, rent: 0, owner: null, color: 'special', houses: 0, houseCost: 0 },
    10: { name: 'Jail', price: 0, rent: 0, owner: null, color: 'special', houses: 0, houseCost: 0 },
    20: { name: 'Casino', price: 500, rent: 0, owner: null, color: 'special', houses: 0, houseCost: 0 },
    30: { name: 'Epstein Island', price: 0, rent: 0, owner: null, color: 'special', houses: 0, houseCost: 0 },

    // HORNÍ STRANA (ID 1-9)
    1: { name: 'Picin', price: 250, rent: 45, owner: null, color: 'red', houses: 0, houseCost: 100 },
    2: { name: 'Brno', price: 300, rent: 55, owner: null, color: 'red', houses: 0, houseCost: 100 },
    4: { name: 'Mrtnik', price: 350, rent: 65, owner: null, color: 'red', houses: 0, houseCost: 100 },
    6: { name: 'Pooh', price: 150, rent: 25, owner: null, color: 'brown', houses: 0, houseCost: 50 },
    8: { name: 'Bombaj', price: 180, rent: 30, owner: null, color: 'brown', houses: 0, houseCost: 50 },
    9: { name: 'Dilli', price: 200, rent: 35, owner: null, color: 'brown', houses: 0, houseCost: 50 },
    7: { name: 'Water', price: 200, rent: 50, owner: null, color: 'utility', houses: 0, houseCost: 0 },

    // PRAVÁ STRANA (ID 11-19)
    11: { name: 'Wank', price: 400, rent: 80, owner: null, color: 'black', houses: 0, houseCost: 150 },
    13: { name: 'Berlin', price: 450, rent: 90, owner: null, color: 'black', houses: 0, houseCost: 150 },
    15: { name: 'Munich', price: 500, rent: 100, owner: null, color: 'black', houses: 0, houseCost: 150 },
    16: { name: 'Leeds', price: 550, rent: 120, owner: null, color: 'orange', houses: 0, houseCost: 200 },
    18: { name: 'London', price: 600, rent: 135, owner: null, color: 'orange', houses: 0, houseCost: 200 },
    19: { name: 'Somalia', price: 450, rent: 100, owner: null, color: 'green', houses: 0, houseCost: 100 },
    17: { name: 'Knife', price: 200, rent: 50, owner: null, color: 'utility', houses: 0, houseCost: 0 },

    // SPODNÍ STRANA (ID 21-29) - IZRAEL & ČÍNA
    21: { name: 'Tel Aviv', price: 800, rent: 220, owner: null, color: 'blue', houses: 0, houseCost: 300 },
    22: { name: 'Herzliya', price: 850, rent: 250, owner: null, color: 'blue', houses: 0, houseCost: 300 },
    24: { name: 'Jerusalem', price: 1000, rent: 350, owner: null, color: 'blue', houses: 0, houseCost: 350 },
    29: { name: 'Tibet', price: 800, rent: 200, owner: null, color: 'pink', houses: 0, houseCost: 250 },
	27: { name: 'Beijing', price: 750, rent: 180, owner: null, color: 'pink', houses: 0, houseCost: 250 },
    26: { name: 'Shanghai', price: 900, rent: 250, owner: null, color: 'pink', houses: 0, houseCost: 300 },
    25: { name: 'Hat', price: 200, rent: 50, owner: null, color: 'utility', houses: 0, houseCost: 0 },

    // LEVÁ STRANA (ID 31-39) - JAMAJKA & USA
    32: { name: 'Virginia', price: 650, rent: 140, owner: null, color: 'purple', houses: 0, houseCost: 200 },
    34: { name: 'Oregon', price: 700, rent: 160, owner: null, color: 'purple', houses: 0, houseCost: 200 },
    35: { name: 'DC', price: 750, rent: 180, owner: null, color: 'purple', houses: 0, houseCost: 200 },
    37: { name: 'Kingston', price: 700, rent: 160, owner: null, color: 'red', houses: 0, houseCost: 200 },
    38: { name: 'Negril', price: 800, rent: 200, owner: null, color: 'red', houses: 0, houseCost: 200 },
    36: { name: 'Oil', price: 300, rent: 75, owner: null, color: 'utility', houses: 0, houseCost: 0 }
};
}

function toInt(value) {
	return Math.trunc(value);
}

export class MonopolyEngine {
	rng;

	players = $state(createDefaultPlayers());
	playerOrder = $state(['0', '1', '2']);
	activePlayerIndex = $state(0);

	dice = $state([0, 0]);
	hasRolled = $state(false);
	canRollAgain = $state(false);

	casinoOwner = $state(null);
	casinoLevel = $state(1);
	casinoMinBet = $state(100);

	// Trading System state
	activeTrade = $state(null);
	tradeHistory = $state([]);
	
	messages = $state([]);
	messageCounter = $state(0);

	bigNotifications = $state([]);
	notificationCounter = $state(0);

	pendingUpgradePosition = $state(null);

	properties = $state(createDefaultProperties());

	activePlayerId = $derived(this.playerOrder[this.activePlayerIndex] ?? this.playerOrder[0]);
	activePlayer = $derived(this.players[this.activePlayerId]);

	constructor(rng = defaultRng()) {
		this.rng = rng;
	}

	rollDice(playerId = this.activePlayerId) {
		if (this.hasRolled) {
			return { ok: false, error: 'Player already rolled this turn' };
		}

		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}

		const roll = this.getDiceRoll();
		this.dice = [roll.die1, roll.die2];

		if (roll.isDoubles) {
			player.doublesCount += 1;
			this.addMessage(`DOUBLES (${roll.die1}, ${roll.die2}) - ${player.doublesCount}/3`, 'info');
			if (player.doublesCount >= 3) {
				player.inJail = true;
				player.jailTurns = 0;
				player.doublesCount = 0;
				this.addBigNotification('Go To Jail', `Player ${playerId} rolled 3 doubles in a row`, 'POLICE', 'warning', 5000);
				this.hasRolled = true;
				this.canRollAgain = false;
				return { ok: true };
			}
		} else {
			player.doublesCount = 0;
		}

		if (player.inJail) {
			player.jailTurns += 1;
			this.addMessage(`Player ${playerId} is in jail - attempt ${player.jailTurns}/3`, 'warning');

			if (roll.isDoubles) {
				player.inJail = false;
				player.jailTurns = 0;
				player.doublesCount = 1;
				this.addMessage(`Player ${playerId} rolled doubles and leaves jail`, 'success');
			} else if (player.jailTurns >= 3) {
				player.money -= JAIL_FEE;
				player.inJail = false;
				player.jailTurns = 0;
				this.addMessage(`Player ${playerId} paid $${JAIL_FEE} and leaves jail`, 'warning');
			} else {
				this.addMessage(`Player ${playerId} remains in jail`, 'info');
				this.hasRolled = true;
				this.canRollAgain = false;
				return { ok: true };
			}
		}

		this.applyPlayerMovement(playerId, roll.sum);
		this.resolveTile(playerId);
		if (player.inJail && player.jailTurns === 0) {
			this.hasRolled = true;
			this.canRollAgain = false;
			this.addMessage(`Player ${playerId} goes to jail - turn ends`, 'warning');
			return { ok: true };
		}

		if (roll.isDoubles && !player.inJail) {
			this.hasRolled = false;
			this.canRollAgain = true;
			this.addMessage(`Player ${playerId} may roll again`, 'info');
		} else {
			this.hasRolled = true;
			this.canRollAgain = false;
		}

		return { ok: true };
	}

	buyProperty(playerId = this.activePlayerId) {
		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}

		const position = player.position;
		const property = this.properties[position];
		if (!property) {
			return { ok: false, error: `No property for position ${position}` };
		}
		if (property.owner !== null) {
			return { ok: false, error: `${property.name} is already owned by player ${property.owner}` };
		}
		if (player.money < property.price) {
			return { ok: false, error: `Not enough money to buy ${property.name}` };
		}

		player.money -= property.price;
		property.owner = playerId;
		player.properties.push(position);

		this.addMessage(`Player ${playerId} bought ${property.name} for $${property.price}`, 'success');
		if (this.hasMonopoly(playerId, property.color)) {
			this.addBigNotification('Monopoly', `Player ${playerId} now owns the full ${property.color} group`, 'TROPHY', 'special', 4000);
		}
		return { ok: true };
	}

	buyCasino(playerId = this.activePlayerId) {
		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}
		if (player.position !== CASINO_TILE) {
			return { ok: false, error: 'Player must stand on casino tile' };
		}
		if (this.casinoOwner !== null) {
			return { ok: false, error: `Casino already owned by player ${this.casinoOwner}` };
		}
		if (player.money < CASINO_PRICE) {
			return { ok: false, error: `Not enough money to buy casino (need ${CASINO_PRICE})` };
		}

		player.money -= CASINO_PRICE;
		this.casinoOwner = playerId;
		this.addMessage(`Player ${playerId} bought casino for $${CASINO_PRICE}`, 'success');
		this.addBigNotification('Casino Bought', `Player ${playerId} is now casino owner`, 'CASINO', 'special', 3500);
		return { ok: true };
	}

	gamble(betAmount, playerId = this.activePlayerId) {
		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}
		if (player.position !== CASINO_TILE) {
			return { ok: false, error: 'Player must be on casino tile' };
		}
		if (!Number.isFinite(betAmount) || betAmount < this.casinoMinBet) {
			return { ok: false, error: `Minimum bet is $${this.casinoMinBet}` };
		}
		if (player.money < betAmount) {
			return { ok: false, error: `Not enough money for bet $${betAmount}` };
		}

		const winPercent = 15 - (this.casinoLevel - 1) * 3.5;
		const lossPercent = 15 + (this.casinoLevel - 1) * 7.5;
		const win = this.rng.die(6) > 3;

		if (win) {
			const winAmount = toInt(betAmount * 2);
			player.money += winAmount;
			if (this.casinoOwner !== null && this.casinoOwner !== playerId) {
				const ownerLoss = Math.floor(winAmount * (winPercent / 100));
				this.players[this.casinoOwner].money -= ownerLoss;
			}
			this.addBigNotification('Casino Win', `Player ${playerId} won $${winAmount}`, 'CASINO', 'success', 2500);
		} else {
			const intBet = toInt(betAmount);
			player.money -= intBet;
			if (this.casinoOwner !== null && this.casinoOwner !== playerId) {
				const ownerBonus = Math.floor(intBet * (lossPercent / 100));
				this.players[this.casinoOwner].money += ownerBonus;
			}
			this.addBigNotification('Casino Loss', `Player ${playerId} lost $${intBet}`, 'CASINO', 'warning', 2500);
		}

		return { ok: true };
	}

	upgradeCasino(playerId = this.activePlayerId) {
		if (this.casinoOwner !== playerId) {
			return { ok: false, error: 'Only casino owner can upgrade' };
		}
		if (this.casinoLevel >= 5) {
			return { ok: false, error: 'Casino already max level' };
		}

		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}

		const upgradeCost = this.casinoLevel * 300;
		if (player.money < upgradeCost) {
			return { ok: false, error: `Upgrade costs $${upgradeCost}` };
		}

		player.money -= upgradeCost;
		this.casinoLevel += 1;
		this.casinoMinBet = this.casinoLevel * 50;
		this.addMessage(`Casino upgraded to level ${this.casinoLevel}. New min bet: $${this.casinoMinBet}`, 'success');
		return { ok: true };
	}

	buildHouse(position, playerId = this.activePlayerId) {
		const property = this.properties[position];
		const player = this.players[playerId];
		if (!property || !player) {
			return { ok: false, error: 'Invalid player or property' };
		}
		if (property.owner !== playerId) {
			return { ok: false, error: `Player ${playerId} does not own ${property.name}` };
		}
		if (property.color === 'utility') {
			return { ok: false, error: 'Utility cannot be upgraded' };
		}
		if (property.houses >= 5) {
			return { ok: false, error: `${property.name} already has max houses/hotel` };
		}
		if (!this.hasMonopoly(playerId, property.color)) {
			return { ok: false, error: `Monopoly required for ${property.color}` };
		}
		if (player.money < property.houseCost) {
			return { ok: false, error: `Not enough money, need ${property.houseCost}` };
		}

		player.money -= property.houseCost;
		property.houses += 1;
		this.addMessage(`Player ${playerId} upgraded ${property.name} to level ${property.houses}`, 'success');
		return { ok: true };
	}

	sellHouse(position, playerId = this.activePlayerId) {
		const property = this.properties[position];
		const player = this.players[playerId];
		if (!property || !player) {
			return { ok: false, error: 'Invalid player or property' };
		}
		if (property.owner !== playerId) {
			return { ok: false, error: `Player ${playerId} does not own ${property.name}` };
		}
		if (property.houses === 0) {
			return { ok: false, error: `${property.name} has no house/hotel to sell` };
		}

		const refund = Math.floor(property.houseCost / 2);
		property.houses -= 1;
		player.money += refund;
		this.addMessage(`Player ${playerId} sold one building on ${property.name} for $${refund}`, 'warning');
		return { ok: true };
	}

	payJailFee(playerId = this.activePlayerId) {
		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}
		if (!player.inJail) {
			return { ok: false, error: `Player ${playerId} is not in jail` };
		}
		if (player.money < JAIL_FEE) {
			return { ok: false, error: 'Not enough money to pay jail fee' };
		}

		player.money -= JAIL_FEE;
		player.inJail = false;
		player.jailTurns = 0;
		this.addMessage(`Player ${playerId} paid $${JAIL_FEE} and left jail`, 'success');
		return { ok: true };
	}

	// ==========================================
	// TRADING SYSTEM
	// ==========================================

	/**
	 * Creates a new draft trade or proposes it directly.
	 * Updates the `activeTrade` object.
	 */
	proposeTrade(
		targetPlayerId,
		offeredMoney,
		offeredProperties,
		offeredCards,
		requestedMoney,
		requestedProperties,
		message,
		fromPlayerId = this.activePlayerId
	) {
		if (targetPlayerId === fromPlayerId) {
			return { ok: false, error: 'Player cannot trade with self' };
		}
		if (!this.players[targetPlayerId] || !this.players[fromPlayerId]) {
			return { ok: false, error: 'Invalid trade player id' };
		}

		const validation = this.validateTradeItems(
			fromPlayerId,
			targetPlayerId,
			offeredMoney,
			offeredProperties,
			offeredCards,
			requestedMoney,
			requestedProperties
		);

		if (!validation.ok) {
			return validation;
		}

		this.activeTrade = {
			senderId: fromPlayerId,
			receiverId: targetPlayerId,
			offeredMoney: Math.max(0, toInt(offeredMoney)),
			requestedMoney: Math.max(0, toInt(requestedMoney)),
			offeredProperties: [...offeredProperties],
			requestedProperties: [...requestedProperties],
			offeredCards: [...(offeredCards || [])],
			message: message || '',
			status: 'pending', // pending, accepted, rejected, counter_offered
			timestamp: Date.now()
		};

		this.addMessage(`Player ${fromPlayerId} proposed a trade to ${targetPlayerId}`, 'info');
		this.addBigNotification(
			'New Trade Offer',
			`Player ${fromPlayerId} sent you a trade proposal!`,
			'🤝',
			'special',
			5000
		);
		return { ok: true };
	}

	validateTradeItems(fromId, toId, offMoney, offProps, offCards, reqMoney, reqProps) {
		const fromPlayer = this.players[fromId];
		const toPlayer = this.players[toId];

		if (offMoney > fromPlayer.money) {
			return { ok: false, error: "Sender doesn't have enough money." };
		}
		if (reqMoney > toPlayer.money) {
			return { ok: false, error: "Receiver doesn't have enough money." };
		}

		for (const pos of offProps) {
			if (this.properties[pos]?.owner !== fromId) return { ok: false, error: `Sender doesn't own property ${pos}.` };
		}
		for (const pos of reqProps) {
			if (this.properties[pos]?.owner !== toId) return { ok: false, error: `Receiver doesn't own property ${pos}.` };
		}

		// Cards validation (inventory)
		if (offCards && offCards.length > 0) {
			for (const c of offCards) {
				const hasCard = fromPlayer.inventory?.some(invC => invC.eventId === c.eventId);
				if (!hasCard) {
					return { ok: false, error: `Sender doesn't have card ${c.name}.` };
				}
			}
		}

		return { ok: true };
	}

	acceptTrade(playerId = this.activePlayerId) {
		if (!this.activeTrade || this.activeTrade.status !== 'pending') {
			return { ok: false, error: 'No pending trade to accept.' };
		}
		const trade = this.activeTrade;

		if (trade.receiverId !== playerId) {
			return { ok: false, error: 'Only the receiver can accept this trade.' };
		}

		// Re-validate in case states changed while trade was pending
		const validation = this.validateTradeItems(
			trade.senderId,
			trade.receiverId,
			trade.offeredMoney,
			trade.offeredProperties,
			trade.offeredCards,
			trade.requestedMoney,
			trade.requestedProperties
		);

		if (!validation.ok) {
			this.activeTrade.status = 'invalid';
			return validation;
		}

		const fromP = this.players[trade.senderId];
		const toP = this.players[trade.receiverId];

		// Exchange Money
		if (trade.offeredMoney > 0) {
			fromP.money -= trade.offeredMoney;
			toP.money += trade.offeredMoney;
		}
		if (trade.requestedMoney > 0) {
			toP.money -= trade.requestedMoney;
			fromP.money += trade.requestedMoney;
		}

		// Exchange Properties
		for (const pos of trade.offeredProperties) {
			this.transferProperty(pos, trade.senderId, trade.receiverId);
		}
		for (const pos of trade.requestedProperties) {
			this.transferProperty(pos, trade.receiverId, trade.senderId);
		}

		// Exchange Cards
		if (trade.offeredCards && trade.offeredCards.length > 0) {
			for (const c of trade.offeredCards) {
				const idx = fromP.inventory.findIndex(invC => invC.eventId === c.eventId);
				if (idx !== -1) {
					const [removed] = fromP.inventory.splice(idx, 1);
					toP.inventory.push(removed);
				}
			}
		}

		trade.status = 'accepted';
		this.tradeHistory.push({ ...trade });
		this.activeTrade = null;

		this.addMessage(`Trade accepted between ${trade.senderId} and ${trade.receiverId}!`, 'success');
		return { ok: true };
	}

	rejectTrade(playerId = this.activePlayerId) {
		if (!this.activeTrade || this.activeTrade.status !== 'pending') {
			return { ok: false, error: 'No pending trade to reject.' };
		}
		if (this.activeTrade.receiverId !== playerId && this.activeTrade.senderId !== playerId) {
			return { ok: false, error: 'Not part of this trade.' };
		}

		this.activeTrade.status = 'rejected';
		this.tradeHistory.push({ ...this.activeTrade });
		this.activeTrade = null;

		this.addMessage(`Trade was rejected by player ${playerId}`, 'warning');
		return { ok: true };
	}

	counterOffer(
		offeredMoney,
		offeredProperties,
		offeredCards,
		requestedMoney,
		requestedProperties,
		message,
		playerId = this.activePlayerId
	) {
		if (!this.activeTrade || this.activeTrade.status !== 'pending') {
			return { ok: false, error: 'No active trade to counter.' };
		}

		// Swap sender & receiver
		const originalSender = this.activeTrade.senderId;
		const originalReceiver = this.activeTrade.receiverId;

		if (playerId !== originalReceiver) {
			return { ok: false, error: 'Only the receiver can counter offer.' };
		}

		// Re-propose the swapped trade
		return this.proposeTrade(
			originalSender, 
			offeredMoney,
			offeredProperties,
			offeredCards,
			requestedMoney,
			requestedProperties,
			message,
			originalReceiver
		);
	}

	cancelTrade() {
		this.activeTrade = null;
	}

	// ==========================================

	removeNotification(notificationId) {
		const before = this.bigNotifications.length;
		this.bigNotifications = this.bigNotifications.filter((item) => item.id !== notificationId);
		return before === this.bigNotifications.length
			? { ok: false, error: `Notification ${notificationId} not found` }
			: { ok: true };
	}

	endTurn() {
		if (!this.hasRolled) {
			return { ok: false, error: 'Cannot end turn before rolling dice' };
		}

		this.hasRolled = false;
		this.canRollAgain = false;
		this.activePlayerIndex = (this.activePlayerIndex + 1) % this.playerOrder.length;
		return { ok: true };
	}

	clearOldNotifications(now = Date.now()) {
		this.bigNotifications = this.bigNotifications.filter((item) => {
			if (item.duration <= 0 || item.type === 'manual') {
				return true;
			}
			return now - item.timestamp < item.duration;
		});
	}

	getDiceRoll() {
		const die1 = this.rng.die(6);
		const die2 = this.rng.die(6);
		return {
			die1,
			die2,
			sum: die1 + die2,
			isDoubles: die1 === die2
		};
	}

	applyPlayerMovement(playerId, steps) {
		const player = this.players[playerId];
		if (!player) {
			return;
		}

		const oldPosition = player.position;
		const movedPosition = oldPosition + steps;
		if (movedPosition >= BOARD_SIZE) {
			player.money += START_REWARD_PASS;
		}
		player.position = movedPosition % BOARD_SIZE;

		if (player.position === 0) {
			player.money += START_REWARD_LAND;
		}
	}

	resolveTile(playerId) {
		const player = this.players[playerId];
		if (!player) {
			return;
		}

		const tile = player.position;

		if (tile === JAIL_TILE) {
			player.inJail = true;
			player.jailTurns = 0;
			this.addBigNotification('Jail', `Player ${playerId} landed on jail tile`, 'POLICE', 'warning', SPECIAL_NOTIFICATION_DURATION);
			return;
		}
		if (TAX_TILES.includes(tile)) {
			player.money -= TAX_AMOUNT;
			this.addBigNotification('Tax', `Player ${playerId} paid tax $${TAX_AMOUNT}`, 'TAX', 'warning', SPECIAL_NOTIFICATION_DURATION);
			return;
		}
		if (tile === 30) {
			this.addBigNotification('Special Tile', `Player ${playerId} landed on island tile`, 'ISLAND', 'special', SPECIAL_NOTIFICATION_DURATION);
			return;
		}
		if (EVENT_TILES.includes(tile)) {
			// Zavolej event system když hráč padne na event tile
			this.triggerEvent(playerId);
			return;
		}
		if (tile === CASINO_TILE) {
			this.resolveCasinoLanding(playerId);
			return;
		}

		const property = this.properties[tile];
		if (property) {
			this.resolvePropertyLanding(playerId, property, tile);
		}
	}

	resolveCasinoLanding(playerId) {
		if (this.casinoOwner === null) {
			this.addMessage('Casino is for sale for $500', 'info');
			return;
		}

		const player = this.players[playerId];
		if (!player) {
			return;
		}

		const minBet = this.casinoMinBet;
		if (player.money < minBet) {
			this.addMessage(`Player ${playerId} has insufficient money for mandatory casino bet`, 'warning');
			return;
		}

		const winPercent = 15 - (this.casinoLevel - 1) * 2.5;
		const lossPercent = 15 + (this.casinoLevel - 1) * 10;
		const win = this.rng.die(6) > 4;

		if (win) {
			const winAmount = minBet * 2;
			player.money += winAmount;
			if (this.casinoOwner !== playerId) {
				const ownerLoss = Math.floor(winAmount * (winPercent / 100));
				this.players[this.casinoOwner].money -= ownerLoss;
			}
			this.addBigNotification('Casino Win', `Player ${playerId} won $${winAmount}`, 'CASINO', 'success', 5000);
		} else {
			player.money -= minBet;
			if (this.casinoOwner !== playerId) {
				const ownerBonus = Math.floor(minBet * (lossPercent / 100));
				this.players[this.casinoOwner].money += ownerBonus;
			}
			this.addBigNotification('Casino Loss', `Player ${playerId} lost $${minBet}`, 'CASINO', 'warning', 5000);
		}
	}

	resolvePropertyLanding(playerId, property, position) {
		if (property.owner === null) {
			this.addMessage(`${property.name} is available for $${property.price}`, 'info');
			return;
		}
		if (property.owner === playerId) {
			this.pendingUpgradePosition = position;
			this.addBigNotification('Your Property', `You landed on ${property.name}. Want to upgrade?`, 'HOME', 'manual', 0);
			this.addMessage(`You landed on your own property ${property.name}`, 'success');
			return;
		}

		let rent = property.rent;
		if (property.houses > 0) {
			rent = property.houses === 5 ? property.rent * 5 : property.rent * (1 + property.houses * 0.5);
		}
		if (this.hasMonopoly(property.owner, property.color)) {
			rent *= 2;
		}

		rent = Math.floor(rent);
		this.players[playerId].money -= rent;
		this.players[property.owner].money += rent;
		
		const ownerName = `Player ${property.owner}`;
		this.addBigNotification(
			'Rent Paid', 
			`You paid $${rent} to ${ownerName} for ${property.name}`,
			'MONEY',
			'warning',
			5000
		);
		this.addMessage(
			`Player ${playerId} paid $${rent} rent to player ${property.owner} for ${property.name}`,
			'warning'
		);
	}

	hasMonopoly(playerId, color) {
		const colorProperties = Object.entries(this.properties)
			.filter(([, property]) => property.color === color)
			.map(([position]) => Number.parseInt(position, 10));

		if (colorProperties.length === 0) {
			return false;
		}

		const owned = new Set(this.players[playerId]?.properties ?? []);
		return colorProperties.every((position) => owned.has(position));
	}

	transferProperty(position, fromPlayerId, toPlayerId) {
		const property = this.properties[position];
		const from = this.players[fromPlayerId];
		const to = this.players[toPlayerId];
		if (!property || !from || !to) {
			return;
		}

		property.owner = toPlayerId;
		from.properties = from.properties.filter((item) => item !== position);
		if (!to.properties.includes(position)) {
			to.properties.push(position);
		}
	}

	addMessage(text, type = 'info') {
		const message = {
			id: this.messageCounter++,
			text,
			type,
			timestamp: Date.now()
		};
		this.messages.push(message);
		if (this.messages.length > MAX_MESSAGES) {
			this.messages = this.messages.slice(-MAX_MESSAGES);
		}
		console.log(text);
	}

	addBigNotification(title, description, icon, type = 'info', duration = 5000) {
		const notification = {
			id: this.notificationCounter++,
			title,
			description,
			icon,
			type,
			duration,
			timestamp: Date.now()
		};

		this.bigNotifications.push(notification);
		if (this.bigNotifications.length > MAX_NOTIFICATIONS) {
			this.bigNotifications = this.bigNotifications.slice(-MAX_NOTIFICATIONS);
		}
		this.addMessage(`${icon} ${title}: ${description}`, type === 'manual' ? 'info' : type);
	}

	/**
	 * EVENT SYSTEM - Vylosuje a spustí náhodnou kartu/event
	 * 
	 * Logika:
	 * - INSTANT: Ihned se spustí (peníze, vězení, efekty)
	 * - INVENTORY: Přidá se hráči do ruky (zahraje se později)
	 * - WORLD_EFFECT: Globální změna stavu hry (změní se políčka, ceny, etc)
	 * 
	 * @param {String} playerId - ID hráče, který spustil event
	 * @returns {Object} Event výsledek { event, result }
	 */
	triggerEvent(playerId = this.activePlayerId) {
		const player = this.players[playerId];
		if (!player) {
			return { ok: false, error: `Player ${playerId} does not exist` };
		}

		// Vylosuj náhodnou kartu
		const drawnEvent = drawRandomEvent(this.rng);

		// Zpracuj podle typu
		if (drawnEvent.type === 'INSTANT' || drawnEvent.type === 'WORLD_EFFECT') {
			// Okamžité efekty - spusť ihned
			drawnEvent.execute(this, playerId);
			this.addMessage(
				`Event: ${drawnEvent.emoji} ${drawnEvent.name} - ${drawnEvent.description}`,
				'special'
			);
			return {
				ok: true,
				event: drawnEvent,
				type: drawnEvent.type,
				result: 'executed'
			};
		} else if (drawnEvent.type === 'INVENTORY') {
			// Karta do ruky - uložit pro pozdější použití
			if (!player.inventory) {
				player.inventory = [];
			}
			player.inventory.push({
				eventId: drawnEvent.id,
				name: drawnEvent.name,
				description: drawnEvent.description,
				emoji: drawnEvent.emoji,
				execute: drawnEvent.execute,
				acquiredAt: Date.now()
			});

			this.addMessage(
				`Event Card: ${drawnEvent.emoji} ${drawnEvent.name}`,
				'info'
			);

			this.addBigNotification(
				'Event Card Drawn',
				`You got: ${drawnEvent.emoji} ${drawnEvent.name}`,
				drawnEvent.emoji,
				'info',
				3500
			);

			return {
				ok: true,
				event: drawnEvent,
				type: drawnEvent.type,
				result: 'added_to_inventory'
			};
		}

		return {
			ok: false,
			error: 'Unknown event type'
		};
	}

	/**
	 * Zahraje kartu z inventáře
	 * 
	 * @param {String} playerId - ID hráče
	 * @param {Number} inventoryIndex - Index v poli inventáře
	 * @returns {Object} Výsledek: { ok, result }
	 */
	useInventoryCard(playerId = this.activePlayerId, inventoryIndex = 0) {
		const player = this.players[playerId];
		if (!player || !player.inventory || player.inventory.length === 0) {
			return { ok: false, error: 'No cards in inventory' };
		}

		if (inventoryIndex >= player.inventory.length || inventoryIndex < 0) {
			return { ok: false, error: 'Invalid inventory index' };
		}

		const card = player.inventory[inventoryIndex];

		try {
			// Spusť execute funkcí karty
			const cardUsed = card.execute(this, playerId);

			// Odeber kartu z inventáře (pouze pokud byla skutečně použita)
			if (cardUsed !== false) {
				player.inventory.splice(inventoryIndex, 1);
				this.addMessage(
					`Card used: ${card.emoji} ${card.name}`,
					'success'
				);
				return {
					ok: true,
					result: 'card_used',
					card: card
				};
			} else {
				this.addMessage(
					`Card cannot be used right now: ${card.emoji} ${card.name}`,
					'warning'
				);
				return {
					ok: false,
					error: 'Card conditions not met',
					card: card
				};
			}
		} catch (error) {
			this.addMessage(
				`Error using card: ${error.message}`,
				'error'
			);
			return {
				ok: false,
				error: error.message,
				card: card
			};
		}
	}
}
