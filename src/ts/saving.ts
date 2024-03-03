import {Game} from './main';
import localForage from 'localforage';
import {Milestone} from './milestone';
import Decimal from 'break_infinity.js';
import {Start} from './layers/start';
import {Dice} from './layers/dice';
import {Coin} from './layers/coin';

export class SaveManager {
	game: Game;
	constructor(game: Game) {
		this.game = game;
		console.log('Save Manager Constructor');
		console.log(this.game);
	}

	async save(game: Game) {
		this.game = game;

		// Save the SETTINGS
		const settingsToSave = {
			autoLoadEnabled: this.game.settings.config.autoLoadEnabled,
			autoSaveEnabled: this.game.settings.config.autoSaveEnabled,
			tooltipsEnabled: this.game.settings.config.tooltipsEnabled,
			graphsEnabled: this.game.settings.config.graphsEnabled,
		};

		// Attempt to save the settings
		try {
			console.log('Saving settings', settingsToSave);
			await localForage.setItem('gameSettings', settingsToSave);
		} catch (err) {
			console.log('Save failed', err);
		}

		// Save the game state
		console.log('Saving game');
		console.log(this.game);
		const stateToSave: {[key: string]: any} = {};

		stateToSave['visibleLayer'] = this.game.visibleLayer;
		stateToSave['mainInterval'] = this.game.mainInterval;
		stateToSave['fixedInterval'] = this.game.fixedInterval;

		stateToSave['layers'] = {
			start: {
				unlocked: this.game.layers.start.unlocked,
				currency: this.game.layers.start.currency.toString(),
				highestCurrency: this.game.layers.start.highestCurrency.toString(),
				milestones: {
					givePoints: {
						level: this.game.layers.start.milestones.givePoints.level.toString(),
						timesClicked: this.game.layers.start.milestones.givePoints.timesClicked.toString(),
					},
					increasePointsPerClick: {
						level: this.game.layers.start.milestones.increasePointsPerClick.level.toString(),
						timesClicked: this.game.layers.start.milestones.increasePointsPerClick.timesClicked.toString(),
					},
					upgradeIncreasePointsPerClick: {
						level: this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level.toString(),
						timesClicked: this.game.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked.toString(),
					},
					ultimatePointsPerClick: {
						level: this.game.layers.start.milestones.ultimatePointsPerClick.level.toString(),
						timesClicked: this.game.layers.start.milestones.ultimatePointsPerClick.timesClicked.toString(),
					},
					autoPoints: {
						level: this.game.layers.start.milestones.autoPoints.level.toString(),
						buyable: this.game.layers.start.milestones.autoPoints.buyable,
					},
					autoPointsDivisor: {
						level: this.game.layers.start.milestones.autoPointsDivisor.level.toString(),
						timesClicked: this.game.layers.start.milestones.autoPointsDivisor.timesClicked.toString(),
					},
					betterAutoPoints: {
						level: this.game.layers.start.milestones.betterAutoPoints.level.toString(),
						timesClicked: this.game.layers.start.milestones.betterAutoPoints.timesClicked.toString(),
					},
					criticalPoints: {
						level: this.game.layers.start.milestones.criticalPoints.level.toString(),
						timesClicked: this.game.layers.start.milestones.criticalPoints.timesClicked.toString(),
					},
					criticalBonus: {
						level: this.game.layers.start.milestones.criticalBonus.level.toString(),
						timesClicked: this.game.layers.start.milestones.criticalBonus.timesClicked.toString(),
					},
					overCritical: {
						level: this.game.layers.start.milestones.overCritical.level.toString(),
						timesClicked: this.game.layers.start.milestones.overCritical.timesClicked.toString(),
					},
				},
			},
			dice: {
				unlocked: this.game.layers.dice.unlocked,
				currency: this.game.layers.dice.currency.toString(),
				highestCurrency: this.game.layers.dice.highestCurrency.toString(),
				diceCount: this.game.layers.dice.diceCount,
				diceCountCap: this.game.layers.dice.diceCountCap,
				milestones: {
					addDice: {
						level: this.game.layers.dice.milestones.addDice.level.toString(),
					},
					diceTimeout: {
						level: this.game.layers.dice.milestones.diceTimeout.level.toString(),
					},
				},
			},
			coin: {
				unlocked: this.game.layers.coin.unlocked,
				milestones: {},
			},
		};

		// Actually save the state
		try {
			console.log('Saving game state', stateToSave);
			await localForage.setItem('gameState', stateToSave);
		} catch (err) {
			console.error('Save failed', err);
		}
	}

	async loadSettings(game: Game) {
		this.game = game;

		try {
			const settings = await localForage.getItem<any>('gameSettings');
			console.log('SETTINGS LOAD', settings);
			if (settings) {
				this.game.settings.config.autoLoadEnabled = settings.autoLoadEnabled;
				this.game.settings.config.autoSaveEnabled = settings.autoSaveEnabled;
				this.game.settings.config.tooltipsEnabled = settings.tooltipsEnabled;
				this.game.settings.config.graphsEnabled = settings.graphsEnabled;
			} else {
				console.log('No saved settings to load');
			}
		} catch (err) {
			console.error('Load failed', err);
		}

		try {
			game.settings.updateCheckboxes();
		} catch (err) {
			console.log(err);
		}
	}

	async load(game: Game) {
		this.game = game;

		// Attempt to load the settings

		// Attempt to load game state
		try {
			const gameState = await localForage.getItem<any>('gameState');
			console.log('STATE LOAD: ', gameState);

			if (gameState) {
				this.game.visibleLayer = gameState.visibleLayer;
				this.game.mainInterval = gameState.mainInterval;
				this.game.fixedInterval = gameState.fixedInterval;

				// Start Layer
				console.log(gameState.layers.start.currency, typeof gameState.layers.start.currency);
				this.game.layers.start.unlocked = gameState.layers.start.unlocked;
				this.game.layers.start.currency = new Decimal(gameState.layers.start.currency);
				this.game.layers.start.highestCurrency = new Decimal(gameState.layers.start.highestCurrency);
				this.game.layers.start.highestCurrency = this.game.layers.start.highestCurrency.add(0.1);

				this.game.layers.start.milestones.givePoints.level = new Decimal(gameState.layers.start.milestones.givePoints.level);
				this.game.layers.start.milestones.givePoints.timesClicked = new Decimal(gameState.layers.start.milestones.givePoints.timesClicked);

				this.game.layers.start.milestones.increasePointsPerClick.level = new Decimal(gameState.layers.start.milestones.increasePointsPerClick.level);
				this.game.layers.start.milestones.increasePointsPerClick.timesClicked = new Decimal(
					gameState.layers.start.milestones.increasePointsPerClick.timesClicked,
				);

				this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level = new Decimal(
					gameState.layers.start.milestones.upgradeIncreasePointsPerClick.level,
				);
				this.game.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked = new Decimal(
					gameState.layers.start.milestones.upgradeIncreasePointsPerClick.timesClicked,
				);

				this.game.layers.start.milestones.ultimatePointsPerClick.level = new Decimal(gameState.layers.start.milestones.ultimatePointsPerClick.level);
				this.game.layers.start.milestones.ultimatePointsPerClick.timesClicked = new Decimal(
					gameState.layers.start.milestones.ultimatePointsPerClick.timesClicked,
				);

				this.game.layers.start.milestones.autoPoints.level = new Decimal(gameState.layers.start.milestones.autoPoints.level);
				this.game.layers.start.autoPointsEnabled = !gameState.layers.start.milestones.autoPoints.buyable;
				this.game.layers.start.milestones.autoPoints.buyable = gameState.layers.start.milestones.autoPoints.buyable;

				this.game.layers.start.milestones.autoPointsDivisor.level = new Decimal(gameState.layers.start.milestones.autoPointsDivisor.level);
				this.game.layers.start.milestones.autoPointsDivisor.timesClicked = new Decimal(
					gameState.layers.start.milestones.autoPointsDivisor.timesClicked,
				);

				this.game.layers.start.milestones.betterAutoPoints.level = new Decimal(gameState.layers.start.milestones.betterAutoPoints.level);
				this.game.layers.start.milestones.betterAutoPoints.timesClicked = new Decimal(gameState.layers.start.milestones.betterAutoPoints.timesClicked);

				this.game.layers.start.milestones.criticalPoints.level = new Decimal(gameState.layers.start.milestones.criticalPoints.level);
				this.game.layers.start.milestones.criticalPoints.timesClicked = new Decimal(gameState.layers.start.milestones.criticalPoints.timesClicked);

				this.game.layers.start.milestones.criticalBonus.level = new Decimal(gameState.layers.start.milestones.criticalBonus.level);
				this.game.layers.start.milestones.criticalBonus.timesClicked = new Decimal(gameState.layers.start.milestones.criticalBonus.timesClicked);

				this.game.layers.start.milestones.overCritical.level = new Decimal(gameState.layers.start.milestones.overCritical.level);
				this.game.layers.start.milestones.overCritical.timesClicked = new Decimal(gameState.layers.start.milestones.overCritical.timesClicked);

				// Dice Layer
				this.game.layers.dice.unlocked = gameState.layers.dice.unlocked;
				this.game.layers.dice.currency = new Decimal(gameState.layers.dice.currency);
				this.game.layers.dice.highestCurrency = new Decimal(gameState.layers.dice.highestCurrency);
				this.game.layers.dice.diceCount = gameState.layers.dice.diceCount;
				this.game.layers.dice.diceCountCap = gameState.layers.dice.diceCountCap;

				this.game.layers.dice.milestones.addDice.level = new Decimal(gameState.layers.dice.milestones.addDice.level);
				this.game.layers.dice.milestones.diceTimeout.level = new Decimal(gameState.layers.dice.milestones.diceTimeout.level);
				// Coin Layer
				this.game.layers.coin.unlocked = gameState.layers.coin.unlocked;

				this.game.setupNav();
				for (const layer of Object.keys(this.game.layers)) {
					this.game.layers[layer].toggleVisibility(true);
				}
				this.game.switchLayer(this.game.visibleLayer);
				this.game.setTooltipsState();
				// loop over each layer and update the milestones
				for (const layer of Object.keys(this.game.layers)) {
					this.game.layers[layer].checkMilestones();
				}

				//  Update milestone costs based on loaded level
				for (const layer of Object.keys(this.game.layers)) {
					for (const key of Object.keys(this.game.layers[layer].milestones)) {
						const ms = this.game.layers[layer].milestones[key];
						const msf = this.game.layers[layer].milestoneFunctions[key].cost;
						ms.cost = msf(ms);
					}
				}

				// update the text and tooltip on each milestone
				for (const layer of Object.keys(this.game.layers)) {
					for (const key of Object.keys(this.game.layers[layer].milestones)) {
						if (this.game.layers[layer].milestoneFunctions[key].update) {
							this.game.layers[layer].milestoneFunctions[key].update();
						}
					}
				}
				// this.game.layers.start.buttons.givePoints.button
				this.game.updateUI();

				this.game.layers.start.updatePointsText();
				this.game.layers.dice.updateDotsText();
			} else {
				console.log('No saved game state to load');
				this.save(this.game); // Save initial state if nothing to load
			}
		} catch (err) {
			console.error('Load failed', err);
		}
	}

	async saveExists(): Promise<boolean> {
		const value = await localForage.getItem('gameState');
		// Check not just for an object, but also ensure it's not null or undefined
		return value !== null && value !== undefined;
	}

	async deleteSave() {
		await localForage.removeItem('gameState');
	}
}
