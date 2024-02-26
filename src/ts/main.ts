import { SaveManager } from './saving';
import { Layer } from './layers/layer';
import { Start } from './layers/start';
import { Dice } from './layers/dice';
import { Coin } from './layers/coin';

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

export class Game {
    saveManager: SaveManager;
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

    tooltipsEnabled: boolean;


    constructor() {
        console.log("Game Constructor")
        this.saveManager = new SaveManager(this);
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



        this.visibleLayer = "start";
        this.tooltipsEnabled = true;
        $('save-button')!.addEventListener('click', this.save.bind(this));
        $('load-button')!.addEventListener('click', this.load.bind(this));
        $('tooltip-button')!.addEventListener('click', this.toggleTooltips.bind(this));

        this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
        this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);
        
        this.setupNav();
    }

    save() {
        this.saveManager.save(this);
    }

    load() {
        this.saveManager.load(this);
    }

    addPoints(points: number) {
        this.points += points;
        this.updateUI();
    }

    removePoints(points: number) {
        this.points -= points;
        this.updateUI();
    }

    update() {
        for (const layer of Object.keys(this.layers)) {
            this.layers[layer].update();
        }
        if (this.points > this.highestPoints) {
            this.highestPoints = this.points;
        }
        this.updateUI();
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
        this.tooltipsEnabled = !this.tooltipsEnabled;
        this.setTooltipsState();
    }

    setTooltipsState() {

        for (const layer of Object.keys(this.layers)) {
            for (const key of Object.keys(this.layers[layer].buttons)) {
                const btn = this.layers[layer].buttons[key];
                btn.toggleTooltip();
                // element.setAttribute('tooltipenabled', 'enabled');
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
        
    updateUI() {
        this.textElements.points.innerText = Math.floor(this.points).toString();
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
