package com.smartservice.service;

import com.smartservice.dto.request.BookingRequest;
import com.smartservice.dto.response.BookingResponse;
import com.smartservice.entity.Booking;
import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import com.smartservice.exception.AccessDeniedException;
import com.smartservice.exception.BadRequestException;
import com.smartservice.exception.ResourceNotFoundException;
import com.smartservice.repository.BookingRepository;
import com.smartservice.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserService userService;

    public BookingResponse createBooking(BookingRequest request) {
        User customer = userService.getCurrentUser();
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (service.getStatus() != Service.ServiceStatus.APPROVED) {
            throw new BadRequestException("Service is not available for booking");
        }

        if (service.getProvider().getId().equals(customer.getId())) {
            throw new BadRequestException("You cannot book your own service");
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .provider(service.getProvider())
                .service(service)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .amount(service.getPrice())
                .notes(request.getNotes())
                .address(request.getAddress())
                .status(Booking.BookingStatus.PENDING)
                .build();

        service.setTotalBookings(service.getTotalBookings() + 1);
        serviceRepository.save(service);

        return mapToResponse(bookingRepository.save(booking));
    }

    public Page<BookingResponse> getCustomerBookings(Pageable pageable) {
        User customer = userService.getCurrentUser();
        return bookingRepository.findByCustomer(customer, pageable).map(this::mapToResponse);
    }

    public Page<BookingResponse> getProviderBookings(Pageable pageable) {
        User provider = userService.getCurrentUser();
        return bookingRepository.findByProvider(provider, pageable).map(this::mapToResponse);
    }

    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(this::mapToResponse);
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        User currentUser = userService.getCurrentUser();

        if (!booking.getCustomer().getId().equals(currentUser.getId())
                && !booking.getProvider().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to view this booking");
        }

        return mapToResponse(booking);
    }

    public BookingResponse updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        User currentUser = userService.getCurrentUser();

        // Provider can accept/reject
        if ((status == Booking.BookingStatus.ACCEPTED || status == Booking.BookingStatus.REJECTED)
                && !booking.getProvider().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the provider can accept or reject bookings");
        }

        // Customer can cancel
        if (status == Booking.BookingStatus.CANCELLED
                && !booking.getCustomer().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the customer can cancel bookings");
        }

        // Admin or provider can complete
        if (status == Booking.BookingStatus.COMPLETED
                && !booking.getProvider().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the provider or admin can complete bookings");
        }

        booking.setStatus(status);
        return mapToResponse(bookingRepository.save(booking));
    }

    public BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getName())
                .customerImage(booking.getCustomer().getProfileImage())
                .providerId(booking.getProvider().getId())
                .providerName(booking.getProvider().getName())
                .serviceId(booking.getService().getId())
                .serviceTitle(booking.getService().getTitle())
                .serviceImage(booking.getService().getImageUrl())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus())
                .amount(booking.getAmount())
                .notes(booking.getNotes())
                .address(booking.getAddress())
                .hasReview(booking.getReview() != null)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
