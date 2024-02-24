
export class Button {
    private buttonCSS: string = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-1/4 mx-auto mt-4';
    name: string;
    txt: string;
    description: string;
    callback: () => void;
    button: HTMLElement;

    constructor(name: string, txt: string, callback: () => void, css: string = '') {
        this.buttonCSS = css ? css : this.buttonCSS;
        this.name = name;
        this.txt = txt;
        this.description = '';
        this.callback = callback;
        this.button = document.createElement('button');
        this.init();
    }

    private init(): HTMLElement {
        this.button.textContent = this.txt;
        this.button.className = this.buttonCSS;
        this.button.addEventListener('click', this.callback);
        this.button.setAttribute('tooltipenabled', 'enabled');        
        
        
        // Tooltip
        this.button.addEventListener('mouseover', (event) => {
            if (this.button.getAttribute('tooltipenabled') !== 'enabled') return;
            const descriptionDiv = document.createElement('div');
            descriptionDiv.textContent = this.description;
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
    
        return this.button;
    }
    

    // Optionally, create a static factory method to directly return the button element
    static createButton(name: string, txt: string, callback: () => void, css: string = ''): HTMLElement {
        const btn = new Button(name, txt, callback, css);
        return btn.button;
    }
    // Optionally, create a static factory method to directly return the button element
    static createMilestoneButton(milestone: {[key: string]: any}, css: string = ''): HTMLElement {
        const btn = new Button(milestone.name, milestone.text, milestone.function, css);
        btn.description = milestone.description;
        return btn.button;
    }

}