import {Layer} from './layer';
import {Game} from '../main';
import {Milestone} from './layer';
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
	dicePips: HTMLElement[];
	diceText: HTMLElement;
	constructor(game: Game, diceLayer: Dice) {
		this.game = game;
		this.diceLayer = diceLayer;

		this.diceValue = 1;
		this.diceMaxValue = 25;

		this.parentDiv = this.diceLayer.diceArrayContainer;
		this.container = document.createElement('div');
		this.diceText = document.createElement('div');
		this.diceText.classList.add('dice-text');
		this.div = document.createElement('div');
		this.div.classList.add('dice');

		this.div.addEventListener('click', this.click.bind(this));
		this.container.appendChild(this.diceText);
		this.container.appendChild(this.div);
		this.parentDiv.appendChild(this.container);

		this.diceText.textContent = this.diceValue.toString();

		this.dicePips = [];
		for (let i = 0; i < 25; i++) {
			const pip = document.createElement('div');
			pip.classList.add('dot', 'not-dot');
			this.dicePips.push(pip);
			this.div.appendChild(pip);
			// pip.textContent = i.toString();
		}

		this.diceFace(this.diceValue);
	}

	hidePips(pipsToHide: number[]) {
		for (let i = 0; i < pipsToHide.length; i++) {
			this.dicePips[pipsToHide[i]].classList.remove('not-dot');
		}
	}

	diceFace(faceValue: number) {
		this.diceText.textContent = this.diceValue.toString();
		this.dicePips.forEach((pip) => {
			pip.classList.add('not-dot');
		});

		console.log(this.dicePips);
		switch (faceValue) {
			case 1:
				this.hidePips([12]);
				break;
			case 2:
				this.hidePips([6, 18]);
				break;
			case 3:
				this.hidePips([6, 8, 17]);
				break;
			case 4:
				this.hidePips([6, 8, 16, 18]);
				break;
			case 5:
				this.hidePips([6, 8, 16, 18, 12]);
				break;
			case 6:
				this.hidePips([6, 7, 8, 16, 17, 18]);
				break;
			case 7:
				this.hidePips([6, 7, 8, 16, 17, 18, 12]);
				break;
			case 8:
				this.hidePips([6, 7, 8, 11, 16, 13, 18, 17]);
				break;
			case 9:
				this.hidePips([6, 7, 8, 11, 16, 13, 18, 17, 12]);
				break;
			case 10:
				this.hidePips([1, 5, 3, 9, 15, 21, 19, 23, 7, 17]);
				break;
			case 11:
				this.hidePips([1, 5, 3, 9, 15, 21, 19, 23, 7, 12, 17]);
				break;
			case 12:
				this.hidePips([1, 5, 3, 9, 15, 21, 19, 23, 7, 17, 11, 13]);
				break;
			case 13:
				this.hidePips([1, 5, 3, 9, 15, 21, 19, 23, 7, 17, 11, 13, 12]);
				break;
			case 14:
				this.hidePips([
					1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 11, 13,
				]);
				break;
			case 15:
				this.hidePips([
					1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 6, 12, 18,
				]);
				break;
			case 16:
				this.hidePips([
					1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 11, 13, 7, 17,
				]);
				break;
			case 17:
				this.hidePips([
					1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 6, 12, 18, 0, 24,
				]);
				break;
			case 18:
				this.hidePips([
					0, 1, 2, 3, 4, 6, 7, 8, 20, 21, 22, 23, 24, 16, 17, 18, 10,
					14,
				]);
				break;
			case 19:
				this.hidePips([
					1, 5, 3, 9, 15, 21, 19, 23, 10, 2, 14, 22, 0, 24, 20, 4, 8,
					16, 12, 8,
				]);
				break;
			case 20:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10,
					14, 11, 13,
				]);
				break;
			case 21:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 9, 20, 21, 22, 23, 24, 15, 19, 10, 14, 6,
					8, 16, 18, 12,
				]);
				break;
			case 22:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10,
					14, 6, 8, 16, 18,
				]);
				break;
			case 23:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10,
					14, 6, 8, 16, 18, 12,
				]);
				break;
			case 24:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10,
					14, 6, 8, 16, 18, 11, 13,
				]);
				break;
			case 25:
				this.hidePips([
					0, 1, 2, 3, 4, 5, 7, 9, 20, 21, 22, 23, 24, 15, 17, 19, 10,
					14, 6, 8, 16, 18, 11, 13, 12,
				]);
				break;
		}
	}

	click() {
		this.div.style.transform = 'rotate(360deg)';
		// timeout remove rotation
		setTimeout(() => {
			this.div.style.transform = 'rotate(0deg)';
		}, 500);
		this.diceValue = Math.floor(Math.random() * this.diceMaxValue) + 1;
		this.diceFace(this.diceValue);

		// roll the dice
	}
}

export class Dice extends Layer {
	diceArrayContainer: HTMLElement;
	diceCount: number;
	diceCountCap: number;
	diceArray: SingleDice[];

	constructor(game: Game) {
		super(game, 'dice', new Decimal(1e15), 'white');
		this.layerColor = 'blue';

		this.currencyName = 'Pips';
		this.currency = new Decimal(0);
		this.highestCurrency = new Decimal(0);

		this.diceArrayContainer = document.createElement('div');
		this.diceArrayContainer.classList.add('dice-container');
		this.div.appendChild(this.diceArrayContainer);

		this.diceCount = 1;
		this.diceCountCap = 3;

		this.diceArray = [];

		this.milestoneFunctions = {
			addDice: {
				activate: () => {
					this.milestoneFunctions.addDice.update();
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
				update: () => {},
				updateText: () => {},
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
				this.div,
			),
		};

		this.init();
		this.setup();
	}

	init() {
		this.diceArray.push(new SingleDice(this.game, this));
	}

	update() {}
}
