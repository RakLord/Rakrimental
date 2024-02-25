import { Layer } from "./layer";
import { Game } from "../main";


export class Start extends Layer {
    pointsPerClickIncrement: number;
    pointsPerClick: number;
    pointAutoDivisor: number;
    autoPointsEnabled: boolean;
    constructor(game: Game) {
        super(game, "start", 0, "green");
        this.pointsPerClickIncrement = 1;
        this.autoPointsEnabled = false;
        this.pointAutoDivisor = 100;
        this.pointsPerClick = 1;

        this.milestoneFunctions = {
            "givePoints": () => {
                this.game.points += this.pointsPerClick;
                this.game.updateUI();
            },
            "increasePointsPerClick": () => {
                this.pointsPerClick += this.pointsPerClickIncrement;
                this.game.updateUI();
            },
            "autoPoints": () => {
                this.autoPointsEnabled = true;
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
    update() {
        if (this.autoPointsEnabled) {
            this.game.points += this.pointsPerClick / this.pointAutoDivisor;
        }
    }
}