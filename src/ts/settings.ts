import {Game} from './main';
import {Layer} from './layers/layer';

export class Checkbox {
	game: Game;
	valueName: string;
	parent: HTMLElement;
	div: HTMLElement;
	constructor(game: Game, valueName: string, parent: HTMLElement) {
		this.game = game;
		this.valueName = valueName;

		this.div = document.createElement('div');
		this.div.classList.add('checkbox');
		this.parent = parent;
		this.parent.appendChild(this.div);

		this.div.addEventListener('click', () => {
			this.toggle();
		});

		this.update();
	}

	toggle(): void {
		console.log(`Toggling: ${this.valueName} from ${this.game.settings.config[this.valueName]} to ${!this.game.settings.config[this.valueName]}`);
		this.game.settings.config[this.valueName] = !this.game.settings.config[this.valueName];

		this.update();
	}

	update(): void {
		console.log(`${this.valueName} - ${this.game.settings.config[this.valueName]}`);
		if (this.game.settings.config[this.valueName]) {
			this.div.classList.add('checked');
		} else {
			this.div.classList.remove('checked');
		}
	}
}

export class Settings {
	game: Game;
	visible: boolean;

	config: {[key: string]: any};
	div: HTMLElement;
	rows: HTMLElement[] = [];
	checkboxes: Checkbox[] = [];

	constructor(game: Game) {
		this.game = game;
		this.visible = true;

		this.config = {
			autoSaveEnabled: true,
			autoLoadEnabled: false,
			tooltipsEnabled: true,
			graphsEnabled: false,
			autoSaveInterval: 30000,
		};

		this.div = document.createElement('div');
		document.body.appendChild(this.div);
		this.div.classList.add('settings');
		let header = document.createElement('h2');
		header.textContent = 'Settings';
		header.classList.add('header');
		this.div.appendChild(header);
	}

	init() {
		this.addRow('AutoSave', {type: 'string', text: 'Auto Save'}, {type: 'checkBox', value: 'autoSaveEnabled'});
		this.addRow('AutoLoad', {type: 'string', text: 'Auto Load'}, {type: 'checkBox', value: 'autoLoadEnabled'});
		this.addRow('Tooltips', {type: 'string', text: 'Tooltips'}, {type: 'checkBox', value: 'tooltipsEnabled'});
		this.addRow('Graphs', {type: 'string', text: 'Graphs'}, {type: 'checkBox', value: 'graphsEnabled'});
		this.addRow('Divider', {type: 'divider', text: 'divider'}, {type: 'divider', text: 'divider'});
		this.addRow('SaveLoad', {type: 'save', text: 'Save'}, {type: 'load', text: 'Load'});
	}

	addRow(label: string, options1: {[key: string]: any}, options2: {[key: string]: any}): void {
		let row = document.createElement('div');
		row.classList.add('row');
		this.div.appendChild(row);
		let col1 = document.createElement('div');
		let col2 = document.createElement('div');
		col1.classList.add('col');
		col2.classList.add('col');

		row.appendChild(col1);
		row.appendChild(col2);
		if (options1.type === 'divider') {
			row.classList.add('divider');
			return;
		}

		switch (options1.type) {
			case 'string':
				col1.textContent = options1.text;
				col1.classList.add('string');
				break;
			case 'save':
				col1.appendChild(
					this.newButton(options1.text, () => {
						this.game.save();
					}),
				);
				break;
		}

		switch (options2.type) {
			case 'checkBox':
				this.checkboxes.push(new Checkbox(this.game, options2.value, col2));
				break;
			case 'load':
				col2.appendChild(
					this.newButton(options2.text, () => {
						this.game.load();
					}),
				);
				break;
		}
	}

	newButton(label: string, callback: () => void): HTMLElement {
		let button = document.createElement('button');
		button.textContent = label;
		button.addEventListener('click', callback);
		return button;
	}

	updateCheckboxes(): void {
		for (const checkbox of this.checkboxes) {
			checkbox.update();
		}
	}

	setStates(): void {
		console.log('Setting tooltips to', this.game.settings.config.tooltipsEnabled);
		this.game.setTooltipsState(this.game.settings.config.tooltipsEnabled);
	}

	toggleVisibility(forceState?: boolean): void {
		if (forceState !== undefined) {
			this.visible = forceState;
		} else {
			this.visible = !this.visible;
		}

		if (this.visible) {
			this.div.classList.remove('hidden');
		} else {
			this.div.classList.add('hidden');
		}
		this.setStates();
	}
}
