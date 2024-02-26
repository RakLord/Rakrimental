import { Layer } from "./layer";
import { Game } from "../main";

export class Coin extends Layer {
    constructor(game: Game) {
        super(game, "coin", 10000000, "yellow");
        
    }
    
}