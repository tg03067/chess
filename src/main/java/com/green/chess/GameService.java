package com.green.chess;

import java.util.HashMap;
import java.util.Map;

import com.green.chess.common.GameSession;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    private Map<String, GameSession> sessions = new HashMap<>();

    public GameSession getSession(String sessionId) {
        return sessions.computeIfAbsent(sessionId, k -> new GameSession());
    }
}
