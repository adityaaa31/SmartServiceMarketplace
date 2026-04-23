package com.smartservice.dto.request;

import com.smartservice.entity.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageRequest {

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    @NotBlank(message = "Message content is required")
    private String content;

    private Long bookingId;

    private ChatMessage.MessageType type = ChatMessage.MessageType.TEXT;
}
