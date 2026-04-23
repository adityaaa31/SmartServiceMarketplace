package com.smartservice.repository;

import com.smartservice.entity.ChatMessage;
import com.smartservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(
            @Param("user1") User user1,
            @Param("user2") User user2);

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2 AND m.booking.id = :bookingId) OR " +
           "(m.sender = :user2 AND m.receiver = :user1 AND m.booking.id = :bookingId) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversationByBooking(
            @Param("user1") User user1,
            @Param("user2") User user2,
            @Param("bookingId") Long bookingId);

    @Query("SELECT DISTINCT CASE WHEN m.sender = :user THEN m.receiver ELSE m.sender END " +
           "FROM ChatMessage m WHERE m.sender = :user OR m.receiver = :user")
    List<User> findChatContacts(@Param("user") User user);

    long countBySenderAndReceiverAndReadFalse(User sender, User receiver);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.read = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.read = false")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
}
