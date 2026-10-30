-- Network Quality Monitoring System
-- Database Schema

CREATE DATABASE IF NOT EXISTS network_quality_monitor;

USE network_quality_monitor;

-- Table 1: Monitoring Targets
CREATE TABLE IF NOT EXISTS targets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    host VARCHAR(100) NOT NULL,
    interval_seconds INT NOT NULL DEFAULT 60,
    threshold_ms INT NOT NULL DEFAULT 1000,
    url VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    current_status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    last_checked_at DATETIME NULL
);

-- Table 2: Monitoring Check Results
CREATE TABLE IF NOT EXISTS check_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    http_status_code INT NULL,
    response_time_ms INT NULL,
    error_message TEXT NULL,

    FOREIGN KEY (target_id) REFERENCES targets(id)
);

-- Table 3: Monitoring Events
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,

    FOREIGN KEY (target_id) REFERENCES targets(id)
);