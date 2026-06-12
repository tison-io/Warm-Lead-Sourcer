import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/dashboard/Sidebar'

// Mock contexts
jest.mock('@/contexts/SidebarContext', () => ({
  useSidebar: () => ({
    isOpen: true,
    setIsOpen: jest.fn()
  })
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    logout: jest.fn()
  })
}))

jest.mock('@/components/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>
  }
})

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('My Scrapes')).toBeInTheDocument()
    expect(screen.getByText('New Scrape')).toBeInTheDocument()
    expect(screen.getByText('Log Out')).toBeInTheDocument()
  })

  it('displays user information', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})