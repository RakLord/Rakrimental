import * as bootstrap from 'bootstrap';
import {SaveManager} from './saving';
import {Layer} from './layers/layer';
import {Start} from './layers/start';
import {Dice} from './layers/dice';
import {Coin} from './layers/coin';
import {FormulaGraph} from './graph';
import {DevTools} from './devtools';
import {Settings} from './settings';
import {Help} from './help';

import Decimal from 'break_infinity.js';

export class Game {
	saveManager: SaveManager;
	settings: Settings;
	help: Help;
	devTools: DevTools;
	textElements: {[key: string]: HTMLElement}; // Hold text displays (may refactor soon)
	mainInterval: number; // Used for the main game loop - This can be decreased over time to make the game run faster
	gameTimer: number; // Holds the setInterval function for the mainInterval
	fixedInterval: number = 3000; // Used for more process intense operations that need to be done less frequently
	fixedTimer: number; // Holds the setInterval function for the fixedInterval
	autosaveTimer: number; // Holds the setInterval function for the autosaveInterval
	layers: {[key: string]: Layer};
	visibleLayer: string; // Holds the name of the currently visible layer
	navBar: HTMLElement;
	keyPressed: string;

	mouseX: number = 0;
	mouseY: number = 0;

	displayingGraph: boolean;
	formulaGraph: FormulaGraph;

	constructor() {
		console.log('Game Constructor');
		this.settings = new Settings(this);
		this.help = new Help(this);
		this.saveManager = new SaveManager(this);
		this.devTools = new DevTools(this);
		this.formulaGraph = new FormulaGraph(this);
		this.displayingGraph = false;
		this.navBar = $('navBar')!;
		this.mainInterval = 1000;
		this.keyPressed = '';
		this.mouseX = 0;
		this.mouseY = 0;
		this.layers = {
			start: new Start(this),
			dice: new Dice(this),
			coin: new Coin(this),
		};

		this.textElements = {
			start: document.createElement('div'),
			dice: document.createElement('div'),
		};

		for (const key of Object.keys(this.textElements)) {
			this.textElements[key].classList.add('d-flex', 'gap-2');
			this.textElements[key].setAttribute('id', key);
			$('header-data')!.appendChild(this.textElements[key]);
		}

		this.layers.start.unlocked = true;

		this.visibleLayer = 'start';

		this.gameTimer = setInterval(this.update.bind(this), this.mainInterval);
		this.fixedTimer = setInterval(this.fixedIntervalUpdate.bind(this), this.fixedInterval);

		this.setupNav();

		document.addEventListener('contextmenu', (event) => {
			event.preventDefault();
			// Can make custom right click menu if I can be bothered.
			// simulate left click
			const clickEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window,
			});
			event.target?.dispatchEvent(clickEvent);
		});

		document.addEventListener('keydown', (event) => {
			this.keyPressed = event.key;
			console.log('Key Pressed:', this.keyPressed);
			switch (this.keyPressed) {
				case 'q':
					this.layers.start.currency = this.layers.start.currency.times(10);
					break;

				case '1':
					this.switchLayer('start');
					break;
				case '2':
					this.switchLayer('dice');
					break;
				case '3':
					this.switchLayer('coin');
					break;
				case 'm':
					this.layers.start.currency = new Decimal(1e16);
					break;
				case '`':
					this.devTools.toggleVisibility();
					break;
				case 'i':
					this.help.toggleVisibility();
					break;
				case 'Escape':
					this.settings.toggleVisibility();

					break;
			}
		});
		document.addEventListener('keyup', (event) => {
			this.keyPressed = '';
		});
		document.addEventListener('mousemove', (event) => {
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
		});

		this.settings.init();

		this.tryLoad();
		this.autosaveTimer = setInterval(this.autoSave.bind(this), this.settings.config.autoSaveInterval);
	}

	async tryLoad() {
		await this.saveManager.loadSettings(this);

		if (await this.saveManager.saveExists()) {
			if (this.settings.config.autoLoadEnabled) {
				this.load();
			}
		} else {
		}
	}

	autoSave() {
		if (this.settings.config.autoSaveEnabled) {
			if (this.layers.start.currency.eq(0)) return;
			console.log('AutoSaving');
			this.save();
		}
	}

	save() {
		this.saveManager.save(this);
	}

	load() {
		this.saveManager.load(this);
	}

	// Is called every mainInterval time (1000ms default)
	update() {
		for (const layer of Object.keys(this.layers)) {
			this.layers[layer].update();
		}
		this.updateUI();
	}

	// Is called every fixedInterval time (3000ms) - This does not decrease with game speed/upgrades.
	fixedIntervalUpdate() {
		for (const layer of Object.keys(this.layers)) {
			if (this.layers[layer].currency.gt(this.layers[layer].highestCurrency)) {
				this.layers[layer].highestCurrency = this.layers[layer].currency;
			}
			this.layers[layer].checkMilestones();
		}
		if (this.layers.start.highestCurrency.gt(this.layers.dice.unlockCost)) {
			this.layers.dice.unlocked = true;
		}

		this.setupNav();
	}

	setTooltipsState(forcedState?: boolean) {
		for (const layer of Object.keys(this.layers)) {
			for (const key of Object.keys(this.layers[layer].buttons)) {
				const btn = this.layers[layer].buttons[key];
				if (forcedState) btn.toggleTooltip(forcedState);
				else btn.toggleTooltip(forcedState);
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
		if (this.layers[layerName].unlocked === false) return;
		console.log('Switching to layer', layerName);
		for (const layer of Object.keys(this.layers)) {
			this.layers[layer].toggleVisibility(true);
		}
		this.layers[layerName].toggleVisibility();
		for (const button of this.navBar.children) {
			if (button.id === layerName) {
				this.visibleLayer = layerName;
				button.classList.add('selected');
			} else {
				button.classList.remove('selected');
			}
		}
	}

	formatValue(value: Decimal, places: number = 2): string {
		if (value.lt(1000)) {
			return value.toFixed(places).toString();
		} else {
			return `${value.m.toFixed(places)}e${value.e}`;
		}
	}
	updateUI() {
		this.textElements.start.innerText = this.formatValue(this.layers.start.currency) + ' P';
		this.textElements.dice.innerText = this.formatValue(this.layers.dice.currency) + ' D';
	}
}

let game: Game;

// bind document.getElementById to $
const $ = document.getElementById.bind(document);

document.addEventListener('DOMContentLoaded', function () {
	game = new Game();
	(window as any).game = game;
	game.settings.visible = false;
	game.settings.toggleVisibility(false);
});
