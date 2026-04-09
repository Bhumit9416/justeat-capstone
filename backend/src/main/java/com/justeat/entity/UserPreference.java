package com.justeat.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection
    @CollectionTable(name = "fav_restaurants", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "restaurant_id")
    @Builder.Default
    private List<Long> favouriteRestaurantIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "preferred_cuisines", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "cuisine")
    @Builder.Default
    private List<String> preferredCuisines = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "dietary_restrictions", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "restriction")
    @Builder.Default
    private List<String> dietaryRestrictions = new ArrayList<>();
}

