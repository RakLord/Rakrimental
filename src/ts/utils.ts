
export class Button {
    private buttonCSS: string = 'bg-blue-900 bg-opacity-20 hover:bg-opacity-50 flex flex-col justify-center items-center text-white py-2 px04 rounded w-1/4 mx-auto mt-4 max-w-md';

    button: HTMLButtonElement;
    tooltopVisable: boolean;
    milestone: {[key: string]: any};

    lines: HTMLElement[] = [];

    constructor(milestone: {[key: string]:any}, css: string = '') {
        this.milestone = milestone;
        this.buttonCSS = css ? css : this.buttonCSS;
        this.button = document.createElement('button');
        this.tooltopVisable = true;

        // add 4 divs to the this.lines array
        for (let i = 0; i < 4; i++) {
            this.lines.push(document.createElement('div'));
        }
        this.init();
    }

    private init() {
        this.button.className = this.buttonCSS;
        this.updateText();
        this.updateTooltip();


        for (const line of this.lines) {
            this.button.appendChild(line);
        }
        if (this.milestone.name === 'givePoints') { 
            this.lines[0].classList.add('text-base', 'font-bold', 'w-full', 'text-center', 'mb-1');
        }
        else {
            this.lines[0].classList.add('text-base', 'font-bold', 'border-b-2', 'w-full', 'text-center', 'mb-1');
        }
        this.lines[1].classList.add('text-sm');
        this.lines[2].classList.add('text-sm');
        this.lines[3].classList.add('text-sm');

        
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
            descriptionDiv.className = 'absolute bg-gray-900 p-2 rounded z-10 font-bold'; // z-10 to ensure it's above other items
            document.body.appendChild(descriptionDiv); // Append to body to ensure it's not constrained by button's position
    
            const updateTooltipPosition = (mouseEvent: MouseEvent) => {
                descriptionDiv.style.left = `${mouseEvent.clientX + 10}px`; // +10 for a slight offset from the cursor
                descriptionDiv.style.top = `${mouseEvent.clientY + 10}px`;
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
    static createMilestoneButton(milestone: {[key: string]: any}, css: string = ''): Button {
        const btn = new Button(milestone, css);
        return btn; // Return the Button instance
    }
}