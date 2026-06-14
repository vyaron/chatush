import { ArrowRight, Github, Twitter, Mail } from 'lucide-react'

type AboutPageProps = {
  onGoHome: () => void
  onStartChat: () => void
}

export function AboutPage({ onGoHome, onStartChat }: AboutPageProps) {
  return (
    <main className='about-shell'>
      <section className='about-header'>
        <button type='button' className='back-link' onClick={onGoHome} aria-label='Back to home'>
          ← Home
        </button>
      </section>

      <section className='about-content'>
        <section className='about-section hero-section'>
          <h1>About Chatush</h1>
          <p className='lead'>
            A realtime conversation platform built for debate, discussion, and idea exchange without friction.
          </p>
        </section>

        <section className='about-section'>
          <h2>Our Mission</h2>
          <p>
            We believe that great ideas emerge from diverse perspectives colliding in open dialogue. Chatush removes barriers to conversation so people can argue, discuss, and explore ideas freely in real time.
          </p>
        </section>

        <section className='about-section'>
          <h2>Why We Built This</h2>
          <p>
            Modern chat platforms optimize for noise reduction and group harmony. We optimized for debate. Clean room-based organization means focused conversations. Minimal UI keeps ideas front and center. Realtime updates keep the flow unbroken.
          </p>
        </section>

        <section className='about-section'>
          <h2>Core Values</h2>
          <ul className='values-list'>
            <li>
              <strong>Simplicity:</strong> Remove friction from joining and participating.
            </li>
            <li>
              <strong>Realtime:</strong> Conversations flow at human speed without delays.
            </li>
            <li>
              <strong>Openness:</strong> No gatekeeping—anyone can start or join a room.
            </li>
            <li>
              <strong>Focus:</strong> Rooms keep conversations on track.
            </li>
          </ul>
        </section>

        <section className='about-section'>
          <h2>Get Started</h2>
          <p>Ready to join a conversation?</p>
          <button type='button' className='about-cta' onClick={onStartChat}>
            Open Chat <ArrowRight size={16} />
          </button>
        </section>

        <section className='about-section'>
          <h2>Connect</h2>
          <div className='social-links'>
            <a href='https://github.com/vyaron/chatush' target='_blank' rel='noreferrer' aria-label='GitHub'>
              <Github size={18} />
              GitHub
            </a>
            <a href='https://twitter.com' target='_blank' rel='noreferrer' aria-label='Twitter'>
              <Twitter size={18} />
              Twitter
            </a>
            <a href='mailto:hi@chatush.dev' aria-label='Email'>
              <Mail size={18} />
              Email
            </a>
          </div>
        </section>
      </section>

      <footer className='about-footer'>
        <p>&copy; 2026 Chatush. Built for debate.</p>
      </footer>
    </main>
  )
}
