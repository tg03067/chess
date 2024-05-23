package com.green.chess.common;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.socket.WebSocketSession;

public class GameSession {
    private List<WebSocketSession> players;
    private String[][] board;
    private String currentTurn;

    public GameSession() {
        players = new ArrayList<>();
        board = new String[8][8];
        initializeBoard();
        currentTurn = "white";
    }

    private void initializeBoard() {
        // 초기 체스 보드 설정
        board = new String[][] {
                {"r", "n", "b", "q", "k", "b", "n", "r"},
                {"p", "p", "p", "p", "p", "p", "p", "p"},
                {"", "", "", "", "", "", "", ""},
                {"", "", "", "", "", "", "", ""},
                {"", "", "", "", "", "", "", ""},
                {"", "", "", "", "", "", "", ""},
                {"P", "P", "P", "P", "P", "P", "P", "P"},
                {"R", "N", "B", "Q", "K", "B", "N", "R"}
        };
    }

    public String addPlayer(WebSocketSession session) {
        if (players.size() < 2) {
            players.add(session);
            return (players.size() == 1) ? "white" : "black";
        }
        return "spectator"; // 3번째 이상 접속자는 관전자로 처리
    }

    public boolean makeMove(int fromRow, int fromCol, int toRow, int toCol) {
        String piece = board[fromRow][fromCol];
        if (isValidMove(piece, fromRow, fromCol, toRow, toCol)) {
            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = "";
            currentTurn = currentTurn.equals("white") ? "black" : "white";
            return true;
        }
        return false;
    }

    public String getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(String currentTurn) {
        this.currentTurn = currentTurn;
    }

    public List<WebSocketSession> getPlayers() {
        return players;
    }

    public void removePlayer(WebSocketSession session) {
        players.remove(session);
    }

    public String[][] getBoard() {
        return board;
    }

    public GameState getGameState() {
        return new GameState(board, currentTurn);
    }

    private boolean isValidMove(String piece, int fromRow, int fromCol, int toRow, int toCol) {
        // 기물의 유효한 이동인지 확인하는 로직을 여기에 추가
        // 간단한 예로 모든 이동을 허용한다고 가정
        return true;
    }
}
