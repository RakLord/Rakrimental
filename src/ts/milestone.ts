import {Game} from './main';
import {Button} from './utils';
import Decimal from 'break_infinity.js';


export class Milestone {
	name: string;
	text: string;
	unlockCost: Decimal;
	unlocked: boolean;
	description: string;
	level: Decimal;
	cost: Decimal;
	buyable: boolean;
	maxLevel: Decimal;
	graphEnabled: boolean;
	hovered: boolean;
	buttonContainer: HTMLElement;
	timesClicked: Decimal;

	costFormula: (milestone: Milestone, returnMax?: boolean, forceLvl?: Decimal) => Decimal;
	activate: () => any;
	constructor(
		name: string,
		text: string,
		unlockCost: Decimal,
		description: string,
		maxLevel: Decimal,
		milestoneFunctions: any,
		buttonContainer: HTMLElement,
	) {
		this.name = name;
		this.text = text;
		this.unlockCost = unlockCost;
		this.unlocked = false;
		this.description = description;
		this.activate = milestoneFunctions.activate;
		this.level = new Decimal(0);
		this.maxLevel = maxLevel;
		this.costFormula = milestoneFunctions.cost;
		this.cost = this.costFormula(this);
		this.buyable = true;
		this.graphEnabled = false;
		this.hovered = false;
		this.buttonContainer = buttonContainer;
		this.timesClicked = new Decimal(0);
	}

	levelUp() {
		if (this.level.gte(this.maxLevel)) this.buyable = false;
		if (!this.buyable) return;
		this.level = this.level.add(1);
		this.cost = this.costFormula(this);
		if (this.level.gte(this.maxLevel)) {
			this.buyable = false;
		}
	}
}