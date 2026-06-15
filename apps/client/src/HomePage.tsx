import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react'

type HomePageProps = {
  onStartChat: () => void
}

export function HomePage({ onStartChat }: HomePageProps) {
  return (
    <main className='home-shell'>
      <section className='home-cover'>
        <aside className='cover-brand'>
          <img src='/figma/home/cover-icon.png' alt='WhatsApp logo' className='cover-icon' />
          <h1>WhatsApp</h1>
          <p>21 screens</p>
          <button type='button' className='cover-cta' onClick={onStartChat}>
            Open Chat Demo <ArrowRight size={16} />
          </button>
        </aside>

        <div className='cover-phones' aria-hidden='true'>
          <img src='/figma/home/cover-phone-left.png' alt='' className='phone-left' />
          <img src='/figma/home/cover-phone-right.png' alt='' className='phone-right' />
        </div>
      </section>

      <section className='home-content'>
        <section className='home-section'>
          <h2>Why Chatush</h2>
          <p className='section-lead'>An easy place to exchange ideas, argue politics, and keep discussions moving in real time.</p>
          <div className='feature-grid'>
            <article>
              <h3>Fast Entry</h3>
              <p>Pick a nickname, join a room, and jump straight into the debate.</p>
            </article>
            <article>
              <h3>Live Argument Flow</h3>
              <p>Realtime updates keep every opinion and counterpoint visible instantly.</p>
            </article>
            <article>
              <h3>Simple to Use</h3>
              <p>Clean, mobile-inspired UI focused on ideas instead of clutter.</p>
            </article>
          </div>
        </section>

        <section className='home-section'>
          <h2>How It Works</h2>
          <ol className='steps'>
            <li>Choose a nickname and enter the chat.</li>
            <li>Pick a room and catch up on the current thread.</li>
            <li>Post your take and respond as the discussion evolves.</li>
          </ol>
          <button type='button' className='cover-cta' onClick={onStartChat}>
            Start Chatting <ArrowRight size={16} />
          </button>
        </section>
      </section>

      <footer className='home-footer'>
        <div className='home-footer-nav'>
          <a href='/' aria-label='Go to homepage'>Home</a>
          <button type='button' onClick={onStartChat} aria-label='Open chat page'>Chat</button>
        </div>

        <div className='home-footer-social' aria-label='Social links'>
          <a href='https://github.com/vyaron/chatush' target='_blank' rel='noreferrer' aria-label='Open GitHub profile'>
            <Github size={16} /> GitHub
          </a>
          <a href='https://x.com' target='_blank' rel='noreferrer' aria-label='Open X profile'>
            <Twitter size={16} /> X
          </a>
          <a href='https://www.linkedin.com' target='_blank' rel='noreferrer' aria-label='Open LinkedIn profile'>
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      </footer>
    </main>
  )
}
