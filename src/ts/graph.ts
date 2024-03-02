import { Game } from './main';
import { Milestone } from './layers/layer';
import Decimal from 'break_infinity.js';

export class FormulaGraph {
    game: Game;
    container: HTMLElement;
    milestone?: Milestone;
    milestoneFunc?: any;
    xMin: Decimal = new Decimal(0);
    xMax: Decimal = new Decimal(0);
    yMin: Decimal = new Decimal(0);
    yMax: Decimal = new Decimal(0);
    step: Decimal = new Decimal(1);
    constructor(game: Game) {
        this.game = game
        this.container = document.createElement('div');
        this.container.id = 'formulaGraph';
        this.container.classList.add('hidden');
        this.container.classList.add('formula-graph');
        this.container.style.top = '50vh';
        this.container.style.left = '0';
        this.xMax = new Decimal(0);
        this.yMax = new Decimal(0);

        document.getElementById('main')!.appendChild(this.container);
    }

    createGraph(milestone: Milestone) {
        this.milestone = milestone;
        this.milestoneFunc = milestone.costFormula;
        this.xMin =  new Decimal(0);
        this.xMax = this.milestone.maxLevel;
        this.yMin = this.milestoneFunc(this.milestone, false, new Decimal(1));
        this.yMax = this.milestoneFunc(this.milestone, true);

        this.step = this.xMax.div(new Decimal(32));
        console.log(this.xMin, this.xMax, this.yMin, this.yMax, this.step)

        console.log(this.xMax, this.yMax)
        this.drawGraph();
    }

    drawGraph() {
        console.log("Drawing graph");
        if (!this.game.formulaGraphEnabled || !this.milestoneFunc || !this.milestone) return;
    
        this.container.classList.remove('hidden');
        this.container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = this.container.offsetWidth;
        canvas.height = this.container.offsetHeight;
        this.container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // set the container position to just above the mouse
        this.container.style.left = `${this.game.mouseX}px`;
        this.container.style.top = `${this.game.mouseY - this.container.offsetHeight}px`;
    
        const canvasPad = 5; // Padding around the canvas
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        
        ctx.moveTo(canvasPad, canvas.height - canvasPad);
        ctx.beginPath();
        // Move to the starting point with padding considered
         


        // xMax = maxLevel
        // yMax = maxCost
        
        for (let x = this.xMin; x.lte(this.xMax); x = x.add(this.step)) {
            const y = this.milestoneFunc(this.milestone, false, x);

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            // Borked
            const xCoord = (new Decimal(canvasPad).add(x.div(this.xMax)).times(new Decimal(canvas.width).sub(2).times(canvasPad))).toNumber(); 
            const yCoord = (new Decimal(new Decimal(canvas.height).sub(new Decimal(canvasPad)).sub((y.div(this.yMax)).times(new Decimal(canvas.height).sub(2).times(canvasPad))))).toNumber();

            ctx.lineTo(xCoord, yCoord);
        }

        // ctx.beginPath();
        // ctx.ellipse(canvasPad + (x / this.xMax) * (canvas.width - 2 * canvasPad), (canvas.height - canvasPad) - (y / this.yMax) * (canvas.height - 2 * canvasPad), 5, 5, 0, 0, 2 * Math.PI);
        // ctx.fillStyle = 'green';
        // ctx.fill();
        // ctx.closePath();
        // display some text at the top of the graph that contains the max value
        ctx.font = '12px Roboto';
        ctx.fillStyle = 'black';
        ctx.fillText(this.yMax.toString(), canvas.width/2, 40);

        ctx.stroke();
        ctx.closePath();
    }
    

    removeGraph() {
        this.container.classList.add('hidden');
        this.container.innerHTML = '';
    }
}