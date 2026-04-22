// ─────────────────────────────────────────────────────────────────────
// Frontend ESP Integration Service
// Calls backend API endpoints for ESP communication
// ─────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

class EspIntegrationService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // ─────────────────────────────────────────────────────────────────────
  // MISSION STATE SIMULATION
  // Frontend can simulate ESP calls for testing
  // ─────────────────────────────────────────────────────────────────────

  async simulateMissionEvent(endpoint, pkgId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/esp${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pkgId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESP Simulation: ${endpoint} for ${pkgId}`, data);
      return data;
    } catch (error) {
      console.error(`ESP Simulation failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Convenience methods for common mission events
  async simulateDroneLoaded(pkgId) {
    return this.simulateMissionEvent('/mission/loaded', pkgId);
  }

  async simulateEnRoute(pkgId) {
    return this.simulateMissionEvent('/mission/enroute', pkgId);
  }

  async simulateLanded(pkgId) {
    return this.simulateMissionEvent('/mission/landed', pkgId);
  }

  async simulateOffloaded(pkgId) {
    return this.simulateMissionEvent('/mission/offloaded', pkgId);
  }

  async simulateReturning(pkgId) {
    return this.simulateMissionEvent('/mission/returning', pkgId);
  }

  // ─────────────────────────────────────────────────────────────────────
  // TELEMETRY SIMULATION
  // ─────────────────────────────────────────────────────────────────────

  async simulateTelemetryAlert(alertData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/esp/telemetry/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESP Telemetry Alert sent:', data);
      return data;
    } catch (error) {
      console.error('ESP Telemetry Alert failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────────

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────────────

  // Test all endpoints (for development)
  async testAllEndpoints(pkgId = 'TEST-001') {
    const endpoints = [
      '/mission/loaded',
      '/mission/enroute',
      '/mission/landed',
      '/mission/offloaded',
      '/mission/returning'
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const result = await this.simulateMissionEvent(endpoint, pkgId);
        results[endpoint] = { success: true, data: result };
      } catch (error) {
        results[endpoint] = { success: false, error: error.message };
      }
    }

    return results;
  }
}

export const espIntegrationService = new EspIntegrationService();