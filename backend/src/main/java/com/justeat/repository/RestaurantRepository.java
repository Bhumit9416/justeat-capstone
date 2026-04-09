package com.justeat.repository;

import com.justeat.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByOwnerId(Long ownerId);

    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:name = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:cuisine = '' OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%'))) AND " +
           "(:location = '' OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Restaurant> search(@Param("name") String name,
                            @Param("cuisine") String cuisine,
                            @Param("location") String location);
}

