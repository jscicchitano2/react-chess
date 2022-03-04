export default class Piece {
    constructor(player, iconUrl) {
        this.player = player;
        this.style = { backgroundImage: "url('" + iconUrl + "')" };
        this.hasMoved = false;
        this.type = "";
    }

    getPlayer() {
        return this.player
    }
}