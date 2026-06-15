import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock fetch to prevent real API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 401,
    json: () => Promise.resolve({}),
  })
) as jest.Mock

// Mock console methods to reduce noise
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('AuthContext Simple', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress React act warnings
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('act(...)')) return
      originalError(...args)
    }
  })

  it('provides AuthProvider without crashing', () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Content</div>
      </AuthProvider>
    )

    expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content')
  })
})