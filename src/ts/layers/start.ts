import { Layer } from "./layer";
import { Game } from "../main";
import { Milestone } from "./layer";

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
        };

        this.milestones = {
            "givePoints": new Milestone("Gib Points", 0, "Give points when clicked", this.milestoneFunctions.givePoints),
            "increasePointsPerClick": new Milestone("+PPC", 10, "Increase points per click", this.milestoneFunctions.increasePointsPerClick),
            "autoPoints": new Milestone("Automates Points", 500, "Give points automatically", this.milestoneFunctions.autoPoints)
        }


        this.setup();
        this.toggleVisibility();
    }
    update() {
        if (this.autoPointsEnabled) {
            this.game.points += this.pointsPerClick / this.pointAutoDivisor;
        }
    }
}