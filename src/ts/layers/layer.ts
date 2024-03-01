import { Game } from "../main";
import { Button } from "../utils";

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

export class Milestone {
    name: string;
    text: string;
    unlockPoints: number;
    unlocked: boolean;
    description: string;
    level: number;
    cost: number;
    buyable: boolean;
    maxLevel: number;
    graphEnabled: boolean;
    hovered: boolean;
    buttonContainer: HTMLElement;
    timesClicked: number;

    costFormula: (milestone: Milestone, returnMax?: boolean, forceLvl?: number) => number;
    activate: () => any;
    constructor(name: string, text: string, unlockPoints: number, description: string, maxLevel: number, milestoneFunctions: any, buttonContainer: HTMLElement) {
        this.name = name;
        this.text = text;
        this.unlockPoints = unlockPoints;
        this.unlocked = false;
        this.description = description;
        this.activate = milestoneFunctions.activate;
        this.level = 0;
        this.maxLevel = maxLevel;
        this.costFormula = milestoneFunctions.cost;
        this.cost = this.costFormula(this);
        this.buyable = true;
        this.graphEnabled = false;
        this.hovered = false;
        this.buttonContainer = buttonContainer;
        this.timesClicked = 0;
    }

    levelUp() {
        if (!this.buyable) return;
        this.level++;
        this.cost = this.costFormula(this);
        if (this.level >= this.maxLevel) {
            this.buyable = false;
        }
    }
}


export class Layer {
    [x: string]: any;
    game: Game;
    Button: typeof Button;
    name: string;
    unlocked: boolean = false;
    cost: number;
    layerColor: string;
    milestones: { [key: string]: Milestone; };
    // milestonesUnlocked: { [key: string]: boolean; };
    milestoneFunctions: { [key: string]: any; };

    parentElement: HTMLElement = $('main')!;
    div: HTMLElement;
    visible: boolean = false;
    buttons: { [key: string]: Button; };
    constructor(game: Game,name: string, cost: number, layerColor: string) {
        this.Button = Button;
        this.game = game;
        this.name = name;
        this.cost = cost;
        this.layerColor = layerColor;

        this.milestones = {};
        this.milestoneFunctions = {};

        // create a blank div that fills the entire parent, and add it to the parent which is main
        this.div = document.createElement('div');
        this.parentElement.appendChild(this.div);
        this.div.classList.add('layer', 'hidden');
        this.div.setAttribute('id', this.name);

       
        this.buttons = {};
    }

    tryUnlock(currentPoints: number): boolean {
        if (this.unlocked) return true;
        if (currentPoints >= this.unlockPoints) {
            this.unlocked = true;
            console.log("Unlocked Layer", this.name);
            return true;
        } else {
            return false;
        }
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
            const unlockPoints = milestone.unlockPoints;
            // Set unlocked to true (this is saved in the save file)
            if (this.game.highestPoints >= unlockPoints) {
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
            milestoneButton.button.addEventListener('click', () => {milestone.timesClicked++;});
            this.buttons[key] = milestoneButton;
        }
        this.checkMilestones();
    }

    update() {

    }
}