import * as bootstrap from 'bootstrap';
import { SaveManager } from './saving';
import { Layer } from './layers/layer';
import { Start } from './layers/start';
import { Dice } from './layers/dice';
import { Coin } from './layers/coin';
import { FormulaGraph } from './graph';


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
    keyPressed: string;

    formulaGraphEnabled: boolean = false;
    displayingGraph: boolean;
    formulaGraph: FormulaGraph;

    constructor() {
        console.log("Game Constructor")
        this.saveManager = new SaveManager(this);
        this.formulaGraph = new FormulaGraph(this);
        this.displayingGraph = false;
        this.textElements = this.getText();
        this.navBar = $('navBar')!;
        this.mainInterval = 1000;
        this.points = 0;
        this.highestPoints = 0;
        this.keyPressed = '';
        this.layers = { 
            start: new Start(this),
            dice: new Dice(this),
            coin: new Coin(this)
        };

        


        this.layers.start.unlocked = true;

        this.visibleLayer = "start";
        this.tooltipsEnabled = true;

        function utilityButton(game: Game, txt: string,  func: () => any) {
            const btn = document.createElement('button');
            btn.innerText = txt;
            btn.classList.add('btn', 'btn-transparent', 'btn-hover');
            btn.addEventListener('click', func.bind(game))
            document.getElementsByClassName('utility-bar')[0]!.appendChild(btn);
        }
        utilityButton(this, 'Save', this.save);
        utilityButton(this, 'Load', this.load);
        utilityButton(this, 'Toggle Tooltips', this.toggleTooltips);
        utilityButton(this, 'Enable Graphs', this.enableGraphs);


        this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
        this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);
        
        this.setupNav();

        document.addEventListener('contextmenu', (event) => {
            event.preventDefault()
            // Can make custom right click menu if I can be bothered.
            // simulate left click
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            event.target?.dispatchEvent(clickEvent);
        });

        document.addEventListener('keydown', (event) => {
            this.keyPressed = event.key;
            switch (this.keyPressed) {
                case 'q':
                    this.points *= 10;
                    break
                
                case '1':
                    this.switchLayer('start');
                    break;
                case '2':
                    this.switchLayer('dice');
                    break;
                case '3':
                    this.switchLayer('coin');
                    break;
                case 'g':
                    this.formulaGraphEnabled = !this.formulaGraphEnabled;
                    break;

            }

        });
        document.addEventListener('keyup', (event) => {
            this.keyPressed = "";
        });   

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

    // Is called every mainInterval time (1000ms default)
    update() {
        for (const layer of Object.keys(this.layers)) {
            this.layers[layer].update();
        }
        if (this.points > this.highestPoints) {
            this.highestPoints = this.points;
        }
        this.updateUI();
    }
    
    // Is called every fixedInterval time (3000ms) - This does not decrease with game speed/upgrades.
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

    enableGraphs() {
        this.formulaGraphEnabled = !this.formulaGraphEnabled;
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
                layerButton.setAttribute('id', layer);
                layerButton.innerText = this.layers[layer].name.toUpperCase();
                layerButton.addEventListener('click', () => this.switchLayer(layer));
                this.navBar.appendChild(layerButton);
                console.log("Added button for", layer)
            }
        }
        for (const button of this.navBar.children) {
            if (button.id === this.visibleLayer) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
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
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        }
    }
        
    updateUI() {
        this.textElements.points.innerText = Math.floor(this.points).toString();
        this.textElements.pointsPerSec.innerText = this.layers.start.pointsPerSec.toFixed(2);
        this.layers.start.updatePointsText();
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

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

document.addEventListener('DOMContentLoaded', function() {
    game = new Game();
    (window as any).game = game;
    game.points= 1e16;
});
