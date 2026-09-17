import { Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { FLOW_STEPS } from '../data/constants'

function stepIndexFromPath(pathname) {
  if (pathname.startsWith('/request')) return 1
  if (pathname.startsWith('/matches')) return 2
  if (pathname.startsWith('/donors') || pathname.startsWith('/donor/')) return 3
  if (pathname.startsWith('/confirm')) return 4
  if (pathname.startsWith('/donation')) return 5
  if (pathname.startsWith('/request-status') || pathname === '/status') return 6
  if (pathname.startsWith('/save-life')) return 7
  return 0
}

export default function ProgressBar() {
  const { pathname } = useLocation()
  const current = stepIndexFromPath(pathname)

  return (
    <div className="card mb-6 overflow-x-auto px-3 py-4 md:px-5">
      <div className="flex min-w-[720px] items-center justify-between">
        {FLOW_STEPS.map((step, i) => {
          const n = i + 1
          const done = current > n
          const active = current === n
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <Link
                to={step.path}
                className="group flex min-w-0 flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                    done
                      ? 'bg-ebm-700 text-white'
                      : active
                        ? 'bg-ebm-700 text-white ring-4 ring-ebm-700/20'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-ebm-100 group-hover:text-ebm-700'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={`max-w-[92px] text-center text-[11px] font-medium leading-tight ${
                    active || done ? 'text-ebm-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </Link>
              {i < FLOW_STEPS.length - 1 ? (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded-full ${done || active ? 'bg-ebm-700/70' : 'bg-gray-200'}`}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
