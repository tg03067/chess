document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const board = [];
    let currentTurn = 'white';
    let selectedSquare = null;
    let highlightedSquares = [];
    let isPlayerWhite = true;
    let isHost = false;
    let roomNumber = '';

    const socket = new WebSocket('ws://localhost:8080/chess');

    socket.onopen = () => {
        console.log('Connected to server');
    };

    socket.onmessage = (event) => {
        const message = event.data;
        const parts = message.split(' ', 2);
        const command = parts[0];

        if (command === 'movePiece') {
            const move = parts[1].split(' ');
            const fromRow = parseInt(move[0]);
            const fromCol = parseInt(move[1]);
            const toRow = parseInt(move[2]);
            const toCol = parseInt(move[3]);
            movePiece(fromRow, fromCol, toRow, toCol);
        }
    };

    const generateRoomNumber = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 6;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const createGame = () => {
        isHost = true;
        roomNumber = generateRoomNumber();
        socket.send(`createGame ${roomNumber}`);
        alert('Room created. Room number: ' + roomNumber);
        return roomNumber;
    };

    const joinGame = (room) => {
        if (room) {
            socket.send(`joinGame ${room}`);
            alert('Joined room: ' + room);
        } else {
            alert('Invalid room number.');
        }
    };

    const hostGame = () => {
        roomNumber = createGame();
        return roomNumber;
    };

    const joinHostedGame = () => {
        const room = prompt('Enter room number:');
        joinGame(room);
    };

    document.getElementById('hostButton').addEventListener('click', () => {
        const room = hostGame();
    });

    document.getElementById('joinButton').addEventListener('click', () => {
        joinHostedGame();
    });

    const movePiece = (fromRow, fromCol, toRow, toCol) => {
        const pieceDiv = board[fromRow][fromCol].querySelector('.piece');
        board[fromRow][fromCol].innerHTML = '';
        board[toRow][toCol].innerHTML = '';
        console.log(123);
        if (pieceDiv) {
            board[toRow][toCol].appendChild(pieceDiv);
        }
        socket.send(`movePiece ${roomNumber} ${fromRow} ${fromCol} ${toRow} ${toCol}`);
    };

    const createBoard = () => {
        const initialBoard = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];

        const pieceClass = {
            'K': 'white-king',
            'Q': 'white-queen',
            'B': 'white-bishop',
            'N': 'white-knight',
            'R': 'white-rook',
            'P': 'white-pawn',
            'k': 'black-king',
            'q': 'black-queen',
            'b': 'black-bishop',
            'n': 'black-knight',
            'r': 'black-rook',
            'p': 'black-pawn'
        };

        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;
                const piece = initialBoard[i][j];
                if (piece) {
                    const pieceDiv = document.createElement('div');
                    pieceDiv.classList.add('piece', pieceClass[piece]);
                    pieceDiv.dataset.piece = piece;
                    square.appendChild(pieceDiv);
                }
                chessboard.appendChild(square);
                row.push(square);
            }
            board.push(row);
        }
    };

    createBoard();
});
