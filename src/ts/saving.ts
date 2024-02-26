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
            },
            dice: {
                unlocked: this.game.layers.dice.unlocked,
            },
            coin: {
                unlocked: this.game.layers.coin.unlocked,
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
                
                this.game.layers.start.unlocked = gameState.layers.start.unlocked;

                this.game.layers.dice.unlocked = gameState.layers.dice.unlocked;

                this.game.layers.coin.unlocked = gameState.layers.coin.unlocked;

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