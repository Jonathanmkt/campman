import { ForgotPasswordForm } from '@/components/forgot-password-form'
import styles from './styles.module.css'

export default function Page() {
  return (
    <div className={styles.background}>
      {/* Overlay escuro para melhorar contraste */}
      <div className={styles.overlay}></div>
      
      {/* Container centralizado para o formulário */}
      <div className="flex justify-center items-center w-full min-h-svh relative z-10 p-6">
        <div className="max-w-md w-full">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
