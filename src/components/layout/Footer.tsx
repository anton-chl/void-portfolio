import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.meta}>
          &copy; {new Date().getFullYear()} Anton Lee
        </span>
      </div>
    </footer>
  )
}
