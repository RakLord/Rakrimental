import { Layer } from "./layer";
import { Game } from "../main";

export class Start extends Layer {
    private button: HTMLElement;
    constructor(game: Game) {
        super(game, "start", 0, "green");
        this.button = document.createElement('button');
        this.setup();
        this.toggleVisibility();
    }
    setup() {
        this.button.innerText = "Gib Points";
        this.button.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'w-1/4', 'mx-auto', 'mt-4');
        this.button.addEventListener('click', () => {
            this.game.points += this.game.pointsPerClick;
            this.game.updateUI();
        });
        this.div.appendChild(this.button);
    
    }
}