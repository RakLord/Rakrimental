import {Layer} from './layer';
import {Game} from '../main';
import {Milestone} from '../milestone';
import {set} from 'lodash';
import Decimal from 'break_infinity.js';

export class SingleDice {
	game: Game;
	parentDiv: HTMLElement;
	container: HTMLElement;
	div: HTMLElement;
	diceLayer: Dice;
	diceValue: number; // Convert to decimal later as this is used in switch n stuff.
	diceMaxValue: number;
	diceDots: HTMLElement[];
	diceText: HTMLElement;
	constructor(game: Game, diceLayer: Dice) {
		this.game = game;
		this.diceLayer = diceLayer;

		this.diceValue = 1;
		this.diceMaxValue = 6;

		this.parentDiv = this.diceLayer.diceArrayContainer;
		this.container = document.createElement('div');
		this.diceText = document.createElement('div');
		this.diceText.classList.add('dice-text');
		this.div = document.createElement('div');
		this.div.classList.add('dice');

		this.container.appendChild(this.diceText);
		this.container.appendChild(this.div);
		this.parentDiv.appendChild(this.container);

		this.diceText.textContent = this.diceValue.toString();

		this.diceDots = [];
		for (let i = 0; i < 25; i++) {
			const dot = document.createElement('div');
			dot.classList.add('dot', 'not-dot');
			this.diceDots.push(dot);
			this.div.appendChild(dot);
			// dot.textContent = i.toString();
		}

		this.diceFace(this.diceValue);
	}

	hideDots(dotsToHide: number[]) {
		for (let i = 0; i < dotsToHide.length; i++) {
			this.diceDots[dotsToHide[i]].classList.remove('not-dot');
		}
	}

	startRoll() {
		this.div.classList.add('rotate');
	}

	completeRoll() {
		this.diceValue = Math.floor(Math.random() * this.diceMaxValue) + 1;
		this.diceFace(this.diceValue);
		this.div.classList.remove('rotate');
		return new Decimal(this.diceValue);
	}

	diceFace(faceValue: number) {
		this.diceText.textContent = this.diceValue.toString();
		this.diceDots.forEach((dot) => {
			dot.classList.add('not-dot');
		});

		switch (faceValue) {
			case 1:
				this.hideDots([12]);
				break;
			case 2:
				this.hideDots([6, 18]);
				break;
			case 3:
				this.hideDots([6, 8, 17]);
				break;
			case 4:
				this.hideDots([6, 8, 16, 18]);
				break;
			case 5:
				this.hideDots([6, 8, 16, 18, 12]);
				break;
			case 6:
				this.hideDots([6, 7, 8, 16, 17, 18]);
				break;
			case 7:
				this.hideDots([6, 7, 8, 16, 17, 18, 12]);
				break;
			case 8:
				this.hideDots([6, 7, 8, 11, 16, 13, 18, 17]);
				break;
			case 9:
				this.hideDots([6, 7, 8, 11, 16, 13, 18, 17, 12]);
				break;
			case 10:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 7, 17]);
				break;
			case 11:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 7, 12, 17]);
				break;
			case 12:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 7, 17, 11, 13]);
				break;
			case 13:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 7, 17, 11, 13, 12]);
				break;
			case 14:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 11, 13]);
				break;
			case 15:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 6, 12, 18]);
				break;
			case 16:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 11, 13, 7, 17]);
				break;
			case 17:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 6, 12, 18, 0, 24]);
				break;
			case 18:
				this.hideDots([0, 1, 2, 3, 4, 6, 7, 8, 20, 21, 22, 23, 24, 16, 17, 18, 10, 14]);
				break;
			case 19:
				this.hideDots([1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 0, 24, 20, 4, 8, 16, 12, 8]);
				break;
			case 20:
				this.hideDots([0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10, 14, 11, 13]);
				break;
			case 21:
				this.hideDots([0, 1, 2, 3, 4, 5, 9, 20, 21, 22, 23, 24, 15, 19, 10, 14, 6, 8, 16, 18, 12]);
				break;
			case 22:
				this.hideDots([0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10, 14, 6, 8, 16, 18]);
				break;
			case 23:
				this.hideDots([0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10, 14, 6, 8, 16, 18, 12]);
				break;
			case 24:
				this.hideDots([0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10, 14, 6, 8, 16, 18, 11, 13]);
				break;
			case 25:
				this.hideDots([0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10, 14, 6, 8, 16, 18, 11, 13, 12]);
				break;
		}
	}
}

export class Dice extends Layer {
	diceArrayContainer: HTMLElement;
	diceCount: number;
	diceArray: SingleDice[];
	rollTimeout: number;
	previousRollTimestamp: number;
	canRoll: boolean;
	rollArray: Decimal[];
	upgradeColumnsDiv: HTMLElement;
	upgradeColumns: HTMLElement[] = [];

	constructor(game: Game) {
		super(game, 'dice', new Decimal(1e15), 'white');
		this.layerColor = 'blue';

		this.currencyName = 'Dots';
		this.currency = new Decimal(0);
		this.highestCurrency = new Decimal(0);

		this.dotsText = document.createElement('h2');
		this.dotsText.classList.add('dots-text');
		this.dotsText.textContent = `Dots: ${this.currency}`;
		this.div.appendChild(this.dotsText);

		this.diceArrayContainer = document.createElement('div');
		this.diceArrayContainer.classList.add('dice-container');
		this.div.appendChild(this.diceArrayContainer);
		this.diceArrayContainer.addEventListener('click', this.rollDice.bind(this));

		this.upgradeColumnsDiv = document.createElement('div');
		this.upgradeColumnsDiv.classList.add('dice-upgrade-columns');
		this.div.appendChild(this.upgradeColumnsDiv);

		for (let i = 0; i < 3; i++) {
			this.upgradeColumns.push(document.createElement('div'));
			this.upgradeColumns[i].classList.add('upgrade-column');
			this.upgradeColumnsDiv.appendChild(this.upgradeColumns[i]);
		}

		this.diceCount = 1;
		this.rollTimeout = 1000;
		this.previousRollTimestamp = 0;
		this.canRoll = true;

		this.diceArray = [];
		this.rollArray = [];
		this.milestoneFunctions = {
			addDice: {
				activate: () => {
					this.buyMilestone('addDice');
					this.milestoneFunctions.addDice.update();
				},
				cost: (milestone: Milestone, returnMax: boolean = false, forceLvl?: Decimal): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const cost = new Decimal(lvl.add(1).times(25)).pow(lvl.add(1).pow(1.2)).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.diceCount = this.milestones.addDice.level.toNumber() + 1;
					this.setupDice();
					this.milestoneFunctions.addDice.updateText();
				},
				updateText: () => {
					this.buttons.addDice.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.addDice.cost)} Dots`;
					this.buttons.addDice.lines[2].textContent = `Level: ${this.milestones.addDice.level}/${this.milestones.addDice.maxLevel}`;
				},
			},
			diceTimeout: {
				activate: () => {
					this.buyMilestone('diceTimeout');
					this.milestoneFunctions.diceTimeout.update();
				},
				cost: (milestone: Milestone, returnMax: boolean = false, forceLvl?: Decimal): Decimal => {
					function calcCost(lvl: Decimal): Decimal {
						const lvlPlusOne = lvl.add(1);
						const a = new Decimal(25);
						const b = new Decimal(1.7);
						const c = new Decimal(lvlPlusOne.div(a).add(b)).sqrt();
						const cost = new Decimal(lvlPlusOne.times(a.pow(c))).floor();
						return cost;
					}

					let levelToUse = milestone.level;
					if (returnMax) levelToUse = milestone.maxLevel;
					if (forceLvl) levelToUse = forceLvl;
					return calcCost(levelToUse);
				},
				update: () => {
					this.rollTimeout = 1000 / (this.milestones.diceTimeout.level.toNumber() * 18);
					this.milestoneFunctions.diceTimeout.updateText();
				},
				updateText: () => {
					this.buttons.diceTimeout.lines[1].textContent = `Cost: ${this.game.formatValue(this.milestones.diceTimeout.cost)} Dots`;
					this.buttons.diceTimeout.lines[2].textContent = `Level: ${this.milestones.diceTimeout.level}/${this.milestones.diceTimeout.maxLevel}`;
					this.buttons.diceTimeout.lines[3].textContent = `Timeout: ${this.rollTimeout}ms`;
				},
			},
		};

		this.milestones = {
			addDice: new Milestone(
				'addDice',
				'+1 Dice',
				new Decimal(0),
				'Adds a new dice!',
				new Decimal(5),
				this.milestoneFunctions.addDice,
				this.upgradeColumns[1],
			),
			diceTimeout: new Milestone(
				'diceTimeout',
				'Dice Cooldown',
				new Decimal(100),
				'Rolls dice faster!',
				new Decimal(50),
				this.milestoneFunctions.diceTimeout,
				this.upgradeColumns[2],
			),
		};

		this.init();
		this.setup();
	}

	rollDice() {
		if (!this.canRoll) return;
		this.diceArrayContainer.classList.remove('can-roll');
		this.previousRollTimestamp = Date.now();
		this.canRoll = false;
		this.diceArray.forEach((dice) => dice.startRoll());
	}

	processRolls() {
		// this function will allow us to process using different rule sets for rolls later
		// like doubles, triples, etc.
		this.rollArray.forEach((roll) => this.addCurrency(roll));
		this.rollArray = [];
	}

	addCurrency(amount: Decimal) {
		this.currency = this.currency.add(amount);
		this.updateDotsText();
	}

	removeCurrency(amount: Decimal) {
		this.currency = this.currency.sub(amount);
		this.updateDotsText();
	}

	updateDotsText() {
		this.dotsText.textContent = `Dots: ${this.game.formatValue(this.currency)}`;
	}

	setupDice() {
		// if diceArray length is less than diceCount, add dice to fill the array
		while (this.diceArray.length < this.diceCount) {
			this.diceArray.push(new SingleDice(this.game, this));
		}
	}

	init() {
		this.setupDice();
		this.updateDotsText();
		this.update();
	}

	// TODO: This is currently ran every 1000ms (mainInterval) - This is not ideal as this will over write the
	// timeout on the dice roll, this needs to be moved to a new interval, should probably make a new one that
	// has its own interval time set to the diceTimeout upgrades value???
	update() {
		if (this.currency.gte(this.highestCurrency)) this.highestCurrency = this.currency;
		if (!this.canRoll && Date.now() >= this.previousRollTimestamp + this.rollTimeout) {
			this.diceArray.forEach((dice) => {
				this.rollArray.push(dice.completeRoll());
			});
			this.diceArrayContainer.classList.add('can-roll');
			this.canRoll = true;
			this.processRolls();
		}
	}
}
