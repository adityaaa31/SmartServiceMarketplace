package com.smartservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long serviceId;
    private String serviceTitle;
    private Long customerId;
    private String customerName;
    private String customerImage;
    private Long bookingId;
    private LocalDateTime createdAt;
}
