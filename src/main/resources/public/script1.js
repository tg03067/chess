document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const joinButton = document.getElementById('joinButton');
    let ws;
    let sessionId;
    let currentTurn = 'white';
    let selectedSquare = null;
    let highlightedSquares = [];
    let boardState = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    joinButton.addEventListener('click', () => {
        if (ws) {
            ws.close(); // 기존 WebSocket 연결이 있으면 닫기
        }

        ws = new WebSocket('ws://localhost:8080/game');

        ws.onopen = () => {
            sessionId = prompt('Enter game session ID:');
            ws.send(JSON.stringify({ type: 'JOIN', sessionId }));
        };

        ws.onmessage = (message) => {
            try {
                const gameState = JSON.parse(message.data);
                currentTurn = gameState.currentTurn;
                boardState = gameState.board;
                updateBoard();
            } catch (e) {
                console.log("Received non-JSON message:", message.data);
                if (message.data.startsWith("You are playing as ")) {
                    const color = message.data.split(" ")[4];
                    isPlayerWhite = (color === "white");
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error observed:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
    });



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

    const createBoard = () => {
        chessboard.innerHTML = ''; // Clear previous board
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;
                square.addEventListener('click', () => handleSquareClick(i, j));
                square.addEventListener('mouseenter', () => handleMouseEnter(i, j));
                square.addEventListener('mouseleave', () => handleMouseLeave(i, j));
                chessboard.appendChild(square);
            }
        }
        updateBoard();
    };

    const updateBoard = () => {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.querySelector(`.square[data-row="${i}"][data-col="${j}"]`);
                const piece = boardState[i][j];
                square.innerHTML = '';
                if (piece) {
                    const pieceDiv = document.createElement('div');
                    pieceDiv.classList.add('piece', pieceClass[piece]);
                    pieceDiv.dataset.piece = piece;
                    square.appendChild(pieceDiv);
                }
            }
        }
    };

    const handleSquareClick = (row, col) => {
        const piece = boardState[row][col];

        if (selectedSquare) {
            const fromRow = selectedSquare.row;
            const fromCol = selectedSquare.col;
            const toRow = row;
            const toCol = col;

            if (ws && ws.readyState === WebSocket.OPEN) {
                if (isValidMove(boardState[fromRow][fromCol], fromRow, fromCol, toRow, toCol)) {
                    // 기물 이동 후 보드 상태 업데이트
                    const movedPiece = boardState[fromRow][fromCol];
                    boardState[toRow][toCol] = movedPiece;
                    boardState[fromRow][fromCol] = '';

                    // 서버에 이동 메시지 전송 (promotionPiece 필드 제거)
                    ws.send(JSON.stringify({ type: 'MOVE', sessionId, fromRow, fromCol, toRow, toCol }));

                    updateBoard();
                } else {
                    console.error("Invalid move");
                }
            } else {
                console.error("WebSocket is not open");
            }

            clearHighlights();
            selectedSquare = null;
        } else {
            if (piece && ((currentTurn === 'white' && piece === piece.toUpperCase() && isPlayerWhite) || (currentTurn === 'black' && piece === piece.toLowerCase() && !isPlayerWhite))) {
                selectedSquare = { row, col };
                highlightValidMoves(row, col);
            }
        }
    };










    const handleMouseEnter = (row, col) => {
        const piece = boardState[row][col];
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        if (piece && ((currentTurn === 'white' && piece === piece.toUpperCase()) || (currentTurn === 'black' && piece === piece.toLowerCase()))) {
            square.classList.add('selectable');
        }
    };

    const handleMouseLeave = (row, col) => {
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        square.classList.remove('selectable');
    };

    const highlightValidMoves = (row, col) => {
        clearHighlights();
        const piece = boardState[row][col];
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (isValidMove(piece, row, col, toRow, toCol)) {
                    const square = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);
                    square.classList.add('highlight');
                    highlightedSquares.push(square);
                }
            }
        }
    };

    const clearHighlights = () => {
        highlightedSquares.forEach(square => square.classList.remove('highlight'));
        highlightedSquares = [];
    };

    const isValidMove = (piece, fromRow, fromCol, toRow, toCol) => {
        const deltaRow = toRow - fromRow;
        const deltaCol = toCol - fromCol;

        // 같은 팀의 기물이 있는 경우 이동을 허용하지 않음
        const targetPiece = boardState[toRow][toCol];
        if (targetPiece && ((piece === piece.toUpperCase() && targetPiece === targetPiece.toUpperCase()) ||
            (piece === piece.toLowerCase() && targetPiece === targetPiece.toLowerCase()))) {
            return false;
        }

        switch (piece.toLowerCase()) {
            case 'p': // Pawn
                if (piece === 'P') { // White pawn
                    if (deltaRow === -1 && deltaCol === 0 && !targetPiece) {
                        return true;
                    } else if (deltaRow === -2 && deltaCol === 0 && fromRow === 6 && !targetPiece) {
                        return true;
                    } else if (deltaRow === -1 && Math.abs(deltaCol) === 1 && targetPiece) {
                        return true;
                    }
                } else { // Black pawn
                    if (deltaRow === 1 && deltaCol === 0 && !targetPiece) {
                        return true;
                    } else if (deltaRow === 2 && deltaCol === 0 && fromRow === 1 && !targetPiece) {
                        return true;
                    } else if (deltaRow === 1 && Math.abs(deltaCol) === 1 && targetPiece) {
                        return true;
                    }
                }
                return false;
            case 'r': // Rook
                return (deltaRow === 0 || deltaCol === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
            case 'n': // Knight
                return (Math.abs(deltaRow) === 2 && Math.abs(deltaCol) === 1) || (Math.abs(deltaRow) === 1 && Math.abs(deltaCol) === 2);
            case 'b': // Bishop
                return Math.abs(deltaRow) === Math.abs(deltaCol) && isPathClear(fromRow, fromCol, toRow, toCol);
            case 'q': // Queen
                return (Math.abs(deltaRow) === Math.abs(deltaCol) || deltaRow === 0 || deltaCol === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
            case 'k': // King
                return Math.abs(deltaRow) <= 1 && Math.abs(deltaCol) <= 1;
            default:
                return false;
        }
    };

    const isPathClear = (fromRow, fromCol, toRow, toCol) => {
        const deltaRow = Math.sign(toRow - fromRow);
        const deltaCol = Math.sign(toCol - fromCol);
        let row = fromRow + deltaRow;
        let col = fromCol + deltaCol;

        while (row !== toRow || col !== toCol) {
            if (boardState[row][col]) {
                return false;
            }
            row += deltaRow;
            col += deltaCol;
        }

        return true;
    };

    createBoard();
});
