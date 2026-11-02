
const {
  createEvent,
  findActiveEvent,
  resolveEvent
} = require("../models/eventModel");

const processTargetEvent = async (
  targetId,
  newStatus,
  responseTimeMs,
  criticalThresholdMs
) => {
  // Find existing active event
  const activeEvent = await findActiveEvent(targetId);

  // Handle recovery
  if (newStatus === "UP") {
    if (activeEvent) {
      await resolveEvent(activeEvent.id);

      return {
        action: "RESOLVED",
        eventId: activeEvent.id
      };
    }

    return { action: "NO_EVENT" };
  }

  // Validate status
  if (!["DOWN", "SLOW"].includes(newStatus)) {
    throw new Error("Invalid event status");
  }

  // Validate critical threshold for SLOW status
  if (newStatus === "SLOW") {
    if (
      !Number.isFinite(responseTimeMs) ||
      !Number.isFinite(criticalThresholdMs) ||
      criticalThresholdMs <= 0
    ) {
      throw new Error("Invalid critical threshold or response time");
    }
  }

  // Determine severity
  const severity =
    newStatus === "DOWN" ||
    responseTimeMs >= criticalThresholdMs
      ? "CRITICAL"
      : "WARNING";

  // Same event type and severity: prevent duplicate
  if (
    activeEvent &&
    activeEvent.event_type === newStatus &&
    activeEvent.severity === severity
  ) {
    return {
      action: "UNCHANGED",
      eventId: activeEvent.id
    };
  }

  // Resolve previous active event if condition changed
  if (activeEvent) {
    await resolveEvent(activeEvent.id);
  }

  // Create new event
  const eventId = await createEvent(
    targetId,
    newStatus,
    severity,
    `Target status changed to ${newStatus} (${severity})`
  );

  return {
    action: "CREATED",
    eventId,
    severity
  };
};

module.exports = { processTargetEvent };
