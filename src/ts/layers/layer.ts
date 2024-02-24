import { Game } from "../main";

// bind document.getElementById to $
const $ = document.getElementById.bind(document);


export class Layer {
    game: Game;
    name: string;
    unlocked: boolean = false;
    cost: number;
    layerColor: string;

    parentElement: HTMLElement = $('main')!;
    div: HTMLElement;
    visible: boolean = false;
    elements: { [key: string]: HTMLElement; };
    layerTitle: HTMLElement;

    keysToSave: string[] = ['name', 'unlocked', 'cost', 'layerColor', 'visible'];

    constructor(game: Game,name: string, cost: number, layerColor: string) {
        this.game = game;
        this.name = name;
        this.cost = cost;
        this.layerColor = layerColor;
        // create a blank div that fills the entire parent, and add it to the parent which is main
        this.div = document.createElement('div');
        this.parentElement.appendChild(this.div);
        this.div.classList.add('flex', 'flex-col', 'w-full', 'h-full', 'hidden');
        this.div.setAttribute('id', this.name);

        // create a title for the layer
        this.layerTitle = document.createElement('div');
        this.div.appendChild(this.layerTitle);
        this.layerTitle.innerText = this.name.toUpperCase();
        this.layerTitle.classList.add('text-2xl', 'text-center', 'mb-4', 'font-bold', 'w-full', 'border-b-2', `border-${this.layerColor}-500`);
       
        this.elements = {

        };
    }

    tryUnlock(currentPoints: number): boolean {
        // console.log("Trying to unlock", this.name, "with", currentPoints, "/", this.cost, "points");
        if (currentPoints >= this.cost) {
            this.unlocked = true;
            console.log("Unlocked Layer", this.name);
            return true;
        } else {
            return false;
        }
    }

    toggleVisibility() {
        if (this.visible) {
            this.div.classList.add('hidden');
            this.visible = false;
        } else {
            this.div.classList.remove('hidden');
            this.visible = true;
        }
    }
}