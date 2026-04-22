// ─────────────────────────────────────────────────────────────────────
// ESP Test Page
// Allows testing ESP integration endpoints from the frontend
// ─────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { espIntegrationService } from '../services/espFrontendService';

const EspTestPage = () => {
  const [pkgId, setPkgId] = useState('TEST-001');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  // Check backend health on component mount
  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const status = await espIntegrationService.checkBackendHealth();
      setBackendStatus(status);
    } catch (error) {
      setBackendStatus({ error: error.message });
    }
  };

  const handleTestEndpoint = async (endpoint, methodName) => {
    setLoading(true);
    try {
      const result = await espIntegrationService[methodName](pkgId);
      setResults(prev => ({
        ...prev,
        [endpoint]: { success: true, data: result, timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    }
    setLoading(false);
  };

  const handleTestAll = async () => {
    setLoading(true);
    try {
      const allResults = await espIntegrationService.testAllEndpoints(pkgId);
      setResults(allResults);
    } catch (error) {
      console.error('Test all failed:', error);
    }
    setLoading(false);
  };

  const missionEvents = [
    { name: 'Drone Loaded', endpoint: '/mission/loaded', method: 'simulateDroneLoaded' },
    { name: 'En Route', endpoint: '/mission/enroute', method: 'simulateEnRoute' },
    { name: 'Landed', endpoint: '/mission/landed', method: 'simulateLanded' },
    { name: 'Offloaded', endpoint: '/mission/offloaded', method: 'simulateOffloaded' },
    { name: 'Returning', endpoint: '/mission/returning', method: 'simulateReturning' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ESP Integration Test</h1>

        {/* Backend Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Backend Status</h2>
          {backendStatus ? (
            backendStatus.error ? (
              <div className="text-red-600">
                <p>❌ Backend not reachable</p>
                <p className="text-sm">{backendStatus.error}</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p>✅ Backend connected</p>
                <p className="text-sm">Status: {backendStatus.status}</p>
              </div>
            )
          ) : (
            <p className="text-gray-500">Checking...</p>
          )}
        </div>

        {/* Test Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="flex gap-4 items-center">
            <label className="block">
              <span className="text-gray-700">Package ID:</span>
              <input
                type="text"
                value={pkgId}
                onChange={(e) => setPkgId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., PKG-001"
              />
            </label>
            <button
              onClick={handleTestAll}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* Mission Events */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Mission Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missionEvents.map((event) => (
              <button
                key={event.endpoint}
                onClick={() => handleTestEndpoint(event.endpoint, event.method)}
                disabled={loading}
                className="bg-green-600 text-white p-4 rounded-md hover:bg-green-700 disabled:opacity-50 text-left"
              >
                <div className="font-semibold">{event.name}</div>
                <div className="text-sm opacity-90">{event.endpoint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {Object.keys(results).length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(results).map(([endpoint, result]) => (
                <div key={endpoint} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{endpoint}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  {result.success ? (
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-red-600 text-sm">{result.error}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {result.timestamp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Set a package ID and test individual endpoints</li>
            <li>• Use "Test All Endpoints" to simulate a complete mission</li>
            <li>• Check the results to verify backend communication</li>
            <li>• Monitor the frontend for notification popups</li>
            <li>• Check Firebase console for data updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EspTestPage;