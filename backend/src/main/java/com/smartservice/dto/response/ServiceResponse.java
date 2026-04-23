package com.smartservice.dto.response;

import com.smartservice.entity.Service;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Service.ServiceStatus status;
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalBookings;
    private String location;
    private Integer deliveryTime;
    private Long providerId;
    private String providerName;
    private String providerImage;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
}
