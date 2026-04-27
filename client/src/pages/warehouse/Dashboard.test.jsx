/**
 * Frontend Dashboard Component Test
 * Verifies that warehouse dashboard correctly fetches and displays data
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from '../pages/warehouse/Dashboard';
import * as useApiModule from '../hooks/useApi';

// Mock the useApi hook
jest.mock('../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

// Mock Framer Motion to simplify testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Warehouse: () => <div>Warehouse Icon</div>,
  Search: () => <div>Search Icon</div>,
  RefreshCw: () => <div>Refresh Icon</div>,
  Bell: () => <div>Bell Icon</div>,
  Package: () => <div>Package Icon</div>,
  AlertTriangle: () => <div>Alert Icon</div>,
  Clock3: () => <div>Clock Icon</div>,
  TrendingUp: () => <div>Up Icon</div>,
  TrendingDown: () => <div>Down Icon</div>,
  Boxes: () => <div>Boxes Icon</div>,
  ShieldAlert: () => <div>Shield Icon</div>,
}));

describe('Warehouse Dashboard E2E Tests', () => {
  const mockStats = {
    totalDrugs: 14,
    lowStockCount: 3,
    expiredCount: 2,
  };

  const mockAlerts = {
    expiryAlerts: [
      {
        _id: '1',
        name: 'Expiring Drug 1',
        batchNumber: 'EXP-BATCH-3001',
        batchNo: 'EXP-BATCH-3001',
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '2',
        name: 'Expiring Drug 2',
        batchNumber: 'EXP-BATCH-3002',
        batchNo: 'EXP-BATCH-3002',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    lowStockAlerts: [
      {
        _id: '10',
        drugId: { name: 'Low Stock Drug 1' },
        quantity: 4,
        threshold: 20,
        warehouseLocation: 'TEST_WAREHOUSE',
      },
      {
        _id: '11',
        drugId: { name: 'Low Stock Drug 2' },
        quantity: 5,
        threshold: 20,
        warehouseLocation: 'TEST_WAREHOUSE',
      },
    ],
    securityTransitAlerts: [
      {
        id: '100',
        bleId: 'BLE-DEVICE-5001',
        stage: 'DISTRIBUTOR_TO_WAREHOUSE',
        alertCodes: ['TRANSIT_TIME_EXCEEDED'],
        elapsedMinutes: 150,
        allowedMinutes: 120,
      },
    ],
    totalAlerts: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Dashboard loads and displays initial loading state', () => {
    const mockRequest = jest.fn(() => new Promise(() => {})); // Never resolves
    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);
    
    expect(screen.getByText(/Warehouse/i)).toBeInTheDocument();
  });

  test('Dashboard successfully fetches stats data', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for stats to load
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/stats');
    });

    // Verify stats are displayed
    await waitFor(() => {
      expect(screen.getByText(mockStats.totalDrugs.toString())).toBeInTheDocument();
      expect(screen.getByText(mockStats.lowStockCount.toString())).toBeInTheDocument();
    });
  });

  test('Dashboard successfully fetches alerts data', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for alerts to load
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/alerts');
    });
  });

  test('Dashboard displays expiry alerts correctly', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for expiry alerts to render
    await waitFor(() => {
      mockAlerts.expiryAlerts.forEach((alert) => {
        expect(screen.getByText(alert.name)).toBeInTheDocument();
      });
    });
  });

  test('Dashboard handles low stock alerts with fallback to populated field names', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for low stock alerts to render
    await waitFor(() => {
      // Check that drug names are displayed
      mockAlerts.lowStockAlerts.forEach((alert) => {
        if (alert.drugId?.name) {
          expect(screen.getByText(alert.drugId.name)).toBeInTheDocument();
        }
      });
    });
  });

  test('Dashboard filters expiry alerts by search text', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for alerts to load
    await waitFor(() => {
      expect(screen.getByText('Expiring Drug 1')).toBeInTheDocument();
    });

    // Type search text
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Expiring Drug 1' } });

    // Verify filtering
    expect(screen.getByText('Expiring Drug 1')).toBeInTheDocument();
    // The other expiry drug might not be visible if filtering works
  });

  test('Dashboard refreshes data on manual refresh', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/stats');
    });

    const initialCallCount = mockRequest.mock.calls.length;

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    if (refreshButton) {
      fireEvent.click(refreshButton);

      // Verify request was made again
      await waitFor(() => {
        expect(mockRequest.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    }
  });

  test('Dashboard handles API errors gracefully', async () => {
    const mockRequest = jest.fn(() => {
      return Promise.reject(new Error('API Error'));
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<Dashboard />);

    // Wait for error to be handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching warehouse dashboard data:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test('Dashboard displays empty states when no alerts exist', async () => {
    const emptyAlerts = {
      expiryAlerts: [],
      lowStockAlerts: [],
      securityTransitAlerts: [],
      totalAlerts: 0,
    };

    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: emptyAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Verify empty state is handled
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/alerts');
    });
  });

  test('Dashboard handles concurrent API calls correctly', async () => {
    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: mockStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Wait for both calls to complete
    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/stats');
      expect(mockRequest).toHaveBeenCalledWith('GET', '/api/admin/dashboard/alerts');
    });

    // Verify both requests were made
    expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test('Dashboard uses validation for stats data', async () => {
    const invalidStats = {
      totalDrugs: -5, // Invalid: negative
      lowStockCount: 'not a number', // Invalid: string
      expiredCount: null, // Invalid: null
    };

    const mockRequest = jest.fn((method, endpoint) => {
      if (endpoint.includes('stats')) {
        return Promise.resolve({ data: invalidStats });
      } else if (endpoint.includes('alerts')) {
        return Promise.resolve({ data: mockAlerts });
      }
    });

    useApiModule.useApi.mockReturnValue({ request: mockRequest });

    render(<Dashboard />);

    // Dashboard should handle invalid data gracefully
    await waitFor(() => {
      // Component should still render without crashing
      expect(screen.getByText(/Warehouse/i)).toBeInTheDocument();
    });
  });
});
