import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('project setup', () => {
  it('should resolve path aliases correctly', () => {
    expect(typeof cn).toBe('function')
  })

  it('should merge class names with cn utility', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toBe('text-red-500 bg-blue-500')
  })
})
