import {Layer} from './layer';
import {Game} from '../main';
import {Milestone} from './layer';
import Decimal from 'break_infinity.js';

function mapRange(
	x: Decimal,
	inMin: Decimal,
	inMax: Decimal,
	outMin: Decimal,
	outMax: Decimal,
) {
	return x
		.minus(inMin)
		.times(outMax.minus(outMin))
		.div(inMax.minus(inMin))
		.plus(outMin);
}
export class Start extends Layer {
	pointAutoDivisor: Decimal;
	autoPointsEnabled: boolean;
	pointsText: HTMLElement;
	lastPointsGiveText: HTMLElement;
	upgradeColumnsDiv: HTMLElement;
	upgradeColumns: HTMLElement[] = [];
	lastPointsGive: Decimal;

	constructor(game: Game) {
		super(game, 'start', new Decimal(0), 'green');
		this.currencyName = 'Points';
		this.currency = new Decimal(0);

		this.pointsText = document.createElement('h2');
		this.pointsText.classList.add('start-points-text');
		this.pointsText.textContent = `Points: ${this.currency}`;
		this.div.appendChild(this.pointsText);

		this.lastPointsGiveText = document.createElement('h3');
		this.lastPointsGiveText.classList.add('start-last-points-give-text');
		this.lastPointsGiveText.textContent = `+ 0`;
		this.div.appendChild(this.lastPointsGiveText);

		this.upgradeColumnsDiv = document.createElement('div');
		this.upgradeColumnsDiv.classList.add('start-upgrade-columns');
		this.div.appendChild(this.upgradeColumnsDiv);
		// Loop over 3 upgrade columns and add the upgrade-column class and append them to the upgradecolumnsdiv
		for (let i = 0; i < 3; i++) {
			this.upgradeColumns.push(document.createElement('div'));
			this.upgradeColumns[i].classList.add('upgrade-column');
			this.upgradeColumnsDiv.appendChild(this.upgradeColumns[i]);
		}
		this.autoPointsEnabled = false;
		this.pointAutoDivisor = new Decimal(100);
		this.lastPointsGive = new Decimal(0);

		this.milestoneFunctions = {
			givePoints: {
				activate: () => {
					this.game.layers.start.addCurrencyStack();
					this.milestoneFunctions.givePoints.update();
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const cost = new Decimal(1);
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.givePoints.updateText();
				},
				updateText: () => {
					this.buttons.givePoints.lines[0].textContent =
						this.milestones.givePoints.text;
				},
			},

			// Increase Points Per Click
			increasePointsPerClick: {
				activate: () => {
                    console.log('Activating Increase Points Per Click')
					if (
						this.currency.gte(this.game.layers.start.milestones.increasePointsPerClick.cost) && this.game.layers.start.milestones.increasePointsPerClick.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.increasePointsPerClick.cost,
						);
						this.game.layers.start.milestones.increasePointsPerClick.levelUp();
						this.milestoneFunctions.increasePointsPerClick.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
                        const lvlPlusOne = lvl.add(1);
						let cost = new Decimal(lvl.times(lvl.sqrt()));
						cost = cost.times(new Decimal(lvlPlusOne).log(10)).times(10);
                        cost = cost.add(lvlPlusOne.ln()).times(10).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.increasePointsPerClick.updateText();
				},
				updateText: () => {
					this.buttons.increasePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.increasePointsPerClick.cost}`;
					this.buttons.increasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.increasePointsPerClick.level}/${this.milestones.increasePointsPerClick.maxLevel}`;
					this.buttons.increasePointsPerClick.lines[3].textContent = `+${this.milestones.increasePointsPerClick.level.add(1)}`;
				},
			},

			// Upgrade Increase Points Per Click
			upgradeIncreasePointsPerClick: {
				activate: () => {
					if (
						this.currency.gte(
							this.game.layers.start.milestones.upgradeIncreasePointsPerClick.cost) &&
							this.game.layers.start.milestones.upgradeIncreasePointsPerClick.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.upgradeIncreasePointsPerClick.cost,
						);
						this.game.layers.start.milestones.upgradeIncreasePointsPerClick.levelUp();
						this.milestoneFunctions.upgradeIncreasePointsPerClick.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const m = new Decimal(100);
						const b = new Decimal(0.07);
						const j = new Decimal(100000);
						const n = j.div(b.times(m).sinh());
						const lvlPlusOne = lvl.add(1);
						const cost = n
							.times(b.times(lvl).sinh())
							.times(new Decimal(lvlPlusOne.ln()).times(10))
							.pow(1.3)
							.plus(150)
							.floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.upgradeIncreasePointsPerClick.updateText();
				},
				updateText: () => {
					console.log('Updating Upgrade Increase Points Per Click');
					this.buttons.upgradeIncreasePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.upgradeIncreasePointsPerClick.cost}`;
					this.buttons.upgradeIncreasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.upgradeIncreasePointsPerClick.level}/${this.milestones.upgradeIncreasePointsPerClick.maxLevel}`;
					this.buttons.upgradeIncreasePointsPerClick.lines[3].textContent = `*${this.milestones.upgradeIncreasePointsPerClick.level.add(1)}`;
				},
			},
			// Ultimate Points Per Click
			ultimatePointsPerClick: {
				activate: () => {
					if (
						this.currency.gte(this.game.layers.start.milestones.ultimatePointsPerClick.cost) &&
						this.game.layers.start.milestones.ultimatePointsPerClick.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.ultimatePointsPerClick.cost,
						);
						this.game.layers.start.milestones.ultimatePointsPerClick.levelUp();
						this.milestoneFunctions.ultimatePointsPerClick.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const cost = new Decimal(7777);
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.ultimatePointsPerClick.updateText();
				},
				updateText: () => {
					console.log('Updating Upgrade Increase Points Per Click');
					this.buttons.ultimatePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.ultimatePointsPerClick.cost}`;
					this.buttons.ultimatePointsPerClick.lines[2].textContent = `Level: ${this.milestones.ultimatePointsPerClick.level}/${this.milestones.ultimatePointsPerClick.maxLevel}`;
					this.buttons.ultimatePointsPerClick.lines[3].textContent = `*${this.milestones.ultimatePointsPerClick.level.add(1)}`;
				},
			},

			// Auto Points
			autoPoints: {
				activate: () => {
					if (
						this.currency.gte(
							this.game.layers.start.milestones.autoPoints.cost) &&
							this.game.layers.start.milestones.autoPoints.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.autoPoints.cost,
						);
						this.autoPointsEnabled = true;
						this.game.layers.start.milestones.autoPoints.levelUp();
						this.milestoneFunctions.autoPoints.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const cost = new Decimal(7777);
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.autoPoints.updateText();
				},
				updateText: () => {
					if (this.milestones.autoPoints.buyable) {
						this.buttons.autoPoints.lines[1].textContent = `Cost: ${this.milestones.autoPoints.cost}`;
					} else {
						this.buttons.autoPoints.lines[1].textContent =
							'Enabled';
						this.buttons.autoPoints.button.classList.add(
							'not-buyable',
						);
					}
				},
			},

			// Auto Points Divisor
			autoPointsDivisor: {
				activate: () => {
					if (
						this.currency.gte(
							this.game.layers.start.milestones.autoPointsDivisor.cost) &&
							this.game.layers.start.milestones.autoPointsDivisor.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.autoPointsDivisor
								.cost,
						);
						if (this.pointAutoDivisor.gte(2)) {
							this.pointAutoDivisor = this.pointAutoDivisor.sub(1);
							this.game.layers.start.milestones.autoPointsDivisor.levelUp();
							this.milestoneFunctions.autoPointsDivisor.update();
						}
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const lvlPlusOne = lvl.add(1);
						const a = new Decimal(lvlPlusOne.pow(1.3));
						const b = new Decimal(lvlPlusOne.ln()).times(1000);
						const c = new Decimal(20000);
						const cost = a.times(b).plus(c).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.autoPointsDivisor.updateText();
				},
				updateText: () => {
					this.buttons.autoPointsDivisor.lines[1].textContent = `Cost: ${this.milestones.autoPointsDivisor.cost}`;
					this.buttons.autoPointsDivisor.lines[2].textContent = `Level: ${this.milestones.autoPointsDivisor.level}/${this.milestones.autoPointsDivisor.maxLevel}`;
					this.buttons.autoPointsDivisor.lines[3].textContent = `Divisor: ${this.pointAutoDivisor}`;
				},
			},
			// Critical Points (Crit Chance)
			criticalPoints: {
				activate: () => {
					if (
						this.currency.gte(this.game.layers.start.milestones.criticalPoints.cost) &&
						this.game.layers.start.milestones.criticalPoints.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.criticalPoints
								.cost,
						);
						this.game.layers.start.milestones.criticalPoints.levelUp();
						this.milestoneFunctions.criticalPoints.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const lvlPlusOne = lvl.add(1);
						const a = new Decimal(
							lvl.pow(1.059).times(30000),
						).floor();
						const b = new Decimal(lvlPlusOne.ln()).times(10);
						const cost = a.times(b).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.criticalPoints.updateText();
				},
				updateText: () => {
					this.buttons.criticalPoints.lines[1].textContent = `Cost: ${this.milestones.criticalPoints.cost}`;
					this.buttons.criticalPoints.lines[2].textContent = `Level: ${this.milestones.criticalPoints.level}/${this.milestones.criticalPoints.maxLevel}`;
					this.buttons.criticalPoints.lines[3].textContent = `Crit Chance: ${this.milestones.criticalPoints.level}%`;
				},
			},
			// Crit Bonus (Crit reward bonus %)
			criticalBonus: {
				activate: () => {
					if (
						this.currency.gte(this.game.layers.start.milestones.criticalBonus.cost) &&
						this.game.layers.start.milestones.criticalBonus.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.criticalBonus.cost,
						);
						this.game.layers.start.milestones.criticalBonus.levelUp();
						this.milestoneFunctions.criticalBonus.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const lvlPlusOne = lvl.add(1);
						const a = new Decimal(
							lvlPlusOne.pow(1.064).times(30000),
						);
						const b = new Decimal(lvlPlusOne.ln()).times(100);
						const cost = a.times(b).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.criticalBonus.updateText();
				},
				updateText: () => {
					this.buttons.criticalBonus.lines[1].textContent = `Cost: ${this.milestones.criticalBonus.cost}`;
					this.buttons.criticalBonus.lines[2].textContent = `Level: ${this.milestones.criticalBonus.level}/${this.milestones.criticalBonus.maxLevel}`;
					this.buttons.criticalBonus.lines[3].textContent = `Crit Bonus: ${this.milestones.criticalBonus.level}%`;
				},
			},
			// Over Crit (Turn crits over 100% into BIGGGGER crits)
			overCritical: {
				activate: () => {
					if (
						this.currency.gte(this.game.layers.start.milestones.overCritical.cost) &&
						this.game.layers.start.milestones.overCritical.buyable
					) {
						this.removeCurrency(
							this.game.layers.start.milestones.overCritical.cost,
						);
						this.game.layers.start.milestones.overCritical.levelUp();
						this.milestoneFunctions.overCritical.update();
					}
				},
				cost: (
					milestone: Milestone,
					returnMax: boolean = false,
					forceLvl?: Decimal,
				): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const lvlPlusOne = lvl.add(1);
						const a = new Decimal(
							lvlPlusOne.pow(1.064).times(30000),
						);
						const b = new Decimal(lvlPlusOne.ln()).times(100);
						const cost = a.times(b).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.milestoneFunctions.overCritical.updateText();
				},
				updateText: () => {
					this.buttons.overCritical.lines[1].textContent = `Cost: ${this.milestones.overCritical.cost}`;
					this.buttons.overCritical.lines[2].textContent = `Level: ${this.milestones.overCritical.level}/${this.milestones.overCritical.maxLevel}`;
					this.buttons.overCritical.lines[3].textContent = `Over Crit: ${this.milestones.overCritical.level}`;
				},
			},
		};

		this.milestones = {
			givePoints: new Milestone(
				'givePoints',
				'Gib Points',
				new Decimal(0),
				'Give points when clicked',
				new Decimal(-1),
				this.milestoneFunctions.givePoints,
				this.div,
			),

			increasePointsPerClick: new Milestone(
				'increasePointsPerClick',
				'+PPC',
				new Decimal(10),
				'Increase points per click',
				new Decimal(10000),
				this.milestoneFunctions.increasePointsPerClick,
				this.upgradeColumns[0],
			),

			upgradeIncreasePointsPerClick: new Milestone(
				'upgradeIncreasePointsPerClick',
				'++PPC',
				new Decimal(100),
				'Increase the amount that the +PPC upgrade gives',
				new Decimal(100),
				this.milestoneFunctions.upgradeIncreasePointsPerClick,
				this.upgradeColumns[0],
			),

			ultimatePointsPerClick: new Milestone(
				'ultimatePointsPerClick',
				'Ultimate PPC',
				new Decimal(30000),
				'Makes +PPC and ++PPC bettererist',
				new Decimal(10),
				this.milestoneFunctions.ultimatePointsPerClick,
				this.upgradeColumns[0],
			),

			autoPoints: new Milestone(
				'autoPoints',
				'Automates Points',
				new Decimal(1000),
				'Give points automatically',
				new Decimal(1),
				this.milestoneFunctions.autoPoints,
				this.upgradeColumns[1],
			),

			autoPointsDivisor: new Milestone(
				'autoPointsDivisor',
				'Auto Points Divisor',
				new Decimal(10000),
				'Lowers the auto-points divider',
				new Decimal(99),
				this.milestoneFunctions.autoPointsDivisor,
				this.upgradeColumns[1],
			),

			criticalPoints: new Milestone(
				'criticalPoints',
				'Critical Points',
				new Decimal(30000),
				'Increases critical point chance',
				new Decimal(200),
				this.milestoneFunctions.criticalPoints,
				this.upgradeColumns[2],
			),

			criticalBonus: new Milestone(
				'criticalBonus',
				'Critical Bonus',
				new Decimal(50000),
				'Increases critical point bonus',
				new Decimal(1000),
				this.milestoneFunctions.criticalBonus,
				this.upgradeColumns[2],
			),

			overCritical: new Milestone(
				'overCritical',
				'Over Critical',
				new Decimal(250000),
				'Converts bonus crit chance into better crits!',
				new Decimal(2500),
				this.milestoneFunctions.overCritical,
				this.upgradeColumns[2],
			),
		};

		// Enable graphing feature per milestone.
		this.milestones.increasePointsPerClick.graphEnabled = true;
		this.milestones.upgradeIncreasePointsPerClick.graphEnabled = true;
		this.milestones.ultimatePointsPerClick.graphEnabled = true;
		this.milestones.autoPointsDivisor.graphEnabled = true;
		this.milestones.criticalPoints.graphEnabled = true;
		this.milestones.criticalBonus.graphEnabled = true;
		this.milestones.overCritical.graphEnabled = true;

		this.setup();
		this.toggleVisibility();

		//  Moves the give points button to after the points text but before the upgrades
		if (this.div.firstChild) {
			this.div.insertBefore(
				this.buttons.givePoints.button,
				this.div.children[2],
			);
		}
		this.milestoneFunctions.givePoints.update();
	}

	addCurrencyStack(rtn?: boolean) {
		let value = new Decimal(1);
		if (this.milestones.increasePointsPerClick.level.gt(0)) {
			value = value.times(
				this.milestones.increasePointsPerClick.level.add(1),
			);
		}
		if (this.milestones.upgradeIncreasePointsPerClick.level.gt(0)) {
			value = value.times(
				this.milestones.upgradeIncreasePointsPerClick.level.add(1),
			);
		}
		if (this.milestones.ultimatePointsPerClick.level.gt(0)) {
			value = value.times(
				this.milestones.ultimatePointsPerClick.level.add(1),
			);
		}
		if (this.milestones.criticalPoints.level.gt(0)) {
			const rawCritChance = this.milestones.criticalPoints.level;
			const critChance = mapRange(
				rawCritChance,
				new Decimal(1),
				new Decimal(200),
				new Decimal(1),
				new Decimal(100),
			);
			let critBonus = this.milestones.criticalBonus.level.add(1);
			const overCrit =
				this.game.layers.start.milestones.overCritical.level;
			if (rawCritChance.gt(100)) {
				if (overCrit.gt(0)) {
					critBonus = critBonus.times(overCrit);
				}
			}
			const crit = new Decimal(Math.random() * 100);
			if (critChance.gte(crit)) {
				console.log('CRIT, bonus*: ', critBonus);
				value = value.add(value.times(critBonus));
			}
		}

		if (rtn) {
			return value;
		}
		this.lastPointsGive = value;
		console.log('+', value);
		this.addCurrency(value);
	}

	addCurrency(amount: Decimal) {
		this.currency = this.currency.add(amount);
		this.updatePointsText();
	}

	removeCurrency(amount: Decimal) {
		this.currency = this.currency.sub(amount);
		this.updatePointsText();
	}

	updatePointsText() {
		this.pointsText.textContent = `Points: ${this.currency.toString()}`;
		this.lastPointsGiveText.textContent = `+ ${this.lastPointsGive}`;
	}

	update() {
		if (this.autoPointsEnabled) {
			this.addCurrency(
				this.addCurrencyStack(true)!.div(this.pointAutoDivisor),
			);
		}
	}
}
