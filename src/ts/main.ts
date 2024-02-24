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
        for (const layer of Object.keys(this.layers)) {
            if (this.layers[layer].unlocked && !this.navBar.querySelector(`#${layer}`)) {
                const layerButton = document.createElement('button');
                layerButton.classList.add('hover:mb-1', 'font-bold');
                layerButton.setAttribute('id', layer);
                layerButton.innerText = this.layers[layer].name.toUpperCase();
                layerButton.addEventListener('click', () => this.switchLayer(layer));
                this.navBar.appendChild(layerButton);
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
        if (this.visibleLayer === layerName) return;
        this.layers[this.visibleLayer].toggleVisibility();
        this.visibleLayer = layerName;
        this.layers[this.visibleLayer].toggleVisibility();
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

    for (const key of this.keysToSave) {
        stateToSave[key] = (this as any)[key];
    }

    stateToSave["layers"] = {};

    for (const key in this.layers) {
        const layer = this.layers[key];

        stateToSave.layers[key] = stateToSave.layers[key] || {};

        // Assuming each layer has a `keysToSave` property
        for (const saveKey of layer.keysToSave) {
            stateToSave.layers[key][saveKey] = (layer as any)[saveKey];
        }

        // Special handling for milestones - save only necessary data
        stateToSave.layers[key]["milestones"] = {};
        for (const milestoneKey in layer.milestones) {
            const milestone = layer.milestones[milestoneKey];
            // Save only non-function properties, assuming functions are reconstructed on load
            stateToSave.layers[key]["milestones"][milestoneKey] = {
                ...milestone,
                function: undefined // Explicitly remove function, or alternatively, save state indicating unlocked/locked status
            };
        }
    }

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
            if (gameState) {
                for (const key of Object.keys(gameState)) {
                    if (key === 'layers') {
                        for (const layerKey of Object.keys(gameState.layers)) {
                            const layer = gameState.layers[layerKey];
                            
                        }
                    } else {
                        (this as any)[key] = gameState[key];
                    }
                }
                self = gameState;
                console.log('Game state loaded', gameState);
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
