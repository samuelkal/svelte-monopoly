/**
 * EVENT DATABASE - Systém karet náhody a světových změn
 * 
 * Architektura:
 * - INSTANT: Spustí se okamžitě (peníze, vězení, teleportace)
 * - INVENTORY: Hráč si vezme kartu do ruky a zahraje ji později
 * - WORLD_EFFECT: Globální změna herního stavu (změna mapy, vlastnosti políčka)
 */

export const EVENTS = [
	// ===== INSTANT EVENTS (Okamžitý efekt) =====
	
	{
		id: 'instant_lucky_find',
		name: '💰 Štěstí na cestě',
		description: 'Našli jste peníze. Získejte $200!',
		type: 'INSTANT',
		emoji: '💰',
		execute: (engine, playerId) => {
			engine.players[playerId].money += 200;
			engine.addMessage(`Player ${playerId} found $200!`, 'success');
			engine.addBigNotification(
				'Lucky Find',
				'You found $200 on the street!',
				'💰',
				'success',
				3000
			);
		}
	},

	{
		id: 'instant_loose_tax',
		name: '💸 Daňový podvod',
		description: 'Chyba v daňové přiznání - zaplaťte $150!',
		type: 'INSTANT',
		emoji: '💸',
		execute: (engine, playerId) => {
			engine.players[playerId].money -= 150;
			engine.addMessage(`Player ${playerId} paid tax penalty $150!`, 'warning');
			engine.addBigNotification(
				'Tax Penalty',
				'You owe $150 in back taxes!',
				'💸',
				'warning',
				3000
			);
		}
	},

	{
		id: 'instant_jail_teleport',
		name: '🚓 Přímá do vězení',
		description: 'Jděte přímo do vězení. Nesbírejte GO. Nezískejte $200.',
		type: 'INSTANT',
		emoji: '🚓',
		execute: (engine, playerId) => {
			const player = engine.players[playerId];
			player.position = 10; // Jail tile
			player.inJail = true;
			player.jailTurns = 0;
			engine.addMessage(`Player ${playerId} sent to Jail!`, 'warning');
			engine.addBigNotification(
				'Go To Jail',
				'Go directly to jail. Do not pass GO.',
				'🚓',
				'warning',
				3000
			);
		}
	},

	{
		id: 'instant_lottery_win',
		name: '🎰 Výhra v loterii',
		description: 'Vyhráli jste v loterii! Získejte $500!',
		type: 'INSTANT',
		emoji: '🎰',
		execute: (engine, playerId) => {
			engine.players[playerId].money += 500;
			engine.addMessage(`Player ${playerId} won $500 in lottery!`, 'success');
			engine.addBigNotification(
				'Lottery Win',
				'You won $500 in the lottery!',
				'🎰',
				'success',
				4000
			);
		}
	},

	{
		id: 'instant_teleport_go',
		name: '🚀 Teleportace na START',
		description: 'Magická teleportace na START a bonus $100!',
		type: 'INSTANT',
		emoji: '🚀',
		execute: (engine, playerId) => {
			const player = engine.players[playerId];
			player.position = 0; // GO tile
			player.money += 100;
			engine.addMessage(`Player ${playerId} teleported to GO and gained $100!`, 'success');
			engine.addBigNotification(
				'Teleport',
				'Magic teleport to START + $100!',
				'🚀',
				'success',
				3000
			);
		}
	},

	// ===== INVENTORY EVENTS (Karty do ruky) =====

	{
		id: 'inventory_jail_free_pass',
		name: '🎫 Svobodná karta z vězení',
		description: 'Můžete uniknout z vězení zdarma. Zahraje se když budete v base vězení.',
		type: 'INVENTORY',
		emoji: '🎫',
		execute: (engine, playerId) => {
			const player = engine.players[playerId];
			if (player.inJail && player.jailTurns > 0) {
				player.inJail = false;
				player.jailTurns = 0;
				engine.addMessage(`Player ${playerId} used jail free pass!`, 'success');
				engine.addBigNotification(
					'Jail Free',
					'You escaped jail free!',
					'🎫',
					'success',
					3000
				);
				return true; // Označení že byla karta použita
			}
			return false; // Karta se nepoužila (nejste v base vězení)
		}
	},

	{
		id: 'inventory_sabotage',
		name: '💣 Sabotáž soupeře',
		description: 'Zničte jednu stavbu u libovolného protivníka.',
		type: 'INVENTORY',
		emoji: '💣',
		execute: (engine, playerId) => {
			// Lze zahrát ručně přes UI - zde jen notifikace
			engine.addMessage(`Player ${playerId} can now sabotage opponent!`, 'info');
			engine.addBigNotification(
				'Sabotage Card',
				'You can destroy 1 house of any opponent!',
				'💣',
				'info',
				3000
			);
			return true;
		}
	},

	{
		id: 'inventory_double_rent',
		name: '📈 Zdvojení nájemného',
		description: 'Další hráč zaplatí zdvojené nájemné když padne na vaše políčko.',
		type: 'INVENTORY',
		emoji: '📈',
		execute: (engine, playerId) => {
			engine.addMessage(`Player ${playerId} rent will be doubled next time!`, 'success');
			engine.addBigNotification(
				'Double Rent',
				'Your rent is doubled for next landing!',
				'📈',
				'success',
				3000
			);
			return true;
		}
	},

	// ===== WORLD EFFECT EVENTS (Globální změny) =====

	{
		id: 'world_free_tibet',
		name: '🏔️ SVOBODNÝ TIBET',
		description: 'Tibet se osvobodil! Změní se z čínské skupiny na nezávislou a barvu!',
		type: 'WORLD_EFFECT',
		emoji: '🏔️',
		execute: (engine, playerId) => {
			const tibetPosition = 28; // Tibet je na pozici 38
			const tibetProperty = engine.properties[tibetPosition];
			
			if (tibetProperty) {
				// Zachraň staré údaje pro resetování
				const originalOwner = tibetProperty.owner;
				
				// Změň vlastnosti
				tibetProperty.name = '🏔️ FREE TIBET';
				tibetProperty.color = 'independent';
				tibetProperty.price = 300; // Snížená cena
				tibetProperty.rent = 30; // Snížené nájemné (rozbije monopol Číny)
				tibetProperty.houseCost = 100;
				
				engine.addMessage(
					`🏔️ WORLD EVENT: Tibet is FREE! Property changed to independent status.`,
					'special'
				);
				
				engine.addBigNotification(
					'🏔️ FREE TIBET',
					'Tibet declared independence! Property values changed!',
					'🏔️',
					'special',
					5000
				);
			}
		}
	},

	{
		id: 'world_global_recession',
		name: '📉 Globální recese',
		description: 'Celosvětová recese - všechna nájemná se sníží o 50%!',
		type: 'WORLD_EFFECT',
		emoji: '📉',
		execute: (engine, playerId) => {
			let changedCount = 0;
			
			Object.values(engine.properties).forEach((prop) => {
				if (prop.color !== 'special' && prop.color !== 'utility' && prop.rent > 0) {
					prop.rent = Math.floor(prop.rent * 0.5);
					changedCount++;
				}
			});
			
			engine.addMessage(
				`📉 GLOBAL RECESSION: All rents reduced by 50%! (${changedCount} properties affected)`,
				'warning'
			);
			
			engine.addBigNotification(
				'Global Recession',
				'All rents reduced by 50% worldwide!',
				'📉',
				'warning',
				5000
			);
		}
	},

	{
		id: 'world_building_boom',
		name: '🏗️ Stavební boom',
		description: 'Stavební boom - výstavba je levnější o 40%!',
		type: 'WORLD_EFFECT',
		emoji: '🏗️',
		execute: (engine, playerId) => {
			Object.values(engine.properties).forEach((prop) => {
				if (prop.houseCost > 0) {
					prop.houseCost = Math.floor(prop.houseCost * 0.6);
				}
			});
			
			engine.addMessage(
				`🏗️ BUILDING BOOM: House costs reduced by 40%!`,
				'success'
			);
			
			engine.addBigNotification(
				'Building Boom',
				'House construction costs reduced by 40%!',
				'🏗️',
				'success',
				4000
			);
		}
	}
];

/**
 * Vylosuje náhodnou kartu z databáze
 * @param {Random} rng - Random number generator
 * @returns {Object} Náhodná karta z EVENTS
 */
export function drawRandomEvent(rng = { die: (sides) => Math.floor(Math.random() * sides) + 1 }) {
	const randomIndex = rng.die(EVENTS.length) - 1;
	return EVENTS[randomIndex];
}

/**
 * Přefiltruje karty podle typu
 * @param {String} type - 'INSTANT' | 'INVENTORY' | 'WORLD_EFFECT'
 * @returns {Array} Filteredé karty
 */
export function getEventsByType(type) {
	return EVENTS.filter((event) => event.type === type);
}
