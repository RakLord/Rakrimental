import { Game } from "../main";
import { Button } from "../utils";
import Decimal from 'break_infinity.js';

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

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
    constructor(name: string, text: string, unlockCost: Decimal, description: string, maxLevel: Decimal, milestoneFunctions: any, buttonContainer: HTMLElement) {
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
        if (!this.buyable) return;
        this.level = this.level.add(1);
        this.cost = this.costFormula(this);
        if (this.level.gte(this.maxLevel)) {
            this.buyable = false;
        }
    }
}


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
    milestones: { [key: string]: Milestone; };
    // milestonesUnlocked: { [key: string]: boolean; };
    milestoneFunctions: { [key: string]: any; };

    parentElement: HTMLElement = $('main')!;
    div: HTMLElement;
    visible: boolean = false;
    buttons: { [key: string]: Button; };
    constructor(game: Game,name: string, cost: Decimal, layerColor: string) {
        this.Button = Button;
        this.game = game;
        this.name = name;
        this.cost = cost;
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


    toggleVisibility(forceHide?: boolean) {
        if (forceHide) {
            if (this.div.classList.contains('hidden')) {
                this.visible = false;
                return;
            }
            else {
                this.div.classList.add('hidden');
                this.visible = false;
                return;
            }
        }
        else {
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
            if (this.highestCurrency >= unlockCost) {
                milestone.unlocked = true;
            }
        }
        // Loop over the unlocked milestones and add them to the div if they are not already in it
        for (const key of Object.keys(this.milestones)) {
            if (this.milestones[key].unlocked && this.buttons[key] !== undefined) {
                try {
                    if (!this.div.contains(this.buttons[key].button)) {
                        if (this.milestones[key].buttonContainer !== undefined) {
                            this.milestones[key].buttonContainer.appendChild(this.buttons[key].button);
                            this.milestoneFunctions[key].updateText();
                        }
                        else {
                            this.div.appendChild(this.buttons[key].button);
                            this.milestoneFunctions[key].updateText();
                        }

                    }
                }
                catch (err) {
                    console.log(key, this.milestones[key], "\n", this.buttons, this.buttons[key])
                    console.error("Error in checkMilestones", err);
                }
            }
        }
    }

    setup() {
        for (const key of Object.keys(this.milestones)) {
            const milestone = this.milestones[key];
            const milestoneButton = this.Button.createMilestoneButton(this.game, milestone);
            milestoneButton.button.addEventListener('click', () => {milestone.timesClicked = milestone.timesClicked.add(1);});
            this.buttons[key] = milestoneButton;
        }
        this.checkMilestones();
    }

    // Do not modify, its done per layer and i cba to change it :D
    update() {

    }
}