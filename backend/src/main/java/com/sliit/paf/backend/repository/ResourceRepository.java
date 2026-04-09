package com.sliit.paf.backend.repository;

import com.sliit.paf.backend.models.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByStatus(Resource.ResourceStatus status);

    List<Resource> findByBrandIgnoreCase(String brand);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(int minCapacity);

    // Combined filter: type + status
    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);

    // Search by name (partial, case-insensitive)
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Resource> searchByName(String keyword);
}
