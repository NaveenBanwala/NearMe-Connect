package com.nearme.repository;

import com.nearme.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findAllByOrderByCreatedAtDesc();

    List<Report> findAllByStatus(Report.ReportStatus status);

    long countByStatus(Report.ReportStatus status);
}