package com.nearme.repository;

import com.nearme.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    // Update last_seen_at — called every 2 min while app is open
    @Modifying
    @Query("UPDATE User u SET u.lastSeenAt = :now WHERE u.userId = :userId")
    void updateLastSeen(@Param("userId") UUID userId, @Param("now") Instant now);

    // All users live in a specific campus block (last seen within 15 min)
    @Query("SELECT COUNT(u) FROM User u WHERE u.campusBlockId = :blockId " +
           "AND u.lastSeenAt > :cutoff AND u.status = 'ACTIVE'")
    long countLiveUsersInBlock(@Param("blockId") UUID blockId, @Param("cutoff") Instant cutoff);



    // Pending verification queue
    List<User> findAllByVerificationStatus(User.VerificationStatus status);


    // Find all users who posted requests inside a given cluster
// @Query("SELECT DISTINCT r.user FROM Request r WHERE r.clusterId = :clusterId")
// List<User> findUsersByClusterId(@Param("clusterId") UUID clusterId);

// ADD this instead:
@Query("SELECT DISTINCT r.user FROM Request r WHERE r.block.blockId = :blockId")
List<User> findUsersByBlockId(@Param("blockId") UUID blockId);

// Find all admin users for push notifications
// List<User> findAllByRole(String role);  // then call with "ADMIN"
// or if you store admins differently:
@Query("SELECT u FROM User u WHERE u.admin = true")
List<User> findAllAdmins();
}