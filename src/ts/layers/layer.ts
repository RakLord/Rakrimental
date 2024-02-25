import { Game } from "../main";
import { Button } from "../utils";

// bind document.getElementById to $
const $ = document.getElementById.bind(document);


export class Layer {
    game: Game;
    Button: typeof Button;
    name: string;
    unlocked: boolean = false;
    cost: number;
    layerColor: string;
    milestones: { [key: string]: {[key: string]: any}; };
    milestonesUnlocked: { [key: string]: boolean; };
    milestoneFunctions: { [key: string]: () => any; };

    parentElement: HTMLElement = $('main')!;
    div: HTMLElement;
    visible: boolean = false;
    elements: { [key: string]: HTMLElement; };
    layerTitle: HTMLElement;

    keysToSave: string[] = ['name', 'unlocked', 'cost', 'layerColor', 'visible',  'milestonesUnlocked'];

    constructor(game: Game,name: string, cost: number, layerColor: string) {
        this.Button = Button;
        this.game = game;
        this.name = name;
        this.cost = cost;
        this.layerColor = layerColor;

        this.milestones = {};
        this.milestonesUnlocked = {};
        this.milestoneFunctions = {
            "test": () => {
                console.log("Test Milestone");
                console.log("End Test Milestone");
            }
        };

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
       
        this.elements = {};
    }

    tryUnlock(currentPoints: number): boolean {
        // console.log("Trying to unlock", this.name, "with", currentPoints, "/", this.cost, "points");
        if (currentPoints >= this.cost) {
            this.unlocked = true;
            console.log("Unlocked Layer", this.name);
            return true;
        } else {
            return false;
        }
    }

    toggleVisibility() {
        if (this.visible) {
            this.div.classList.add('hidden');
            this.visible = false;
        } else {
            this.div.classList.remove('hidden');
            this.visible = true;
        }
    }

    checkMilestones() {
        for (const key of Object.keys(this.milestones)) {
            const milestone = this.milestones[key];
            const unlockPoints = parseInt(milestone.unlockPoints);
            // Set unlocked to true (this is saved in the save file)
            if (this.game.highestPoints >= unlockPoints) {
                this.milestonesUnlocked[key] = true;
            }
        }
        // Loop over the unlocked milestones and add them to the div if they are not already in it
        for (const key of Object.keys(this.milestonesUnlocked)) {
            if (this.milestonesUnlocked[key]) {
                if (!this.div.contains(this.elements[key])) {
                    this.div.appendChild(this.elements[key]);
                }
            }
        }
    }

    setup() {
        for (const key of Object.keys(this.milestones)) {
            const milestone = this.milestones[key];
            this.elements[key] = this.Button.createMilestoneButton(milestone);
        }
        this.milestonesUnlocked["givePoints"] = true; // Always unlocked
        this.checkMilestones();
    }
}