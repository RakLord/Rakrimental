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
    autosaveInterval: number; // Used for autosaving
    autosaveTimer: number; // Holds the setInterval function for the autosaveInterval
    layers: { [key: string]: Layer; };
    visibleLayer: string; // Holds the name of the currently visible layer
    navBar: HTMLElement;
    utilityBar: HTMLElement;
    tooltipsEnabled: boolean;
    keyPressed: string;
    autoSaveEnabled: boolean;

    mouseX: number = 0;
    mouseY: number = 0;

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
        this.utilityBar = $('utilityBar')!;
        this.mainInterval = 1000;
        this.points = 0;
        this.highestPoints = 0;
        this.keyPressed = '';
        this.autoSaveEnabled = true;
        this.autosaveInterval = 30000;
        this.mouseX = 0;
        this.mouseY = 0;
        this.layers = { 
            start: new Start(this),
            dice: new Dice(this),
            coin: new Coin(this)
        };


        this.layers.start.unlocked = true;

        this.visibleLayer = "start";
        this.tooltipsEnabled = true;


        this.utilityButton(this, 'Save', this.save);
        this.utilityButton(this, 'Load', this.load);
        this.utilityButton(this, 'AutoSave', this.toggleAutoSave);
        this.utilityButton(this, 'Toggle Tooltips', this.toggleTooltips);
        this.utilityButton(this, 'Enable Graphs', this.enableGraphs);


        this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
        this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);
        this.autosaveTimer = setInterval(this.autoSave.bind(this), this.autosaveInterval);

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
                case 'm':
                    game.points= 1e16;
                    break;

            }

        });
        document.addEventListener('keyup', (event) => {
            this.keyPressed = "";
        });   
        document.addEventListener('mousemove', (event) => {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        });

    }

    utilityButton(game: Game, txt: string,  func: () => any) {
        const btn = document.createElement('button');
        btn.innerText = txt;
        btn.classList.add('btn', 'btn-transparent', 'btn-hover');
        btn.addEventListener('click', func.bind(game))
        this.utilityBar.appendChild(btn);
    }

    autoSave() {
        if (this.autoSaveEnabled) {
            if (this.points == 0) return;
            console.log("AutoSaving")
            this.save();
            const autoSaveBtn = Array.from(this.utilityBar.children).filter((child) => child.textContent === "AutoSave")[0];
            autoSaveBtn.classList.add('auto-save-on');
        } else {
            const autoSaveBtn = Array.from(this.utilityBar.children).filter((child) => child.textContent === "AutoSave")[0];
            autoSaveBtn.classList.remove('auto-save-on');
        }
    }

    save() {
        this.saveManager.save(this);
    }

    load() {
        this.saveManager.load(this);
    }

    toggleAutoSave() {
        this.autoSaveEnabled = !this.autoSaveEnabled;
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
});
