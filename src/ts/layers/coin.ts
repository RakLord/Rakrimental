import { Layer } from "./layer";
import { Game } from "../main";
import { Milestone } from "../milestone";
import Decimal from "break_infinity.js";

export class Coin extends Layer {
    constructor(game: Game) {
        super(game, "coin", new Decimal(1e64), "yellow");
        
    }
    
}