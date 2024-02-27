import { Game } from './main';
import { Milestone } from './layers/layer';

export class Button {
    button: HTMLButtonElement;
    tooltopVisable: boolean;
    milestone: Milestone;
    game: Game;

    lines: HTMLElement[] = [];

    constructor(game:Game, milestone: Milestone) {
        this.game = game;
        this.milestone = milestone;
        this.button = document.createElement('button');
        this.tooltopVisable = true;
        this.button.setAttribute('tabindex', '-1');

        // add 4 divs to the this.lines array
        this.lines.push(document.createElement('h1'));
        for (let i = 0; i < 3; i++) {
            this.lines.push(document.createElement('div'));
        }
        this.init();
    }

    private init() {
        this.updateText();
        this.updateTooltip();


        for (const line of this.lines) {
            this.button.appendChild(line);
        }
        if (this.milestone.name === 'givePoints') { 
            this.lines[0].className = "givePoints";
        }

        this.button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
            }
        });
        
        this.button.addEventListener('click', (event) => {
            this.milestone.activate();
            this.updateTooltip();
            this.updateText();   
        });

        this.button.addEventListener('mouseenter', (event) => {
            this.milestone.hovered = true;
            
            // Only proceed if not already displaying a graph
            if (!this.game.displayingGraph) { 
                if (this.game.formulaGraphEnabled && this.milestone.graphEnabled) {
                    // Conditions met, now set displayingGraph to true to block further graph creations until mouseleave
                    this.game.displayingGraph = true;
                    this.game.formulaGraph.createGraph(this.milestone);
                    
                    // Move the mouseleave listener outside the condition to ensure it's always added
                }
                
                // Listener for mouseleave to reset the state
                this.button.addEventListener('mouseleave', (event) => {
                    this.milestone.hovered = false;
                    // Ensure graph is not being displayed anymore
                    this.game.displayingGraph = false;
                    // Call to remove the graph
                    this.game.formulaGraph.removeGraph();
                }, { once: true }); // Ensures this listener is cleaned up after execution
            }
        });
        



       
        // Tooltip
        this.button.addEventListener('mouseover', (event) => {
            if (!this.tooltopVisable) return;
            const descriptionDiv = document.createElement('div');
            descriptionDiv.textContent = this.milestone.description;
            descriptionDiv.className = 'dynamic-tooltip';
            document.body.appendChild(descriptionDiv); // Append to body to ensure it's not constrained by button's position
    
            const updateTooltipPosition = (mouseEvent: MouseEvent) => {
                descriptionDiv.style.left = `${mouseEvent.clientX + 100}px`;
                descriptionDiv.style.top = `${mouseEvent.clientY}px`;
            };
    
            // Initial position update
            updateTooltipPosition(event);
            
            // Update tooltip position on mouse move
            this.button.addEventListener('mousemove', updateTooltipPosition);
    
            // Clean up: remove tooltip and event listener when mouse leaves
            this.button.addEventListener('mouseleave', () => {
                descriptionDiv.remove();
                this.button.removeEventListener('mousemove', updateTooltipPosition);
            }, { once: true }); // Use { once: true } to automatically remove this event listener after it triggers once
        });
    
        return this;
    }
    
    toggleTooltip() {
        this.tooltopVisable = !this.tooltopVisable;
    }

    updateTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.textContent = this.milestone.description;
        }
    }

    updateText() {
        this.lines[0].textContent = this.milestone.text;
    }    
    
    // Optionally, create a static factory method to directly return the button element
    static createMilestoneButton(game: Game, milestone: Milestone): Button {
        const btn = new Button(game, milestone);
        return btn; // Return the Button instance
    }
}

export class FormulaGraph {
    game: Game;
    container: HTMLElement;
    milestone?: Milestone;
    milestoneFunc?: any;
    xMin: number = 0;
    xMax: number = 0;
    yMin: number = 0;
    yMax: number = 0;
    step: number = 1;
    constructor(game: Game) {
        this.game = game
        this.container = document.createElement('div');
        this.container.id = 'formulaGraph';
        this.container.classList.add('hidden');
        this.container.classList.add('formula-graph');
        this.container.style.top = '50vh';
        this.container.style.left = '0';
        this.xMax = 0;
        this.yMax = 0;

        document.getElementById('main')!.appendChild(this.container);
    }

    createGraph(milestone: Milestone) {
        this.milestone = milestone;
        this.milestoneFunc = milestone.costFormula;
        this.xMin =  0;
        this.xMax = this.milestone.maxLevel;
        this.yMin = 0;
        this.yMax = this.milestoneFunc(this.milestone, true);
        this.step = 1;
        console.log(this.xMax, this.yMax)
        this.drawGraph();
    }

    drawGraph() {
        console.log("Drawing graph");
        if (!this.game.formulaGraphEnabled || !this.milestoneFunc) return;
    
        this.container.classList.remove('hidden');
        this.container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = this.container.offsetWidth;
        canvas.height = this.container.offsetHeight;
        this.container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const canvasPad = 5; // Padding around the canvas
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
    
        ctx.beginPath();
        // Move to the starting point with padding considered
        ctx.moveTo(canvasPad, canvas.height - canvasPad); 
    
        // Adjusted plotting to account for canvasPad
        for (let x = this.xMin; x <= this.xMax; x += this.step) {
            const y = this.milestoneFunc(this.milestone, false, x);
            // Adjust xCoord and yCoord to include canvasPad in the calculation
            const xCoord = canvasPad + (x / this.xMax) * (canvas.width - 2 * canvasPad); 
            const yCoord = (canvas.height - canvasPad) - (y / this.yMax) * (canvas.height - 2 * canvasPad); 
            ctx.lineTo(xCoord, yCoord);
        }
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