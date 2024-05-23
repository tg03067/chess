package com.green.chess.common;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Component
public class GameWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> roomSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println(session);
        sessions.put(session.getId(), session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        String[] parts = payload.split(" ", 2);
        String command = parts[0];
        if (command.equals("createGame")) {
            String room = parts[1];
            System.out.println("createRoom: " + room);
            roomSessions.put(session.getId(), room);
            session.sendMessage(new TextMessage("Room " + room + " created and you joined"));
        } else if (command.equals("joinGame")) {
            String room = parts[1];
            System.out.println("joinRoom: " + room);
            if (roomSessions.containsValue(room)) {
                roomSessions.put(session.getId(), room);
                session.sendMessage(new TextMessage("Joined room " + room));
            } else {
                session.sendMessage(new TextMessage("Room " + room + " does not exist"));
            }
        } else if (command.equals("movePiece")) {
            String move = parts[1];
            String room = roomSessions.get(session.getId());
            if (room != null) {
                for (Map.Entry<String, String> entry : roomSessions.entrySet()) {
                    if (entry.getValue().equals(room) && !entry.getKey().equals(session.getId())) {
                        WebSocketSession peer = sessions.get(entry.getKey());
                        if (peer != null) {
                            peer.sendMessage(new TextMessage("movePiece " + move));
                        }
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        roomSessions.remove(session.getId());
    }
}
