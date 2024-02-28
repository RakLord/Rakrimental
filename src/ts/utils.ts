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

