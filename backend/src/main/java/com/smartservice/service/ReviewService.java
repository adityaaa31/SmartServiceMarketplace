package com.smartservice.service;

import com.smartservice.dto.request.ReviewRequest;
import com.smartservice.dto.response.ReviewResponse;
import com.smartservice.entity.Booking;
import com.smartservice.entity.Review;
import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import com.smartservice.exception.AccessDeniedException;
import com.smartservice.exception.BadRequestException;
import com.smartservice.exception.ResourceNotFoundException;
import com.smartservice.repository.BookingRepository;
import com.smartservice.repository.ReviewRepository;
import com.smartservice.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserService userService;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        User customer = userService.getCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You can only review your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("You can only review completed bookings");
        }

        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new BadRequestException("You have already reviewed this booking");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .service(booking.getService())
                .customer(customer)
                .booking(booking)
                .build();

        reviewRepository.save(review);

        // Update service average rating
        Service service = booking.getService();
        Double avgRating = reviewRepository.getAverageRatingByService(service);
        long totalReviews = reviewRepository.countByService(service);
        service.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        service.setTotalReviews((int) totalReviews);
        serviceRepository.save(service);

        return mapToResponse(review);
    }

    public Page<ReviewResponse> getServiceReviews(Long serviceId, Pageable pageable) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        return reviewRepository.findByService(service, pageable).map(this::mapToResponse);
    }

    public Page<ReviewResponse> getMyReviews(Pageable pageable) {
        User customer = userService.getCurrentUser();
        return reviewRepository.findByCustomer(customer, pageable).map(this::mapToResponse);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .serviceId(review.getService().getId())
                .serviceTitle(review.getService().getTitle())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getName())
                .customerImage(review.getCustomer().getProfileImage())
                .bookingId(review.getBooking().getId())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
