import { Game } from "./main";
import localForage from 'localforage';
import { Milestone } from "./layers/layer";

export class SaveManager {
    game: Game;
    constructor(game: Game) {
        this.game = game;
        console.log("Save Manager Constructor")
        console.log(this.game)
    }


    async save(game: Game) {
        this.game = game;
        console.log("Saving game")
        console.log(this.game)
        const stateToSave: { [key: string]: any } = {};

        stateToSave["points"] = this.game.points;
        stateToSave["visibleLayer"] = this.game.visibleLayer;
        stateToSave["mainInterval"] = this.game.mainInterval;
        stateToSave["fixedInterval"] = this.game.fixedInterval;
        stateToSave["highestPoints"] = this.game.highestPoints;
        stateToSave["tooltipsEnabled"] = this.game.tooltipsEnabled;
        
        stateToSave["layers"] = {
            start: {
                unlocked: this.game.layers.start.unlocked,
                milestones: {
                    givePoints: {
                        level: this.game.layers.start.milestones.givePoints.level
                    },
                    increasePointsPerClick: {
                        level: this.game.layers.start.milestones.increasePointsPerClick.level
                    },
                    upgradeIncreasePointsPerClick: {
                        level: this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level
                    },
                    autoPoints: {
                        level: this.game.layers.start.milestones.autoPoints.level,
                        buyable: this.game.layers.start.milestones.autoPoints.buyable,
                    },
                    autoPointsDivisor: {
                        level: this.game.layers.start.milestones.autoPointsDivisor.level
                    },
                    criticalPoints: {
                        level: this.game.layers.start.milestones.criticalPoints.level
                    },
                    criticalBonus: {
                        level: this.game.layers.start.milestones.criticalBonus.level
                    },
                    overCritical: {
                        level: this.game.layers.start.milestones.overCritical.level
                    
                    }
                }
            },
            dice: {
                unlocked: this.game.layers.dice.unlocked,
                diceCount: this.game.layers.dice.diceCount,
                diceCountCap: this.game.layers.dice.diceCountCap,
                milestones: {

                },
            },
            coin: {
                unlocked: this.game.layers.coin.unlocked,
                milestones: {

                },
            }
        };


        
        
        // Actually save the state
        try {
            console.log("Saving game state", stateToSave);
            await localForage.setItem("gameState", stateToSave);
        } catch (err) {
            console.error("Save failed", err);
        }
    }

    async load(game: Game) {
        this.game = game;
        try {
            const gameState = await localForage.getItem<any>('gameState');
            console.log("STATE LOAD: ", gameState);


            if (gameState) {

                this.game.points = gameState.points;
                this.game.visibleLayer = gameState.visibleLayer;
                this.game.mainInterval = gameState.mainInterval;
                this.game.fixedInterval = gameState.fixedInterval;
                this.game.highestPoints = gameState.highestPoints;
                this.game.tooltipsEnabled = gameState.tooltipsEnabled;
                
                // Start Layer
                this.game.layers.start.unlocked = gameState.layers.start.unlocked;

                this.game.layers.start.milestones.givePoints.level = gameState.layers.start.milestones.givePoints.level;

                this.game.layers.start.milestones.increasePointsPerClick.level = gameState.layers.start.milestones.increasePointsPerClick.level;
                // set pointsPerClick to increasePointsPerClick level if it is higher than 1, otherwise set it to 1
                //  This may be broken???
                this.game.layers.start.autoPointsEnabled = !gameState.layers.start.milestones.autoPoints.buyable;

                this.game.layers.start.pointsPerClick = gameState.layers.start.milestones.increasePointsPerClick.level > 1 ? gameState.layers.start.milestones.increasePointsPerClick.level : 1;
                this.game.layers.start.milestones.upgradeIncreasePointsPerClick.level = gameState.layers.start.milestones.upgradeIncreasePointsPerClick.level;
                this.game.layers.start.milestones.autoPoints.level = gameState.layers.start.milestones.autoPoints.level;
                
                this.game.layers.start.milestones.autoPoints.buyable = gameState.layers.start.milestones.autoPoints.buyable;

                this.game.layers.start.milestones.autoPointsDivisor.level = gameState.layers.start.milestones.autoPointsDivisor.level;

                this.game.layers.start.milestones.criticalPoints.level = gameState.layers.start.milestones.criticalPoints.level;
                this.game.layers.start.milestones.criticalBonus.level = gameState.layers.start.milestones.criticalBonus.level;
                this.game.layers.start.milestones.overCritical.level = gameState.layers.start.milestones.overCritical.level;
                

                // Dice Layer
                this.game.layers.dice.unlocked = gameState.layers.dice.unlocked;
                this.game.layers.dice.diceCount = gameState.layers.dice.diceCount;
                this.game.layers.dice.diceCountCap = gameState.layers.dice.diceCountCap;

                // Coin Layer
                this.game.layers.coin.unlocked = gameState.layers.coin.unlocked;

                this.game.setupNav();
                for (const layer of Object.keys(this.game.layers)) {
                    this.game.layers[layer].toggleVisibility(true);
                }
                this.game.switchLayer(this.game.visibleLayer);
                this.game.setTooltipsState();
                // loop over each layer and update the milestones
                for (const layer of Object.keys(this.game.layers)) {
                    this.game.layers[layer].checkMilestones();
                }
                

                //  Update milestone costs based on loaded level
                for (const layer of Object.keys(this.game.layers)) {
                    for (const key of Object.keys(this.game.layers[layer].milestones)) {
                        const ms = this.game.layers[layer].milestones[key];
                        const msf = this.game.layers[layer].milestoneFunctions[key].cost;
                        ms.cost = msf(ms);
                    }
                }

                // update the text and tooltip on each milestone
                for (const layer of Object.keys(this.game.layers)) {
                    for (const key of Object.keys(this.game.layers[layer].milestones)) {
                        if (this.game.layers[layer].milestoneFunctions[key].update) {
                            this.game.layers[layer].milestoneFunctions[key].update();
                        }
                    }
                }





                this.game.updateUI();
                

            } else {
                console.log('No saved game state to load');
                this.save(this.game); // Save initial state if nothing to load
            }
        } catch (err) {
            console.error('Load failed', err);
        }
    }
}