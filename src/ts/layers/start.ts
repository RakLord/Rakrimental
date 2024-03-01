import { Layer } from "./layer";
import { Game } from "../main";
import { Milestone } from "./layer";

function mapRange (x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
export class Start extends Layer {
    pointsPerClickIncrement: number;
    pointsPerClick: number;
    pointAutoDivisor: number;
    pointsPerSec: number;
    autoPointsEnabled: boolean;
    pointsText: HTMLElement;
    upgradeColumnsDiv: HTMLElement;
    upgradeColumns: HTMLElement[] = [];

    constructor(game: Game) {
        super(game, "start", 0, "green");

        this.pointsText = document.createElement('h2');
        this.pointsText.classList.add('text-1xl', 'text-white', 'font-bold', 'text-center');
        this.pointsText.textContent = `Points: ${this.game.points}`;
        this.div.appendChild(this.pointsText);

        this.upgradeColumnsDiv = document.createElement('div');
        this.upgradeColumnsDiv.classList.add('start-upgrade-columns');
        this.div.appendChild(this.upgradeColumnsDiv);
        // Loop over 3 upgrade columns and add the upgrade-column class and append them to the upgradecolumnsdiv
        for (let i = 0; i < 3; i++) {
            this.upgradeColumns.push(document.createElement('div'));
            this.upgradeColumns[i].classList.add('upgrade-column');
            this.upgradeColumnsDiv.appendChild(this.upgradeColumns[i]);
        }
        this.pointsPerClickIncrement = 1;
        this.autoPointsEnabled = false;
        this.pointAutoDivisor = 100;
        this.pointsPerClick = 1;
        this.pointsPerSec = 0;




        this.milestoneFunctions = {
            "givePoints": {
                "activate": () => {
                    console.log("Give Points")
                    if (this.game.layers.start.milestones.criticalPoints.level > 0) {
                        const rawCritChance = this.game.layers.start.milestones.criticalPoints.level // 1-200
                        const critChance = mapRange(rawCritChance, 1, 200, 1, 100);                  // 1-100
                        let critBonus = this.game.layers.start.milestones.criticalBonus.level;     // 0-1000
                        const overCrit = this.game.layers.start.milestones.overCritical.level;       // 0-2500

                        if (rawCritChance > 100) {
                            if (overCrit > 0) {
                                critBonus *= 1 + (overCrit / 100);
                            }
                        }
                        const crit = Math.random() * 100;
                        if (crit > critChance) {
                            this.game.addPoints(this.pointsPerClick + (this.pointsPerClick * critBonus));
                        } else {
                            this.game.addPoints(this.pointsPerClick);
                        }
                    } else {
                        this.game.addPoints(this.pointsPerClick);
                    }
                    
                    this.milestoneFunctions.givePoints.update();
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
                    this.milestoneFunctions.givePoints.updateText();
                },
                "updateText": () => {
                    this.buttons.givePoints.lines[0].textContent = this.milestones.givePoints.text;
                }
            },

            // Increase Points Per Click
            "increasePointsPerClick": {
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.increasePointsPerClick.cost && this.game.layers.start.milestones.increasePointsPerClick.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.increasePointsPerClick.cost);
                        this.game.layers.start.milestones.increasePointsPerClick.levelUp();
                        this.milestoneFunctions.increasePointsPerClick.update();
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = Math.floor((lvl * Math.sqrt(lvl) * Math.log(lvl+1) * 100) + Math.log(lvl+1) * 100);
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    if (this.game.layers.start.milestones.increasePointsPerClick.level > 0) {
                        this.pointsPerClick = this.pointsPerClickIncrement * (this.game.layers.start.milestones.increasePointsPerClick.level+1);
                    }
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
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.upgradeIncreasePointsPerClick.cost && this.game.layers.start.milestones.upgradeIncreasePointsPerClick.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.upgradeIncreasePointsPerClick.cost);
                        this.game.layers.start.milestones.upgradeIncreasePointsPerClick.levelUp();
                        this.milestoneFunctions.upgradeIncreasePointsPerClick.update();
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const m = 100;
                        const b = 0.07;
                        const j = 1000000;
                        const n = j / Math.sinh(b * m);
                        const cost = Math.floor((n * Math.sinh(b * lvl)) * (Math.log(lvl+1) * 10));
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    this.pointsPerClickIncrement = 1 + this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level;
                    this.milestoneFunctions.upgradeIncreasePointsPerClick.updateText();
                    this.milestoneFunctions.increasePointsPerClick.update();
                },
                "updateText": () => {
                    console.log("Updating Upgrade Increase Points Per Click")
                    this.buttons.upgradeIncreasePointsPerClick.lines[1].textContent = `Cost: ${this.milestones.upgradeIncreasePointsPerClick.cost}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[2].textContent = `Level: ${this.milestones.upgradeIncreasePointsPerClick.level}/${this.milestones.upgradeIncreasePointsPerClick.maxLevel}`;
                    this.buttons.upgradeIncreasePointsPerClick.lines[3].textContent = `*${this.pointsPerClickIncrement}`;
                }
            },

            // Auto Points
            "autoPoints": {
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.autoPoints.cost && this.game.layers.start.milestones.autoPoints.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.autoPoints.cost);
                        this.autoPointsEnabled = true;
                        this.game.layers.start.milestones.autoPoints.levelUp();
                        this.milestoneFunctions.autoPoints.update();
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = 7777;
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
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
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.autoPointsDivisor.cost && this.game.layers.start.milestones.autoPointsDivisor.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.autoPointsDivisor.cost);
                        if (this.pointAutoDivisor >= 2) {
                            this.pointAutoDivisor -= 1;
                            this.game.layers.start.milestones.autoPointsDivisor.levelUp();
                            this.milestoneFunctions.autoPointsDivisor.update();
                        }
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = Math.floor(((lvl+1) ** 1.3) * (Math.log(lvl+1) * 1000) + 20000);
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    this.milestoneFunctions.autoPointsDivisor.updateText();
                },
                "updateText": () => {
                    this.buttons.autoPointsDivisor.lines[1].textContent = `Cost: ${this.milestones.autoPointsDivisor.cost}`;
                    this.buttons.autoPointsDivisor.lines[2].textContent = `Level: ${this.milestones.autoPointsDivisor.level}/${this.milestones.autoPointsDivisor.maxLevel}`;
                    this.buttons.autoPointsDivisor.lines[3].textContent = `Divisor: ${this.pointAutoDivisor}`;
                }
            },
            // Critical Points (Crit Chance)
            "criticalPoints": {
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.criticalPoints.cost && this.game.layers.start.milestones.criticalPoints.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.criticalPoints.cost);
                        this.game.layers.start.milestones.criticalPoints.levelUp();
                        this.milestoneFunctions.criticalPoints.update();
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = Math.floor((30000 * (1.059 ** lvl)) * (Math.log(lvl+1) * 10));
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    this.milestoneFunctions.criticalPoints.updateText();
                },
                "updateText": () => {
                    this.buttons.criticalPoints.lines[1].textContent = `Cost: ${this.milestones.criticalPoints.cost}`;
                    this.buttons.criticalPoints.lines[2].textContent = `Level: ${this.milestones.criticalPoints.level}/${this.milestones.criticalPoints.maxLevel}`;
                    this.buttons.criticalPoints.lines[3].textContent = `Crit Chance: ${this.milestones.criticalPoints.level}%`;
                }
            },
            // Crit Bonus (Crit reward bonus %)
            "criticalBonus": {
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.criticalBonus.cost && this.game.layers.start.milestones.criticalBonus.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.criticalBonus.cost);
                        this.game.layers.start.milestones.criticalBonus.levelUp();
                        this.milestoneFunctions.criticalBonus.update();
                    }
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = Math.floor((30000 * (1.064 ** (lvl+1))) * (Math.log(lvl+1) * 100));
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    this.milestoneFunctions.criticalBonus.updateText();
                },
                "updateText": () => {
                    this.buttons.criticalBonus.lines[1].textContent = `Cost: ${this.milestones.criticalBonus.cost}`;
                    this.buttons.criticalBonus.lines[2].textContent = `Level: ${this.milestones.criticalBonus.level}/${this.milestones.criticalBonus.maxLevel}`;
                    this.buttons.criticalBonus.lines[3].textContent = `Crit Bonus: ${this.milestones.criticalBonus.level}%`;
                }
            },
            // Over Crit (Turn crits over 100% into BIGGGGER crits)
            "overCritical": {
                "activate": () => {
                    if (this.game.points >= this.game.layers.start.milestones.overCritical.cost && this.game.layers.start.milestones.overCritical.buyable) {
                        this.game.removePoints(this.game.layers.start.milestones.overCritical.cost);
                        this.game.layers.start.milestones.overCritical.levelUp();
                        this.milestoneFunctions.overCritical.update();
                    }
                
                },
                "cost": (milestone: Milestone, returnMax: boolean=false, forceLvl?: number): number => {
                    function calcCost(lvl: number): number {
                        const cost = Math.floor((30000 * (1.064 ** (lvl+1))) * (Math.log(lvl+1) * 100));
                        return cost;
                    }

                    let levelToUse = milestone.level;
                    if (returnMax) levelToUse = milestone.maxLevel;
                    if (forceLvl) levelToUse = forceLvl;
                    return calcCost(levelToUse);
                },
                "update": () => {
                    this.milestoneFunctions.overCritical.updateText();
                },
                "updateText": () => {
                    this.buttons.overCritical.lines[1].textContent = `Cost: ${this.milestones.overCritical.cost}`;
                    this.buttons.overCritical.lines[2].textContent = `Level: ${this.milestones.overCritical.level}/${this.milestones.overCritical.maxLevel}`;
                    this.buttons.overCritical.lines[3].textContent = `Over Crit: ${this.milestones.overCritical.level}`;
                }
            }
                
        };

        this.milestones = {
            "givePoints": new Milestone("givePoints", "Gib Points", 0, "Give points when clicked", -1, this.milestoneFunctions.givePoints, this.div),
            "increasePointsPerClick": new Milestone("increasePointsPerClick", "+PPC", 10, "Increase points per click", 10000, this.milestoneFunctions.increasePointsPerClick, this.upgradeColumns[0]),
            "upgradeIncreasePointsPerClick": new Milestone("upgradeIncreasePointsPerClick", "++PPC", 100, "Increase the amount that the +PPC upgrade gives", 100, this.milestoneFunctions.upgradeIncreasePointsPerClick, this.upgradeColumns[0]),
            "autoPoints": new Milestone("autoPoints", "Automates Points", 1000, "Give points automatically", 1, this.milestoneFunctions.autoPoints, this.upgradeColumns[1]),
            "autoPointsDivisor": new Milestone("autoPointsDivisor", "Auto Points Divisor", 10000, "Lowers the auto-points divider", 100, this.milestoneFunctions.autoPointsDivisor, this.upgradeColumns[1]),
            "criticalPoints": new Milestone("criticalPoints", "Critical Points", 30000, "Increases critical point chance", 200, this.milestoneFunctions.criticalPoints, this.upgradeColumns[2]),
            "criticalBonus": new Milestone("criticalBonus", "Critical Bonus", 50000, "Increases critical point bonus", 1000, this.milestoneFunctions.criticalBonus, this.upgradeColumns[2]),
            "overCritical": new Milestone("overCritical", "Over Critical", 250000, "Converts bonus crit chance into better crits!", 2500, this.milestoneFunctions.overCritical, this.upgradeColumns[2])
        }

        // Enable graphing feature per milestone.
        this.milestones.increasePointsPerClick.graphEnabled = true;
        this.milestones.upgradeIncreasePointsPerClick.graphEnabled = true;
        this.milestones.autoPointsDivisor.graphEnabled = true; 
        this.milestones.criticalPoints.graphEnabled = true;
        this.milestones.criticalBonus.graphEnabled = true;
        this.milestones.overCritical.graphEnabled = true;   

        this.setup();
        this.toggleVisibility();

        //  Moves the give points button to after the points text but before the upgrades
        if (this.div.firstChild) {
            this.div.insertBefore(this.buttons.givePoints.button, this.div.children[1]);
        }
        this.milestoneFunctions.givePoints.update();
    }

    updatePointsText() {
        this.pointsText.textContent = `Points: ${Math.floor(this.game.points)}`;
    }

    update() {
        if (this.autoPointsEnabled) {
            // points per sec is caluculated taking into consideration the mainInterval (which is in ms)
            this.pointsPerSec = (this.pointsPerClick / this.pointAutoDivisor) * (1000 / this.game.mainInterval);
            this.game.addPoints(this.pointsPerClick / this.pointAutoDivisor);
        }
    }
}