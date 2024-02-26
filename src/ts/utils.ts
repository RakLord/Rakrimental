
export class Button {
    button: HTMLButtonElement;
    tooltopVisable: boolean;
    milestone: {[key: string]: any};

    lines: HTMLElement[] = [];

    constructor(milestone: {[key: string]:any}) {
        this.milestone = milestone;
        this.button = document.createElement('button');
        this.tooltopVisable = true;

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


        
        this.button.addEventListener('click', () => {
            this.milestone.activate.bind(this.milestone, this.milestone.cost)();
            this.updateTooltip();
            this.updateText();            
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
    static createMilestoneButton(milestone: {[key: string]: any}): Button {
        const btn = new Button(milestone);
        return btn; // Return the Button instance
    }
}