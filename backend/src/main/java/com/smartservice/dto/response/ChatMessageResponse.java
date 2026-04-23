package com.smartservice.dto.response;

import com.smartservice.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private String content;
    private Long senderId;
    private String senderName;
    private String senderImage;
    private Long receiverId;
    private String receiverName;
    private Long bookingId;
    private boolean read;
    private ChatMessage.MessageType type;
    private LocalDateTime createdAt;
}
