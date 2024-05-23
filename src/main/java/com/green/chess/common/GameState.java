package com.green.chess.common;

import java.util.List;

public class GameState {
    private String[][] board;
    private String currentTurn;

    public GameState(String[][] board, String currentTurn) {
        this.board = board;
        this.currentTurn = currentTurn;
    }

    public String[][] getBoard() {
        return board;
    }

    public String getCurrentTurn() {
        return currentTurn;
    }
}
