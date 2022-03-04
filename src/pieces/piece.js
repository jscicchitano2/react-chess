export default class Piece {
    constructor(player, iconUrl) {
        this.player = player;
        this.style = { backgroundImage: "url('" + iconUrl + "')" };
        this.hasMoved = false;
    }

    getPlayer() {
        return this.player
    }
}