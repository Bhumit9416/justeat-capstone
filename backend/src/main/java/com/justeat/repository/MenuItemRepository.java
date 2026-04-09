package com.justeat.repository;

import com.justeat.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdOrderByOrderCountDesc(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsSpecialTrue(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsDealOfDayTrue(Long restaurantId);
}

