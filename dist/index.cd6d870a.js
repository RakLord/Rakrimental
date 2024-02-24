class Game {
    constructor(){
        console.log("Game Constructor");
        this.textElements = this.getText();
        this.mainInterval = 1000;
        console.log(this.textElements);
        this.gameLoop = setInterval(this.update.bind(this), this.mainInterval);
        this.points = 0;
    }
    getText() {
        let textElements;
        textElements = {
            points: document.getElementById("header-text-points"),
            pointsPerSec: document.getElementById("header-text-points-per-sec")
        };
        return textElements;
    }
    update() {
        this.points += 1;
        this.textElements.points.innerText = this.points.toString();
    }
    save() {}
    load() {}
}
let game;
document.addEventListener("DOMContentLoaded", function() {
    game = new Game();
});

//# sourceMappingURL=index.cd6d870a.js.map
