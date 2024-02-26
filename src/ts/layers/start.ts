import { Layer } from "./layer";
import { Game } from "../main";
import { Milestone } from "./layer";

export class Start extends Layer {
    pointsPerClickIncrement: number;
    pointsPerClick: number;
    pointAutoDivisor: number;
    autoPointsEnabled: boolean;
    pointsText: HTMLElement;
    constructor(game: Game) {
        super(game, "start", 0, "green");
        this.pointsPerClickIncrement = 1;
        this.autoPointsEnabled = false;
        this.pointAutoDivisor = 100;
        this.pointsPerClick = 1;
        this.pointsText = document.createElement('h2');
        this.pointsText.classList.add('text-1xl', 'text-white', 'font-bold', 'text-center');
        this.pointsText.textContent = `Points: ${this.game.points}`;
        this.div.appendChild(this.pointsText);

        this.milestoneFunctions = {
            "givePoints": {
                "activate": () => {
                    this.game.addPoints(this.pointsPerClick);
                    this.milestoneFunctions.givePoints.update();
                },
                "cost": (level: number): number => {
                    return 0;
                },
                "update": () => {
                    this.milestoneFunctions.givePoints.updateText();
                },
                "updateText": () => {
                    this.buttons.givePoints.lines[0].textContent = this.milestones.givePoints.text;
                }
            },

            // Increase Points Per Click
            "increasePointsPerClick": {
                "activate": (cost: number) => {
                    console.log("Increase Points Per Click", cost, this.game.points)
                    if (this.game.points >= cost) {
                        this.game.removePoints(cost);
                        this.game.layers.start.milestones.increasePointsPerClick.levelUp();
                        this.milestoneFunctions.increasePointsPerClick.update();
                    }
                },
                "cost": (level: number): number => {
                    return Math.floor((level+1) ** 1.2)*5;
                },
                "update": () => {
                    this.pointsPerClick = this.pointsPerClickIncrement * this.game.layers.start.milestones.increasePointsPerClick.level;
                    this.milestoneFunctions.increasePointsPerClick.updateText();
                },
                "updateText": () => {
                    this.buttons.increasePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.increasePointsPerClick.cost}`;
                    this.buttons.increasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.increasePointsPerClick.level}/${this.milestones.increasePointsPerClick.maxLevel}`;
                    this.buttons.increasePointsPerClick.lines[3].textContent = `+${this.pointsPerClick}`;
                }
            },

            // Upgrade Increase Points Per Click
            "upgradeIncreasePointsPerClick": {
                "activate": (cost: number) => {
                    if (this.game.points >= cost) {
                        this.game.removePoints(cost);
                        this.game.layers.start.milestones.upgradeIncreasePointsPerClick.levelUp();
                        this.pointsPerClickIncrement += 1;
                        this.milestoneFunctions.upgradeIncreasePointsPerClick.update();
                    }
                },
                "cost": (level: number): number => {
                    return Math.floor((level+10) ** 1.8)*2;
                },
                "update": () => {
                    this.milestoneFunctions.upgradeIncreasePointsPerClick.updateText();
                    this.milestoneFunctions.increasePointsPerClick.update();
                },
                "updateText": () => {
                    console.log("Updating Upgrade Increase Points Per Click")
                    this.buttons.upgradeIncreasePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.upgradeIncreasePointsPerClick.cost}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.upgradeIncreasePointsPerClick.level}/${this.milestones.upgradeIncreasePointsPerClick.maxLevel}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[3].textContent = `+${this.pointsPerClickIncrement}`;
                }
            },

            // Auto Points
            "autoPoints": {
                "activate": (cost: number) => {
                    if (this.game.points >= cost) {
                        this.game.removePoints(cost);
                        this.autoPointsEnabled = true;
                        this.game.layers.start.milestones.autoPoints.levelUp();
                        this.milestoneFunctions.autoPoints.update();
                    }
                },
                "cost": (level: number): number => {
                    return 3000;
                },
                "update": () => {
                    this.milestoneFunctions.autoPoints.updateText();
                },
                "updateText": () => {
                    if (this.milestones.autoPoints.buyable) {
                        this.buttons.autoPoints.lines[1].textContent = `Cost: ${this.milestones.autoPoints.cost}`;
                    } else {
                        this.buttons.autoPoints.lines[1].textContent = "Enabled";
                        this.buttons.autoPoints.button.classList.add('not-buyable');
                    }
                }
            },

            // Auto Points Divisor
            "autoPointsDivisor": {
                "activate": (cost: number) => {
                    if (this.game.points >= cost) {
                        this.game.removePoints(cost);
                        if (this.pointAutoDivisor >= 2) {
                            this.pointAutoDivisor -= 1;
                            this.game.layers.start.milestones.autoPointsDivisor.levelUp();
                            this.milestoneFunctions.autoPointsDivisor.update();
                        }
                    }
                },
                "cost": (level: number): number => {
                    return Math.floor(((level+1) ** 1.2) * (Math.log(level+1) * 1000) + 10000);
                },
                "update": () => {
                    this.milestoneFunctions.autoPointsDivisor.updateText();
                },
                "updateText": () => {
                    this.buttons.autoPointsDivisor.lines[1].textContent = `Cost: ${this.milestones.autoPointsDivisor.cost}`;
                    this.buttons.autoPointsDivisor.lines[2].textContent = `Level: ${this.milestones.autoPointsDivisor.level}/${this.milestones.autoPointsDivisor.maxLevel}`;
                    this.buttons.autoPointsDivisor.lines[3].textContent = `Divisor: ${this.pointAutoDivisor}`;
                }
            }
        };

        this.milestones = {
            "givePoints": new Milestone("givePoints", "Gib Points", 0, "Give points when clicked", -1, this.milestoneFunctions.givePoints),
            "increasePointsPerClick": new Milestone("increasePointsPerClick", "+PPC", 10, "Increase points per click", 10000, this.milestoneFunctions.increasePointsPerClick),
            "upgradeIncreasePointsPerClick": new Milestone("upgradeIncreasePointsPerClick", "++PPC", 100, "Increase the amount that the +PPC upgrade gives", 100, this.milestoneFunctions.upgradeIncreasePointsPerClick),
            "autoPoints": new Milestone("autoPoints", "Automates Points", 1000, "Give points automatically", 1, this.milestoneFunctions.autoPoints),
            "autoPointsDivisor": new Milestone("autoPointsDivisor", "Auto Points Divisor", 10000, "Lowers the auto-points divider", 100, this.milestoneFunctions.autoPointsDivisor)
        }

        this.setup();
        this.toggleVisibility();

        this.milestoneFunctions.givePoints.update();
    }

    updatePointsText() {
        this.pointsText.textContent = `Points: ${Math.floor(this.game.points)}`;
    }

    update() {
        if (this.autoPointsEnabled) {
            this.game.addPoints(this.pointsPerClick / this.pointAutoDivisor);
        }
    }
}