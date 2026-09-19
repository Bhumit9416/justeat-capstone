package com.justeat.config;

import com.justeat.entity.MenuItem;
import com.justeat.entity.Restaurant;
import com.justeat.entity.User;
import com.justeat.enums.Role;
import com.justeat.repository.MenuItemRepository;
import com.justeat.repository.RestaurantRepository;
import com.justeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }

        User owner = userRepository.save(User.builder()
                .username("owner")
                .email("owner@justeat.dev")
                .password(passwordEncoder.encode("Owner@123"))
                .role(Role.OWNER)
                .build());

        userRepository.save(User.builder()
                .username("customer")
                .email("customer@justeat.dev")
                .password(passwordEncoder.encode("Customer@123"))
                .role(Role.CUSTOMER)
                .build());

        Restaurant spice = saveRestaurant(owner, "Spice Garden", "North Indian", "Connaught Place, Delhi",
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=500&fit=crop", 4.6, 128);
        addItem(spice, "Butter Chicken", "Creamy tomato gravy with tender chicken", 320, false, true, true,
                "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop");
        addItem(spice, "Paneer Tikka Masala", "Grilled cottage cheese in spiced gravy", 280, true, false, false,
                "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop");
        addItem(spice, "Garlic Naan", "Tandoor-baked naan with garlic butter", 60, true, false, true,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop");
        addItem(spice, "Chicken Biryani", "Hyderabadi-style dum biryani", 350, false, true, false,
                "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop");

        Restaurant pizza = saveRestaurant(owner, "Napoli Woodfire", "Pizza", "Koramangala, Bengaluru",
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop", 4.5, 96);
        addItem(pizza, "Margherita", "San Marzano tomato, mozzarella, basil", 349, true, true, true,
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop");
        addItem(pizza, "Pepperoni", "Classic pepperoni with extra cheese", 429, false, false, true,
                "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop");
        addItem(pizza, "Truffle Mushroom", "Wild mushrooms and truffle oil", 499, true, false, false,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop");

        Restaurant burger = saveRestaurant(owner, "Smash & Stack", "Burger", "Bandra West, Mumbai",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop", 4.4, 74);
        addItem(burger, "Classic Smash", "Double smash patty, American cheese", 289, false, true, true,
                "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop");
        addItem(burger, "Crispy Veggie", "Panko-crusted veg patty, chipotle mayo", 249, true, false, false,
                "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop");
        addItem(burger, "Loaded Fries", "Cheese sauce, jalapeños, herbs", 179, true, true, false,
                "https://images.unsplash.com/photo-1573080496219-bb080326f590?w=400&h=300&fit=crop");

        Restaurant sushi = saveRestaurant(owner, "Sakura Sushi", "Sushi", "Indiranagar, Bengaluru",
                "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=500&fit=crop", 4.7, 61);
        addItem(sushi, "Salmon Nigiri Set", "6-piece fresh salmon nigiri", 520, false, true, true,
                "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop");
        addItem(sushi, "Veg California Roll", "Avocado, cucumber, tobiko-style sesame", 340, true, false, false,
                "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop");
        addItem(sushi, "Miso Soup", "Classic dashi miso with tofu", 120, true, false, true,
                "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop");

        Restaurant south = saveRestaurant(owner, "Dosa House", "South Indian", "T. Nagar, Chennai",
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&h=500&fit=crop", 4.8, 210);
        addItem(south, "Masala Dosa", "Crispy dosa with potato masala", 140, true, true, true,
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop");
        addItem(south, "Idli Sambar", "Steamed idlis with hot sambar", 90, true, false, true,
                "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop");
        addItem(south, "Filter Coffee", "Strong South Indian filter coffee", 50, true, true, false,
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop");

        Restaurant chinese = saveRestaurant(owner, "Dragon Wok", "Chinese", "Park Street, Kolkata",
                "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&h=500&fit=crop", 4.3, 88);
        addItem(chinese, "Hakka Noodles", "Stir-fried noodles with veggies", 220, true, false, true,
                "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop");
        addItem(chinese, "Chilli Chicken", "Indo-Chinese crispy chilli chicken", 310, false, true, false,
                "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop");
        addItem(chinese, "Veg Manchurian", "Fried veggie balls in tangy sauce", 240, true, true, false,
                "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop");

        log.info("Seeded demo users (customer/Customer@123, owner/Owner@123) and 6 restaurants");
    }

    private Restaurant saveRestaurant(User owner, String name, String cuisine, String location,
                                      String imageUrl, double rating, long ratingCount) {
        return restaurantRepository.save(Restaurant.builder()
                .name(name)
                .cuisine(cuisine)
                .location(location)
                .imageUrl(imageUrl)
                .rating(rating)
                .ratingCount(ratingCount)
                .owner(owner)
                .build());
    }

    private void addItem(Restaurant restaurant, String name, String description, double price,
                         boolean veg, boolean special, boolean deal, String imageUrl) {
        menuItemRepository.save(MenuItem.builder()
                .restaurant(restaurant)
                .name(name)
                .description(description)
                .price(price)
                .isVeg(veg)
                .isSpecial(special)
                .isDealOfDay(deal)
                .isMostlyOrdered(special)
                .orderCount(special ? 42L : 8L)
                .imageUrl(imageUrl)
                .build());
    }
}
