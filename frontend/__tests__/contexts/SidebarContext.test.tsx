import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

function TestComponent() {
  const { isOpen, setIsOpen } = useSidebar()
  
  return (
    <div>
      <div data-testid="sidebar-state">{isOpen ? 'open' : 'closed'}</div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <button onClick={() => setIsOpen(false)}>Close</button>
    </div>
  )
}

describe('SidebarContext', () => {
  it('provides initial state as open', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open')
  })

  it('can change sidebar state', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>
    )

    act(() => {
      screen.getByText('Close').click()
    })
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed')

    act(() => {
      screen.getByText('Open').click()
    })
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open')
  })
})