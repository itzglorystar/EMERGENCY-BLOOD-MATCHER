import { useEffect, useState } from 'react'
import { BloodDropLogo } from './ui'

const SLIDES = [
  {
    src: '/slides/donate-blood.jpg',
    kicker: 'FIND. MATCH. SAVE.',
    title: 'Donate Blood',
    subtitle: 'Save Life',
  },
  {
    src: '/slides/save-life.jpg',
    kicker: 'EVERY DROP COUNTS',
    title: 'Be the match',
    subtitle: 'Someone nearby is waiting on you.',
  },
]

export default function WelcomeSlider({ className = '' }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className={`relative overflow-hidden bg-ebm-900 ${className}`}>
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            i === index ? 'translate-x-0' : i < index ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ebm-950/90 via-ebm-900/30 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-6 text-white md:p-10">
            <div className="flex items-center gap-3">
              <BloodDropLogo className="h-12 w-12" />
              <div>
                <p className="text-xl font-extrabold tracking-tight">EBM</p>
                <p className="text-xs font-medium text-white/80">Emergency Blood Matcher</p>
              </div>
            </div>
            <div className="max-w-md pb-6">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">{slide.kicker}</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">{slide.title}</h1>
              <p className="mt-3 text-lg font-medium text-white/90 md:text-xl">{slide.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  )
}
