package com.smartservice.dto.response;

import com.smartservice.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerImage;
    private Long providerId;
    private String providerName;
    private Long serviceId;
    private String serviceTitle;
    private String serviceImage;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Booking.BookingStatus status;
    private BigDecimal amount;
    private String notes;
    private String address;
    private boolean hasReview;
    private LocalDateTime createdAt;
}
