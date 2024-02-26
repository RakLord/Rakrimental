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

    costFormula: (level: number) => number;
    activate: () => any;
    constructor(name: string, text: string, unlockPoints: number, description: string, maxLevel: number, milestoneFunctions: any) {
        this.name = name;
        this.text = text;
        this.unlockPoints = unlockPoints;
        this.unlocked = false;
        this.description = description;
        this.activate = milestoneFunctions.activate;
        this.level = 0;
        this.maxLevel = maxLevel;
        this.costFormula = milestoneFunctions.cost;
        this.cost = this.costFormula(this.level);
        this.buyable = true;
    }
    levelUp() {
        console.log("Level Up", this.level, this.maxLevel, this.buyable)
        if (!this.buyable) return;
        this.level++;
        this.cost = this.costFormula(this.level);
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
    milestones: { [key: string]: {[key: string]: any}; };
    // milestonesUnlocked: { [key: string]: boolean; };
    milestoneFunctions: { [key: string]: any; };

    parentElement: HTMLElement = $('main')!;
    div: HTMLElement;
    visible: boolean = false;
    buttons: { [key: string]: Button; };
    layerTitle: HTMLElement;
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
        this.div.classList.add('flex', 'flex-col', 'w-full', 'h-full', 'hidden');
        this.div.setAttribute('id', this.name);

        // create a title for the layer
        this.layerTitle = document.createElement('div');
        this.div.appendChild(this.layerTitle);
        this.layerTitle.innerText = this.name.toUpperCase();
        this.layerTitle.classList.add('text-2xl', 'text-center', 'mb-4', 'font-bold', 'w-full', 'border-b-2', `border-${this.layerColor}-500`);
       
        this.buttons = {};
    }

    tryUnlock(currentPoints: number): boolean {
        if (currentPoints >= this.cost) {
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
            const unlockPoints = parseInt(milestone.unlockPoints);
            // Set unlocked to true (this is saved in the save file)
            if (this.game.highestPoints >= unlockPoints) {
                milestone.unlocked = true;
            }
        }
        // Loop over the unlocked milestones and add them to the div if they are not already in it
        for (const key of Object.keys(this.milestones)) {
            if (this.milestones[key].unlocked) {
                if (!this.div.contains(this.buttons[key].button)) {
                    this.div.appendChild(this.buttons[key].button);
                    this.milestoneFunctions[key].updateText();
                }
            }
        }
    }

    setup() {
        for (const key of Object.keys(this.milestones)) {
            const milestone = this.milestones[key];
            const milestoneButton = this.Button.createMilestoneButton(milestone);
            console.log(milestoneButton.button);
            this.buttons[key] = milestoneButton;
        }
        this.checkMilestones();
    }

    update() {
        
    }
}