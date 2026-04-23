package com.smartservice.repository;

import com.smartservice.entity.Review;
import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByService(Service service, Pageable pageable);

    Page<Review> findByCustomer(User customer, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.service = :service")
    Double getAverageRatingByService(@Param("service") Service service);

    long countByService(Service service);
}
