import {Game} from './main';
import {Layer} from './layers/layer';

export class Help {
	game: Game;
	visible: boolean;
	div: HTMLElement;
	iconDiv: HTMLElement;
	constructor(game: Game) {
		this.game = game;
		this.visible = false;
		this.div = document.createElement('div');
		this.div.classList.add('help', 'hidden');
		document.body.appendChild(this.div);
		this.iconDiv = document.createElement('div');
		this.iconDiv.classList.add('help-icon');
		this.iconDiv.innerHTML = '?';
		this.iconDiv.addEventListener('click', () => {
			this.toggleVisibility();
		});
		document.body.appendChild(this.iconDiv);

		this.setupHelp();
	}

	toggleVisibility(forceState?: boolean): void {
		if (forceState) {
			this.visible = forceState;
		} else {
			this.visible = !this.visible;
		}
		console.log(this.visible);
		if (this.visible) {
			this.div.classList.remove('hidden');
		} else {
			this.div.classList.add('hidden');
		}
	}

	setupHelp(): void {
		const header = document.createElement('h2');
		header.classList.add('header');
		header.innerText = 'Help & Info';
		this.div.appendChild(header);

		const credits = document.createElement('p');
		credits.classList.add('credits');
		credits.innerText = 'Game by: Rak';
		this.div.appendChild(credits);

		const info = document.createElement('div');
		info.classList.add('info');
		const text = [
			'Hello, Im rak 🦝',
			'This is a game I am working on in my spare time.',
			'Updates are frequent when I have time!',
			'Current content ends early during 2nd layer.',
		];
		for (const line of text) {
			const p = document.createElement('p');
			p.innerText = line;
			info.appendChild(p);
		}

		this.div.appendChild(info);
		let divider = document.createElement('div');
		divider.classList.add('divider');
		this.div.appendChild(divider);

		const hotKeys = document.createElement('div');
		hotKeys.classList.add('hotkeys');
		const tableHeader = document.createElement('h3');
		tableHeader.innerText = 'Hotkeys';
		tableHeader.classList.add('header');
		const table = document.createElement('table');
		const thead = document.createElement('thead');
		table.appendChild(thead);
		const tr = document.createElement('tr');
		thead.appendChild(tr);
		const th1 = document.createElement('th');
		tr.appendChild(th1);
		th1.innerText = 'Key';
		const th2 = document.createElement('th');
		tr.appendChild(th2);
		th2.innerText = 'Action';
		const tbody = document.createElement('tbody');
		table.appendChild(tbody);
		const hotkeys = [
			['Numbers', 'Switch Layer'],
			['Escape', 'Open/close settings'],
			['i', 'Open/close help'],
			['Shift + Click', 'Buy 10 of an upgrade'],
			['z', 'Buy upto 10,000 of an upgrade'],
		];
		for (const hotkey of hotkeys) {
			const tr = document.createElement('tr');
			tbody.appendChild(tr);
			const td1 = document.createElement('td');
			tr.appendChild(td1);
			td1.innerText = hotkey[0];
			const td2 = document.createElement('td');
			tr.appendChild(td2);
			td2.innerText = hotkey[1];
		}

		hotKeys.appendChild(tableHeader);
		hotKeys.appendChild(table);
		this.div.appendChild(hotKeys);
	}
}
