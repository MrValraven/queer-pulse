import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { COLORS } from './componentLibrary.data'
import styles from './ComponentLibraryPage.module.css'

export function ColorsSection() {
  return (
    <section className={styles.sec} id="colors">
      <h2>
        Colours · <em>4 brand hues</em>
      </h2>
      <p className={styles.secSub}>
        Plus a 5-step ink scale. <em>No additional accent colours are introduced anywhere.</em>
      </p>
      <div className={styles.colRow}>
        {COLORS.map((c) => (
          <div className={styles.colChip} key={c.name}>
            <div className={styles.colChipBar} style={{ background: c.bg, border: c.border ? '1px solid rgba(45,27,61,.10)' : undefined }} />
            <b>{c.name}</b>
            <span>{c.hex}</span>
            <div className={styles.var}>{c.v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TypeSection() {
  return (
    <section className={styles.sec} id="type">
      <h2>
        Type · <em>Fraunces + DM Sans</em>
      </h2>
      <p className={styles.secSub}>
        Display in Fraunces (variable optical-size serif). UI &amp; body in DM Sans.{' '}
        <em>Italic em is the primary emphasis device — never bold.</em>
      </p>
      <div className={styles.typeRow}>
        <div className={styles.typeSample} style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 64, lineHeight: 0.95 }}>
          On <em>health.</em>
        </div>
        <div className={styles.typeMeta}>
          <b>Display L</b>Fraunces 300 · 64–128px · italic em
        </div>
      </div>
      <div className={styles.typeRow}>
        <div className={styles.typeSample} style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 36, lineHeight: 1.05 }}>
          Section header <em>here.</em>
        </div>
        <div className={styles.typeMeta}>
          <b>Display M</b>Fraunces 400 · 28–46px
        </div>
      </div>
      <div className={styles.typeRow}>
        <div className={styles.typeSample} style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22, letterSpacing: '-.01em' }}>
          Card title or list item
        </div>
        <div className={styles.typeMeta}>
          <b>Display S</b>Fraunces 500 · 18–24px
        </div>
      </div>
      <div className={styles.typeRow}>
        <div className={styles.typeSample} style={{ fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.65, color: 'var(--ink)', maxWidth: '50ch' }}>
          Body copy. This is what most paragraphs look like. <em>Italic em uses the serif</em>, but inline lookups stay sans.
        </div>
        <div className={styles.typeMeta}>
          <b>Body</b>DM Sans 400 · 15–17px · 1.65 line-height
        </div>
      </div>
      <div className={styles.typeRow}>
        <div className={styles.typeSample} style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          Eyebrow · category · label
        </div>
        <div className={styles.typeMeta}>
          <b>Eyebrow</b>DM Sans 700 · 11px caps · accent
        </div>
      </div>
    </section>
  )
}

export function ButtonsSection() {
  return (
    <section className={styles.sec} id="buttons">
      <h2>Buttons</h2>
      <p className={styles.secSub}>
        Three variants. <em>Pill always · 999px border-radius.</em> Lift on hover.
      </p>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>
            Primary <em>· coral</em>
          </div>
          <div className={styles.specClass}>.btn .btn-primary</div>
        </div>
        <div className={styles.specBody}>
          <Button variant="primary">Request an invite</Button>
          <Button variant="primary" size="lg">Apply →</Button>
        </div>
        <div className={styles.codeSnippet}>
          <code>&lt;button class="btn btn-primary"&gt;</code>{' '}
          <span className={styles.com}>// fills coral · CTA only · once per screen</span>
        </div>
      </div>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>
            Ghost <em>· plum outline</em>
          </div>
          <div className={styles.specClass}>.btn .btn-ghost</div>
        </div>
        <div className={styles.specBody}>
          <Button variant="ghost">Read more</Button>
          <Button variant="ghost" size="lg">All issues</Button>
        </div>
      </div>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>
            Ghost · <em>dark</em>
          </div>
          <div className={styles.specClass}>.btn .btn-ghost-d · for plum sections</div>
        </div>
        <div className={`${styles.specBody} ${styles.specBodyDark}`}>
          <Button variant="ghost-dark">On the plum band</Button>
        </div>
      </div>
    </section>
  )
}

export function ChipsSection() {
  return (
    <section className={styles.sec} id="chips">
      <h2>
        Chips &amp; <em>tags</em>
      </h2>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Filter chips</div>
          <div className={styles.specClass}>.chip / .demo-pill</div>
        </div>
        <div className={styles.specBody}>
          <span className={`${styles.demoPill} ${styles.demoPillActive}`}>Active · 184</span>
          <span className={styles.demoPill}>Idle</span>
          <span className={styles.demoPill}>Idle · 22</span>
        </div>
      </div>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Status tags</div>
          <div className={styles.specClass}>small caps · 5px radius</div>
        </div>
        <div className={styles.specBody}>
          <span className={`${styles.tagSample} ${styles.tagJade}`}>● Verified</span>
          <span className={`${styles.tagSample} ${styles.tagAccent}`}>● In review</span>
          <span className={`${styles.tagSample} ${styles.tagPlum}`}>Member</span>
        </div>
      </div>
    </section>
  )
}

export function AvatarsSection() {
  return (
    <section className={styles.sec} id="avatars">
      <h2>Avatars</h2>
      <p className={styles.secSub}>Never photos for static demos · initials on tinted circles. Three tints · three sizes.</p>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Coral · jade · plum · three sizes</div>
          <div className={styles.specClass}>.demo-av</div>
        </div>
        <div className={styles.specBody}>
          <span className={`${styles.demoAv} ${styles.avSm}`}>TM</span>
          <span className={styles.demoAv}>TM</span>
          <span className={`${styles.demoAv} ${styles.avLg}`}>TM</span>
          <span className={`${styles.demoAv} ${styles.avJade}`}>CV</span>
          <span className={`${styles.demoAv} ${styles.avPlum}`}>NA</span>
        </div>
      </div>
    </section>
  )
}

export function CardsSection() {
  return (
    <section className={styles.sec} id="cards">
      <h2>Cards</h2>
      <p className={styles.secSub}>
        22px border-radius. White paper on cream. <em>Hover lifts 4px + heavier shadow.</em>
      </p>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Standard card</div>
          <div className={styles.specClass}>.demo-card · 22px radius · 24px padding</div>
        </div>
        <div className={styles.specBody}>
          <div className={styles.demoCard}>
            <b>
              Card <em>title.</em>
            </b>
            <p>One or two sentences of supporting text. Hover lifts the whole card by 4px.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FormsSection() {
  const [toggleOn, setToggleOn] = useState(true)
  return (
    <section className={styles.sec} id="forms">
      <h2>Forms</h2>
      <p className={styles.secSub}>11px label caps in plum · cream input bg · plum focus border.</p>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Text input + toggle + button</div>
          <div className={styles.specClass}>.field / .toggle-sw</div>
        </div>
        <div className={styles.specBody} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16, maxWidth: 400 }}>
          <div style={{ width: '100%' }}>
            <div className={styles.fieldLabel}>Email</div>
            <input type="email" defaultValue="tomas@example.com" className={styles.fieldInput} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className={styles.toggleSw}>
              <input type="checkbox" checked={toggleOn} onChange={() => setToggleOn((v) => !v)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
            <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>Newsletter on</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StatusSection() {
  return (
    <section className={styles.sec} id="status">
      <h2>
        Status &amp; <em>state</em>
      </h2>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>Live · waiting · success · error</div>
          <div className={styles.specClass}>.tag-sample variants</div>
        </div>
        <div className={styles.specBody}>
          <span className={`${styles.tagSample} ${styles.tagJade}`}>● Live</span>
          <span className={`${styles.tagSample} ${styles.tagAccent}`}>● Waiting · 5 spots</span>
          <span className={`${styles.tagSample} ${styles.tagPlum}`}>Submitted</span>
          <span className={styles.tagSample} style={{ color: 'var(--accent-ink)', background: 'rgba(var(--accent-rgb),.16)' }}>Late · 2d</span>
          <span className={styles.tagSample} style={{ color: 'var(--ink-60)', background: 'rgba(45,27,61,.06)' }}>Closed</span>
        </div>
      </div>
    </section>
  )
}

export function NavSection() {
  return (
    <section className={styles.sec} id="nav">
      <h2>Navigation</h2>
      <p className={styles.secSub}>
        Floating glass-pill nav · fixed 18px from top · backdrop-filter blur(18px) saturate(1.5) ·
        cream bg at 66% opacity.
      </p>
      <div className={styles.spec}>
        <div className={styles.specHead}>
          <div className={styles.specName}>
            Glass nav <em>· in context</em>
          </div>
          <div className={styles.specClass}>.nav · see live at top of this page</div>
        </div>
        <div className={`${styles.specBody} ${styles.navDemo}`}>
          <div className={styles.navPill}>
            <div className={styles.navBrand}>
              <span />
              Queer<span style={{ fontStyle: 'italic', width: 'auto', height: 'auto', background: 'none' }}>Pulse</span>
            </div>
            <div className={styles.navLinks}>
              <a href="#nav">Magazine</a>
              <a href="#nav">Cities</a>
              <a href="#nav">About</a>
            </div>
            <Button href="#nav" variant="primary" style={{ padding: '9px 18px' }}>
              Invite
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
