import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'wanderplan_business_tutorial_completed'

const steps = [
  {
    title: 'Welcome to your business dashboard',
    description: 'Track performance, reviews, deals, and your business visibility from one place.',
    selector: '[data-tutorial="dashboard-home"]',
  },
  {
    title: 'Complete or view your business profile',
    description: 'Keep your details, location, gallery, and contact information up to date.',
    selector: '[data-tutorial="profile-nav"]',
  },
  {
    title: 'Manage bookings and reservations',
    description: 'Use menu items and deals to keep your offers ready for customers.',
    selector: '[data-tutorial="menu-nav"]',
  },
  {
    title: 'View reviews',
    description: 'Monitor guest feedback and reply to customer reviews.',
    selector: '[data-tutorial="reviews-nav"]',
  },
  {
    title: 'Update gallery and images',
    description: 'Add fresh photos so travelers can preview your business.',
    selector: '[data-tutorial="gallery-section"]',
  },
]

export default function TutorialTooltip() {
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  const currentStep = steps[stepIndex]

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setIsOpen(true)
    }

    const replay = () => {
      setStepIndex(0)
      setIsOpen(true)
    }

    window.addEventListener('wanderplan:replay-business-tutorial', replay)
    return () => window.removeEventListener('wanderplan:replay-business-tutorial', replay)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const updateRect = () => {
      const element = document.querySelector(currentStep.selector)
      setTargetRect(element?.getBoundingClientRect() || null)
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [currentStep, isOpen])

  const tooltipStyle = useMemo(() => {
    if (!targetRect) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
    }

    const preferredLeft = Math.min(Math.max(targetRect.left, 16), window.innerWidth - 336)
    const below = targetRect.bottom + 12
    const top = below + 220 > window.innerHeight ? Math.max(16, targetRect.top - 232) : below

    return { left: `${preferredLeft}px`, top: `${top}px` }
  }, [targetRect])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/40" />
      {targetRect && (
        <div
          className="pointer-events-none fixed z-[90] rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}
      <div className="fixed z-[100] w-[calc(100vw-2rem)] max-w-xs rounded-lg border bg-card p-4 text-card-foreground shadow-xl" style={tooltipStyle}>
        <p className="text-xs font-medium text-muted-foreground">Step {stepIndex + 1} of {steps.length}</p>
        <h3 className="mt-1 font-semibold">{currentStep.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{currentStep.description}</p>
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={finish}>Skip</Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => value - 1)}>
              Back
            </Button>
            {stepIndex === steps.length - 1 ? (
              <Button type="button" size="sm" onClick={finish}>Finish</Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setStepIndex((value) => value + 1)}>Next</Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
