import {Game} from '../main';
import {Button} from '../utils';
import Decimal from 'break_infinity.js';
import {Milestone} from '../milestone';

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

export class Layer {
	[x: string]: any;
	game: Game;
	currency: Decimal;
	highestCurrency: Decimal;
	currencyName: string;
	Button: typeof Button;
	name: string;
	unlocked: boolean = false;
	cost: Decimal;
	layerColor: string;
	milestones: {[key: string]: Milestone};
	// milestonesUnlocked: { [key: string]: boolean; };
	milestoneFunctions: {[key: string]: any};

	parentElement: HTMLElement = $('main')!;
	div: HTMLElement;
	visible: boolean = false;
	buttons: {[key: string]: Button};
	constructor(game: Game, name: string, cost: Decimal, layerColor: string) {
		this.Button = Button;
		this.game = game;
		this.name = name;
		this.unlockCost = cost; // Cost to show the layer
		this.cost = cost; // Cost to buy (prob deprecate soon)
		this.layerColor = layerColor;
		this.currency = new Decimal(0);
		this.highestCurrency = new Decimal(0);
		this.currencyName = 'Points';

		this.milestones = {};
		this.milestoneFunctions = {};

		// create a blank div that fills the entire parent, and add it to the parent which is main
		this.div = document.createElement('div');
		this.parentElement.appendChild(this.div);
		this.div.classList.add('layer', 'hidden');
		this.div.setAttribute('id', this.name);

		this.buttons = {};
	}

	buyMilestone(m: string) {
		const tryUpg = (): void => {
			if (this.currency.gte(this.milestones[m].cost) && this.milestones[m].buyable) {
				this.removeCurrency(this.milestones[m].cost);
				this.milestones[m].levelUp();
			}
		};
		if (this.game.keyPressed === 'Shift') {
			for (let i = 0; i < 10; i++) {
				tryUpg();
			}
		} else if (this.game.keyPressed === 'z') {
			console.log('ctrl');
			for (let i = 0; i < 10000; i++) {
				tryUpg();
			}
		} else tryUpg();

		this.milestoneFunctions[m].update();
	}

	toggleVisibility(forceHide?: boolean) {
		if (forceHide) {
			if (this.div.classList.contains('hidden')) {
				this.visible = false;
				return;
			} else {
				this.div.classList.add('hidden');
				this.visible = false;
				return;
			}
		} else {
			if (this.visible) {
				this.div.classList.add('hidden');
				this.visible = false;
			} else {
				this.div.classList.remove('hidden');
				this.visible = true;
			}
		}
	}

	checkMilestones() {
		for (const key of Object.keys(this.milestones)) {
			const milestone = this.milestones[key];
			const unlockCost = milestone.unlockCost;
			// Set unlocked to true (this is saved in the save file)
			try {
				if (!milestone) return;
				if (this.highestCurrency.gt(unlockCost)) {
					if (milestone.name === 'overCritical' && this.game.layers.start.milestones.criticalPoints.level.lte(100)) return;
					milestone.unlocked = true;
				}
			} catch (err) {
				console.error('Error in checkMilestones', err);
				console.log('Milestone: ', milestone, '\nUnlock Cost: ', unlockCost, '\nHighest Currency: ', this.highestCurrency, '\nLayer: ', this);
			}
		}
		for (const key of Object.keys(this.milestones)) {
			const milestone = this.milestones[key];
			milestone.cost = this.milestoneFunctions[key].cost(milestone);
		}

		// Loop over the unlocked milestones and add them to the div if they are not already in it
		for (const key of Object.keys(this.milestones)) {
			if (this.milestones[key].unlocked && this.buttons[key] !== undefined) {
				try {
					if (!this.div.contains(this.buttons[key].button)) {
						console.log('Adding button to div', key, this.milestones[key], this.buttons[key]);
						if (this.milestones[key].buttonContainer !== undefined) {
							this.milestones[key].buttonContainer.appendChild(this.buttons[key].button);
							this.milestoneFunctions[key].updateText();
						} else {
							this.div.appendChild(this.buttons[key].button);
							this.milestoneFunctions[key].updateText();
						}
					}
				} catch (err) {
					console.log(key, this.milestones[key], '\n', this.buttons, this.buttons[key]);
					console.error('Error in checkMilestones', err);
				}
			}
		}
	}
	setup() {
		for (const key of Object.keys(this.milestones)) {
			const milestone = this.milestones[key];
			const milestoneButton = this.Button.createMilestoneButton(this.game, milestone);
			milestoneButton.button.addEventListener('click', () => {
				milestone.timesClicked = milestone.timesClicked.add(1);
			});
			this.buttons[key] = milestoneButton;
		}
		this.checkMilestones();
	}

	// Do not modify, its done per layer and i cba to change it :D
	update() {}
}
