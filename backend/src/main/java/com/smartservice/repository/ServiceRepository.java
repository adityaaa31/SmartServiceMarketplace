package com.smartservice.repository;

import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Page<Service> findByProvider(User provider, Pageable pageable);

    Page<Service> findByStatus(Service.ServiceStatus status, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.status = 'APPROVED' AND " +
           "(:search IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR s.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR s.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR s.averageRating >= :minRating)")
    Page<Service> searchServices(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") Double minRating,
            Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.status = 'APPROVED' ORDER BY s.totalBookings DESC")
    List<Service> findTopServices(Pageable pageable);

    long countByStatus(Service.ServiceStatus status);

    long countByProvider(User provider);
}
