import King from '../pieces/king';
import Queen from '../pieces/queen';
import Rook from '../pieces/rook';
import Bishop from '../pieces/bishop';
import Knight from '../pieces/knight';
import Pawn from '../pieces/pawn'; 


let boardToFen = (squares, enPassat) => {
    var fen = "";
    for (var row = 0; row < 8; row++) {
        var numEmpty = 0;
        for (var col = 0; col < 8; col++) {
            var piece = squares[row * 8 + col];
            if (piece === null) {
                numEmpty++;
                if (col === 7) fen += numEmpty;
            } else if (piece !== null) {
                if (numEmpty > 0) {
                    fen += numEmpty;
                    numEmpty = 0;
                }
                var code = "";
                if (piece instanceof Pawn) {
                    code = 'p';
                } else if (piece instanceof Rook) {
                    code = 'r';
                } else if (piece instanceof Knight) {
                    code = 'n';
                } else if (piece instanceof Bishop) {
                    code = 'b';
                } else if (piece instanceof Queen) {
                    code = 'q';
                } else if (piece instanceof King) {
                    code = 'k';
                }
                if (piece.player === 1) {
                    code = code.toUpperCase();
                }
                fen += code;
            } 
        }
        if (row < 7) fen += "/";
    }

    fen += " b ";

    var castleCode = "";
    if (squares[60] instanceof King && !squares[60].hasMoved) {
        if (squares[63] instanceof Rook && !squares[63].hasMoved) {
            castleCode += "K";
        }
        if (squares[56] instanceof Rook && !squares[56].hasMoved) {
            castleCode += "Q";
        }
    } 
    if (squares[4] instanceof King && !squares[4].hasMoved) {
        if (squares[7] instanceof Rook && !squares[7].hasMoved) {
            castleCode += "k";
        }
        if (squares[0] instanceof Rook && !squares[0].hasMoved) {
            castleCode += "q";
        }
    }
    castleCode = castleCode === "" ? "-" : castleCode;
    fen += castleCode;

    fen += " " + enPassat;

    fen += " 0 1";

    return fen;
}

let fenToBoard = (fen) => {
    fen = fen + "";
    const squares = new Array(64).fill(null);
    var rows = fen.split('/');
    rows[7] = rows[7].split(" ")[0];
    for (var currRow = 0; currRow < rows.length; currRow++) {
        var row = rows[currRow];
        var index = currRow * 8;
        for (var col = 0; col < row.length; col++) {
            var char = row[col];
            if (char >= '0' && char <= '9') {
                index += parseInt(char);
            } else {
                if (char === "P") {
                    squares[index] = new Pawn(1);
                } else if (char === "R") {
                    squares[index] = new Rook(1);
                } else if (char === "N") {
                    squares[index] = new Knight(1);
                } else if (char === "B") {
                    squares[index] = new Bishop(1);
                } else if (char === "Q") {
                    squares[index] = new Queen(1);
                } else if (char === "K") {
                    squares[index] = new King(1);
                } else if (char === "p") {
                    squares[index] = new Pawn(2);
                } else if (char === "r") {
                    squares[index] = new Rook(2);
                } else if (char === "n") {
                    squares[index] = new Knight(2);
                } else if (char === "b") {
                    squares[index] = new Bishop(2);
                } else if (char === "q") {
                    squares[index] = new Queen(2);
                } else if (char === "k") {
                    squares[index] = new King(2);
                }
                index++;
            }
        }
    }

    return squares;
}

export {boardToFen}
export {fenToBoard}