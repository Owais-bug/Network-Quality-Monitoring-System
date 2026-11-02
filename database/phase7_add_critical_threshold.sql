-- Phase 7: Add critical response-time threshold
-- Run once on a database that does not have this column.

ALTER TABLE targets
ADD COLUMN critical_threshold_ms INT NOT NULL DEFAULT 2000
AFTER threshold_ms;