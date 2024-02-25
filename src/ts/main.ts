import localForage from 'localforage';
import { Layer } from './layers/layer';
import { Start } from './layers/start';
import { Dice } from './layers/dice';
import { Coin } from './layers/coin';

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

export class Game {
    points: number;  // Base currency
    highestPoints: number; // Highest points ever reached
    textElements: { [key: string]: HTMLElement; }; // Hold text displays (may refactor soon)
    mainInterval: number; // Used for the main game loop - This can be decreased over time to make the game run faster
    gameTimer: number; // Holds the setInterval function for the mainInterval
    fixedInterval: number = 3000;  // Used for more process intense operations that need to be done less frequently
    fixedTimer: number; // Holds the setInterval function for the fixedInterval
    layers: { [key: string]: Layer; };
    visibleLayer: string; // Holds the name of the currently visible layer
    navBar: HTMLElement;
    keysToSave: string[] = ['points', 'visibleLayer', 'mainInterval', 'fixedInterval'];

    pointsPerClick: number;
    pointAutoDivisor: number;
    autoPointsEnabled: boolean;

    constructor() {
        console.log("Game Constructor")
        this.textElements = this.getText();
        this.navBar = $('navBar')!;
        this.mainInterval = 1000;
        this.points = 0;
        this.highestPoints = 0;
        this.layers = { 
            start: new Start(this),
            dice: new Dice(this),
            coin: new Coin(this)
        };
        this.layers.start.unlocked = true;

        this.autoPointsEnabled = false;
        this.pointAutoDivisor = 100;
        this.pointsPerClick = 1;

        this.visibleLayer = "start";

        $('save-button')!.addEventListener('click', this.save.bind(this));
        $('load-button')!.addEventListener('click', this.load.bind(this));
        $('tooltip-button')!.addEventListener('click', this.toggleTooltips.bind(this));

        this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
        this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);
        
        this.setupNav();
    }
        
    update() {
        if (this.autoPointsEnabled) {
            this.points += this.pointsPerClick / this.pointAutoDivisor;
        }
        this.textElements.points.innerText = this.points.toString();
        if (this.points > this.highestPoints) {
            this.highestPoints = this.points;
        }
    }
    
    fixedIntervalUpdate () {
        for (const layer of Object.keys(this.layers)) {
            try {
                if (!this.layers[layer].unlocked) {
                    const unlocked = this.layers[layer].tryUnlock(this.points);
                    if (unlocked) {
                        this.setupNav();
                    }
                } else {
                    this.layers[layer].checkMilestones();
                }
                
            }
            catch (err) {
                console.error("Error in fixedIntervalUpdate", err);
            }
            
        }
    }

    toggleTooltips() {
        for (const layer of Object.keys(this.layers)) {
            for (const element of Object.keys(this.layers[layer].elements)) {
                const btn = this.layers[layer].elements[element];
                if (btn.getAttribute('tooltipenabled') === 'enabled') {
                    btn.setAttribute('tooltipenabled', 'disabled');
                } else {
                    btn.setAttribute('tooltipenabled', 'enabled');
                }
            }
        }
    }

    setupNav() {
        this.navBar.innerHTML = '';
        for (const layer of Object.keys(this.layers)) {
            if (this.layers[layer].unlocked && !this.navBar.querySelector(`#${layer}`)) {
                const layerButton = document.createElement('button');
                layerButton.classList.add('hover:mb-1', 'font-bold');
                layerButton.setAttribute('id', layer);
                layerButton.innerText = this.layers[layer].name.toUpperCase();
                layerButton.addEventListener('click', () => this.switchLayer(layer));
                this.navBar.appendChild(layerButton);
                console.log("Added button for", layer)
            }
        }
        for (const button of this.navBar.children) {
            if (button.id === this.visibleLayer) {
                button.classList.add('border-b', `border-${this.layers[this.visibleLayer].layerColor}-500`);
            } else {
                button.classList.remove('border-b', `border-${this.layers[button.id].layerColor}-500`);
            }
        }
    }

    switchLayer(layerName: string) {
        console.log("Switching to layer", layerName)
        for (const layer of Object.keys(this.layers)) {
            this.layers[layer].toggleVisibility(true);
        }
        this.layers[layerName].toggleVisibility();
        for (const button of this.navBar.children) {
            if (button.id === layerName) {
                button.classList.add('border-b', `border-${this.layers[layerName].layerColor}-500`);
            } else {
                button.classList.remove('border-b', `border-${this.layers[button.id].layerColor}-500`);
            }
        }
    }
    
async save() {
    const stateToSave: { [key: string]: any } = {};

    stateToSave["points"] = this.points;
    stateToSave["visibleLayer"] = this.visibleLayer;
    stateToSave["mainInterval"] = this.mainInterval;
    stateToSave["fixedInterval"] = this.fixedInterval;
    
    stateToSave["layers"] = {
        start: {
            unlocked: this.layers.start.unlocked,
            cost: this.layers.start.cost,
            milestones: parseMilestones(this.layers.start.milestones),
        },
        dice: {
            unlocked: this.layers.dice.unlocked,
            cost: this.layers.dice.cost,
            milestones: parseMilestones(this.layers.dice.milestones),
        },
        coin: {
            unlocked: this.layers.coin.unlocked,
            cost: this.layers.coin.cost,
            milestones: parseMilestones(this.layers.coin.milestones),
        }
    };
    
    // Parse the milestones to save them, Remove the function code and reference the function by name
    function parseMilestones(milestones: { [key: string]: any }): { [key: string]: any } {
        console.log("Input", milestones)
        const parsedMilestones: { [key: string]: {} } = {};
        for (const key of Object.keys(milestones)) {
            const milestone = milestones[key];
            for (const milestoneKey of Object.keys(milestone)) {
                if (milestoneKey === 'function') {
                    milestone[milestoneKey] = milestone[milestoneKey].name;
                }
                if (milestoneKey === 'unlockPoints') {
                    milestone[milestoneKey] = parseInt(milestone[milestoneKey]);
                }
            }
            parsedMilestones[key] = milestone;
        }
        return parsedMilestones;
    };
    
    // Actually save the state
    try {
        console.log("Saving game state", stateToSave);
        await localForage.setItem("gameState", stateToSave);
    } catch (err) {
        console.error("Save failed", err);
    }
}

    async load() {
        try {
            const gameState = await localForage.getItem<any>('gameState');
            console.log("STATE LOAD: ", gameState);

            // Sets the milestones function to the actual function. This is done because the function is not saved in the save file
            function parseMilestones(thisGame: any, milestones: { [key: string]: any }): { [key: string]: any } {
                const parsedMilestones: { [key: string]: {} } = {};
                // Loop over each actual Milestone
                for (const key of Object.keys(milestones)) {
                    const milestone = milestones[key];
                    // Loop over each value in the milestone
                    for (const milestoneKey of Object.keys(milestone)) {
                        // If it is a function, set the milestone to the actual function
                        if (milestoneKey === 'function') {
                            milestone[milestoneKey] = thisGame.milestoneFunctions[milestone[milestoneKey]];
                        }
                        else milestone[milestoneKey] = milestone[milestoneKey];
                        
                    }
                    parsedMilestones[key] = milestone;
                }
                return parsedMilestones;
            };

            if (gameState) {

                this.points = gameState.points;
                this.visibleLayer = gameState.visibleLayer;
                this.mainInterval = gameState.mainInterval;
                this.fixedInterval = gameState.fixedInterval;

                this.layers.start.unlocked = gameState.layers.start.unlocked;
                this.layers.start.cost = gameState.layers.start.cost;
                this.layers.start.milestones = parseMilestones(this.layers.start, gameState.layers.start.milestones);

                this.layers.dice.unlocked = gameState.layers.dice.unlocked;
                this.layers.dice.cost = gameState.layers.dice.cost;
                this.layers.dice.milestones = parseMilestones(this.layers.dice, gameState.layers.dice.milestones);

                this.layers.coin.unlocked = gameState.layers.coin.unlocked;
                this.layers.coin.cost = gameState.layers.coin.cost;
                this.layers.coin.milestones = parseMilestones(this.layers.coin, gameState.layers.coin.milestones);

                this.setupNav();
                for (const layer of Object.keys(this.layers)) {
                    this.layers[layer].toggleVisibility(true);
                }
                this.switchLayer(this.visibleLayer);
                this.updateUI();
                

            } else {
                console.log('No saved game state to load');
                this.save(); // Save initial state if nothing to load
            }
        } catch (err) {
            console.error('Load failed', err);
        }
    }

    updateUI() {
        this.textElements.points.innerText = this.points.toString();
    }

    getText(): { [key: string]: HTMLElement; } {
        let textElements: { [key: string]: HTMLElement; };
        textElements = {
            points: $('header-text-points')!,
            pointsPerSec: $('header-text-points-per-sec')!    
        };
        return textElements;
    };
}

let game: Game;
document.addEventListener('DOMContentLoaded', function() {
    game = new Game();
    (window as any).game = game;
});
