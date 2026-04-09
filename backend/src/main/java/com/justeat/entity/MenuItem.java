package com.justeat.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Builder.Default
    private Boolean isSpecial = false;

    @Builder.Default
    private Boolean isDealOfDay = false;

    @Builder.Default
    private Boolean isMostlyOrdered = false;

    @Builder.Default
    private Boolean isVeg = true;

    @Builder.Default
    private Long orderCount = 0L;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
}

