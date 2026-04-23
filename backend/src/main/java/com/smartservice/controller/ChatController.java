package com.smartservice.controller;

import com.smartservice.dto.request.ChatMessageRequest;
import com.smartservice.dto.response.ApiResponse;
import com.smartservice.dto.response.ChatMessageResponse;
import com.smartservice.dto.response.UserResponse;
import com.smartservice.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(request);
        // Push via WebSocket to receiver
        messagingTemplate.convertAndSendToUser(
                response.getReceiverId().toString(),
                "/queue/messages",
                response
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent", response));
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversation(userId)));
    }

    @GetMapping("/conversation/{userId}/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getConversationByBooking(
            @PathVariable Long userId, @PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversationByBooking(userId, bookingId)));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getChatContacts() {
        return ResponseEntity.ok(ApiResponse.success(chatService.getChatContacts()));
    }

    @GetMapping("/unread/{senderId}")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long senderId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getUnreadCount(senderId)));
    }

    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(request);
        messagingTemplate.convertAndSendToUser(
                response.getReceiverId().toString(),
                "/queue/messages",
                response
        );
    }
}
