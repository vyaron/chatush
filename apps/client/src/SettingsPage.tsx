import {
  Bell,
  Camera,
  ChevronRight,
  Database,
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Monitor,
  Phone,
  Send,
  Settings,
  Star,
  User
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type SettingsPageProps = {
  onOpenChat: () => void
  onOpenHome: () => void
}

type SettingsItem = {
  id: string
  label: string
  icon: LucideIcon
}

const quickItems: SettingsItem[] = [
  { id: 'starred', label: 'Starred Messages', icon: Star },
  { id: 'web', label: 'WhatsApp Web/Desktop', icon: Monitor }
]

const preferenceItems: SettingsItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'chat', label: 'Chats', icon: MessageSquare },
  { id: 'data', label: 'Data and Storage Usage', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell }
]

const supportItems: SettingsItem[] = [
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'friend', label: 'Tell a Friend', icon: Send }
]

function SettingsGroup({ items }: { items: SettingsItem[] }) {
  return (
    <section className='settings-group' aria-label='Settings group'>
      {items.map(item => {
        const Icon = item.icon

        return (
          <button key={item.id} type='button' className='settings-row' aria-label={item.label}>
            <span className='settings-icon'>
              <Icon size={15} />
            </span>
            <span className='settings-label'>{item.label}</span>
            <ChevronRight size={16} className='settings-chevron' aria-hidden='true' />
          </button>
        )
      })}
    </section>
  )
}

export function SettingsPage({ onOpenChat, onOpenHome }: SettingsPageProps) {
  return (
    <main className='app-shell'>
      <section className='card phone-shell settings-shell'>
        <header className='status-bar'>
          <span>9:41</span>
          <div className='status-icons'>
            <span className='signal-bars' aria-hidden='true'>
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className='wifi-glyph' aria-hidden='true' />
            <span className='battery-glyph' aria-hidden='true'>
              <span className='battery-level' />
            </span>
          </div>
        </header>

        <header className='settings-nav'>
          <h1>Settings</h1>
        </header>

        <section className='settings-content'>
          <p className='settings-brand'>WhatsApp from Facebook</p>

          <button type='button' className='settings-profile' aria-label='Open profile'>
            <span className='settings-avatar' aria-hidden='true' />
            <span className='settings-profile-text'>
              <strong>Yaron Biton</strong>
              <small>Digital goodies designer - Pixsellz</small>
            </span>
            <ChevronRight size={17} className='settings-chevron' aria-hidden='true' />
          </button>

          <SettingsGroup items={quickItems} />
          <SettingsGroup items={preferenceItems} />
          <SettingsGroup items={supportItems} />
        </section>

        <footer className='settings-tabbar' aria-label='Primary tabs'>
          <button type='button' className='settings-tab' onClick={onOpenHome} aria-label='Status tab'>
            <MessageCircle size={15} />
            <span>Status</span>
          </button>
          <button type='button' className='settings-tab' onClick={onOpenChat} aria-label='Calls tab'>
            <Phone size={15} />
            <span>Calls</span>
          </button>
          <button type='button' className='settings-tab' aria-label='Camera tab'>
            <Camera size={15} />
            <span>Camera</span>
          </button>
          <button type='button' className='settings-tab' onClick={onOpenChat} aria-label='Chats tab'>
            <MessageSquare size={15} />
            <span>Chats</span>
          </button>
          <button type='button' className='settings-tab settings-tab-active' aria-current='page' aria-label='Settings tab'>
            <Settings size={15} />
            <span>Settings</span>
          </button>
        </footer>

        <footer className='home-indicator'>
          <span />
        </footer>
      </section>
    </main>
  )
}
