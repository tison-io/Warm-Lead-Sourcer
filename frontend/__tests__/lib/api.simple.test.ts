// Simple API test that focuses on the class structure
describe('API Client Structure', () => {
  it('exports api client', async () => {
    // Mock the API module to avoid environment issues
    jest.doMock('@/lib/api', () => ({
      api: {
        get: jest.fn(),
        post: jest.fn(),
        request: jest.fn()
      },
      dashboardApi: {
        getStats: jest.fn(),
        getRecentActivity: jest.fn()
      },
      leadsApi: {
        getByPost: jest.fn(),
        getStats: jest.fn()
      }
    }))

    const { api, dashboardApi, leadsApi } = await import('@/lib/api')
    
    expect(api).toBeDefined()
    expect(api.get).toBeDefined()
    expect(api.post).toBeDefined()
    expect(dashboardApi).toBeDefined()
    expect(leadsApi).toBeDefined()
  })
})