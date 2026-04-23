package com.smartservice.service;

import com.smartservice.dto.request.ServiceRequest;
import com.smartservice.dto.response.ServiceResponse;
import com.smartservice.entity.Category;
import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import com.smartservice.exception.AccessDeniedException;
import com.smartservice.exception.ResourceNotFoundException;
import com.smartservice.repository.CategoryRepository;
import com.smartservice.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public Page<ServiceResponse> searchServices(String search, Long categoryId,
                                                 BigDecimal minPrice, BigDecimal maxPrice,
                                                 Double minRating, Pageable pageable) {
        return serviceRepository.searchServices(search, categoryId, minPrice, maxPrice, minRating, pageable)
                .map(this::mapToResponse);
    }

    public ServiceResponse getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return mapToResponse(service);
    }

    public Page<ServiceResponse> getProviderServices(Pageable pageable) {
        User provider = userService.getCurrentUser();
        return serviceRepository.findByProvider(provider, pageable).map(this::mapToResponse);
    }

    public Page<ServiceResponse> getAllServices(Pageable pageable) {
        return serviceRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ServiceResponse> getServicesByStatus(Service.ServiceStatus status, Pageable pageable) {
        return serviceRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }

    public ServiceResponse createService(ServiceRequest request) {
        User provider = userService.getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Service service = Service.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .location(request.getLocation())
                .deliveryTime(request.getDeliveryTime())
                .provider(provider)
                .category(category)
                .status(Service.ServiceStatus.PENDING)
                .build();

        return mapToResponse(serviceRepository.save(service));
    }

    public ServiceResponse updateService(Long id, ServiceRequest request) {
        User currentUser = userService.getCurrentUser();
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        if (!service.getProvider().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to update this service");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setCategory(category);
        service.setLocation(request.getLocation());
        service.setDeliveryTime(request.getDeliveryTime());
        if (request.getImageUrl() != null) service.setImageUrl(request.getImageUrl());

        return mapToResponse(serviceRepository.save(service));
    }

    public void deleteService(Long id) {
        User currentUser = userService.getCurrentUser();
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        if (!service.getProvider().getId().equals(currentUser.getId())
                && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("You don't have permission to delete this service");
        }

        serviceRepository.delete(service);
    }

    public ServiceResponse approveService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        service.setStatus(Service.ServiceStatus.APPROVED);
        return mapToResponse(serviceRepository.save(service));
    }

    public ServiceResponse rejectService(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        service.setStatus(Service.ServiceStatus.REJECTED);
        return mapToResponse(serviceRepository.save(service));
    }

    public ServiceResponse mapToResponse(Service service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .price(service.getPrice())
                .imageUrl(service.getImageUrl())
                .status(service.getStatus())
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .totalBookings(service.getTotalBookings())
                .location(service.getLocation())
                .deliveryTime(service.getDeliveryTime())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getName())
                .providerImage(service.getProvider().getProfileImage())
                .categoryId(service.getCategory().getId())
                .categoryName(service.getCategory().getName())
                .createdAt(service.getCreatedAt())
                .build();
    }
}
