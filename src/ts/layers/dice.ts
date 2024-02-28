import { Layer } from "./layer";
import { Game } from "../main";
import { Milestone } from "./layer";

export class SingleDice {
    game: Game;
    parentDiv: HTMLElement;
    div: HTMLElement;
    diceLayer: Dice;
    constructor(game: Game, diceLayer: Dice) {
        this.game = game;
        this.diceLayer = diceLayer;
        // THIS BULLSHIT IS THE NEXT THING TO FIX, IT'S NOT WORKING
        // Passing in the diceLayer as "this" works, but game.layers.dice.diceArrayContainer is borked......
        this.parentDiv = this.diceLayer.diceArrayContainer;
        // this.div = document.createElement('div');
        // this.div.classList.add('dice');

        // this.div.style.transition = 'all 0.5s';
        // this.div.style.cursor = 'pointer';
        // this.div.addEventListener('click', this.click.bind(this));
        // this.parentDiv.appendChild(this.div);
    }

    // click() {
    //     this.div.style.transform = `translate(-50%, -50%) scale(1.5)`;
    //     setTimeout(() => {
    //         this.div.style.transform = `translate(-50%, -50%) scale(1)`;
    //     }, 500);
    // }

}
export class Dice extends Layer { 
    diceArrayContainer: HTMLElement;
    diceCount: number;
    diceCountCap: number;
    diceArray: SingleDice[];
    
    constructor(game: Game) {
        super(game, "dice", 10000000, "white");
        this.layerColor = "blue";

        this.diceArrayContainer = document.createElement('div');
        this.diceArrayContainer.classList.add('dice-container');
        this.div.appendChild(this.diceArrayContainer);


        this.diceCount = 1;
        this.diceCountCap = 3;

        this.diceArray = [];



        this.milestoneFunctions = {
            "addDice": {
                "activate": () => {
                    this.milestoneFunctions.addDice.update();
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = 1;
                        return cost;
                    }
                    
                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    
                },
                "updateText": () => {
                    
                }
            },
        };

        this.milestones = {
            "addDice": new Milestone("addDice", "+1 Dice", 0, "Adds a new dice!", 5, this.milestoneFunctions.addDice),
        }

        this.init();
        this.setup();
    }

    init() {
        this.diceArray.push(new SingleDice(this.game, this));
    }

    updatePointsText() {
        this.pointsText.textContent = `Points: ${Math.floor(this.game.points)}`;
    }

    update() {

    } 
}
