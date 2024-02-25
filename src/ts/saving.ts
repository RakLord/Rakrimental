import { Game } from "./main";
import localForage from 'localforage';

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
                cost: this.game.layers.start.cost,
                milestones: parseMilestones(this.game.layers.start.milestones),
            },
            dice: {
                unlocked: this.game.layers.dice.unlocked,
                cost: this.game.layers.dice.cost,
                milestones: parseMilestones(this.game.layers.dice.milestones),
            },
            coin: {
                unlocked: this.game.layers.coin.unlocked,
                cost: this.game.layers.coin.cost,
                milestones: parseMilestones(this.game.layers.coin.milestones),
            }
        };
        
        // Parse the milestones to save them, Remove the function code and reference the function by name
        function parseMilestones(milestones: { [key: string]: any }): { [key: string]: any } {
            const parsedMilestones: { [key: string]: {} } = {};
            for (const key of Object.keys(milestones)) {
                const milestone = milestones[key];
                for (const milestoneKey of Object.keys(milestone)) {
                    
                    if (milestoneKey === 'function') {
                        console.log(milestone[milestoneKey])
                        milestone[milestoneKey] = milestone[milestoneKey].name;
                    }
                    if (milestoneKey === 'unlockPoints') {
                        milestone[milestoneKey] = parseInt(milestone[milestoneKey]);
                    }
                }
                parsedMilestones[key] = milestone;
            }
            return parsedMilestones;
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

            // Sets the milestones function to the actual function. This is done because the function is not saved in the save file
            function parseMilestones(thisGame: any, milestones: { [key: string]: any }): { [key: string]: any } {
                const parsedMilestones: { [key: string]: {} } = {};
                // Loop over each actual Milestone
                for (const key of Object.keys(milestones)) {
                    const milestone = milestones[key];
                    // Loop over each value in the milestone
                    for (const milestoneKey of Object.keys(milestone)) {
                        // If it is a function, set the milestone to the actual function
                        if (milestoneKey === 'function') {
                            milestone[milestoneKey] = thisGame.milestoneFunctions[milestone[milestoneKey]];
                        }
                        else milestone[milestoneKey] = milestone[milestoneKey];
                        
                    }
                    parsedMilestones[key] = milestone;
                }
                return parsedMilestones;
            };

            if (gameState) {

                this.game.points = gameState.points;
                this.game.visibleLayer = gameState.visibleLayer;
                this.game.mainInterval = gameState.mainInterval;
                this.game.fixedInterval = gameState.fixedInterval;
                this.game.highestPoints = gameState.highestPoints;
                this.game.tooltipsEnabled = gameState.tooltipsEnabled;
                
                this.game.layers.start.unlocked = gameState.layers.start.unlocked;
                this.game.layers.start.cost = gameState.layers.start.cost;
                this.game.layers.start.milestones = parseMilestones(this.game.layers.start, gameState.layers.start.milestones);

                this.game.layers.dice.unlocked = gameState.layers.dice.unlocked;
                this.game.layers.dice.cost = gameState.layers.dice.cost;
                this.game.layers.dice.milestones = parseMilestones(this.game.layers.dice, gameState.layers.dice.milestones);

                this.game.layers.coin.unlocked = gameState.layers.coin.unlocked;
                this.game.layers.coin.cost = gameState.layers.coin.cost;
                this.game.layers.coin.milestones = parseMilestones(this.game.layers.coin, gameState.layers.coin.milestones);

                this.game.setupNav();
                for (const layer of Object.keys(this.game.layers)) {
                    this.game.layers[layer].toggleVisibility(true);
                }
                this.game.switchLayer(this.game.visibleLayer);
                this.game.setTooltipsState();
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