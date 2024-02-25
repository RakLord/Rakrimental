import { Layer } from "./layer";
import { Game } from "../main";


export class Start extends Layer {
    pointsPerClickIncrement: number;
    constructor(game: Game) {
        super(game, "start", 0, "green");
        this.pointsPerClickIncrement = 1;
        this.milestoneFunctions = {
            "givePoints": () => {
                this.game.points += this.game.pointsPerClick;
                this.game.updateUI();
            },
            "increasePointsPerClick": () => {
                this.game.pointsPerClick += this.pointsPerClickIncrement;
                this.game.updateUI();
            },
            "autoPoints": () => {
                this.game.autoPointsEnabled = true;
                this.game.updateUI();
            }
        }

        this.milestones = { 
            "givePoints": {
                "text": "Gib Points",
                "unlockPoints": 0,
                "unlocked": false,
                "description": "Give points when clicked",
                "function": this.milestoneFunctions.givePoints,
            },
            "increasePointsPerClick": {
                "text": "+PPC",
                "unlockPoints": 10,
                "unlocked": false,
                "description": "Increase points per click",
                "function": this.milestoneFunctions.increasePointsPerClick,
            },
            "autoPoints": {
                "text": "Automates Points",
                "unlockPoints": 500,
                "unlocked": false,
                "description": "Give points automatically",
                "function": this.milestoneFunctions.autoPoints,
            }
        };


        this.setup();
        this.toggleVisibility();
    }
}