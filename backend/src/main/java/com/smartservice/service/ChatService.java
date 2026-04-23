package com.smartservice.service;

import com.smartservice.dto.request.ChatMessageRequest;
import com.smartservice.dto.response.ChatMessageResponse;
import com.smartservice.dto.response.UserResponse;
import com.smartservice.entity.Booking;
import com.smartservice.entity.ChatMessage;
import com.smartservice.entity.User;
import com.smartservice.exception.ResourceNotFoundException;
import com.smartservice.repository.BookingRepository;
import com.smartservice.repository.ChatMessageRepository;
import com.smartservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final UserService userService;

    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User sender = userService.getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        ChatMessage.ChatMessageBuilder builder = ChatMessage.builder()
                .content(request.getContent())
                .sender(sender)
                .receiver(receiver)
                .type(request.getType());

        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            builder.booking(booking);
        }

        ChatMessage message = chatMessageRepository.save(builder.build());
        return mapToResponse(message);
    }

    public List<ChatMessageResponse> getConversation(Long userId) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        chatMessageRepository.markMessagesAsRead(otherUser, currentUser);

        return chatMessageRepository.findConversation(currentUser, otherUser)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getConversationByBooking(Long userId, Long bookingId) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        chatMessageRepository.markMessagesAsRead(otherUser, currentUser);

        return chatMessageRepository.findConversationByBooking(currentUser, otherUser, bookingId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getChatContacts() {
        User currentUser = userService.getCurrentUser();
        return chatMessageRepository.findChatContacts(currentUser)
                .stream().map(userService::mapToResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(Long senderId) {
        User currentUser = userService.getCurrentUser();
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return chatMessageRepository.countBySenderAndReceiverAndReadFalse(sender, currentUser);
    }

    private ChatMessageResponse mapToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderImage(message.getSender().getProfileImage())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getName())
                .bookingId(message.getBooking() != null ? message.getBooking().getId() : null)
                .read(message.isRead())
                .type(message.getType())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
