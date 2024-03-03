import Decimal from 'break_infinity.js';
import {Game} from './main';
import {Layer} from './layers/layer';

export class DevTools {
	game: Game;
	div: HTMLElement;
	buttons: {[key: string]: HTMLButtonElement};
	hidden: boolean;

	constructor(game: Game) {
		this.game = game;
		this.div = document.createElement('div');
		this.div.classList.add('dev-tools');
		this.buttons = {};
		document.body.appendChild(this.div);
		this.hidden = false;
		this.init();
	}

	init() {
		let header = document.createElement('h3');
		header.innerText = 'Dev Tools ( ` )';
		header.classList.add('dev-tools-header');
		this.div.appendChild(header);

		this.newButton('givePoints', '10x Points', () => {
			this.game.layers.start.currency = this.game.layers.start.currency.times(10);
		});

		this.toggleVisibility();
	}

	newButton(name: string, text: string, func: () => void) {
		this.buttons[name] = document.createElement('button');
		this.buttons[name].innerText = text;
		this.buttons[name].addEventListener('click', func);
		this.div.appendChild(this.buttons[name]);
	}

	toggleVisibility(forcedState?: boolean) {
		if (forcedState) this.hidden = forcedState;
		else this.hidden = !this.hidden;
		if (this.hidden) {
			this.div.classList.add('hidden');
		} else {
			this.div.classList.remove('hidden');
		}
	}
}
