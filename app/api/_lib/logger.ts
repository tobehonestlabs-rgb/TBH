// app/api/_lib/logger.ts
import { createClient } from '@supabase/supabase-js'

type LogLevel = 'info' | 'error' | 'warn' | 'debug'

// app/api/_lib/logger.ts
interface LogEntry {
  log_level: LogLevel
  category: string
  message: string
  user_id?: string | null   // ← Allow null
  reference?: string | null // ← Allow null
  metadata?: Record<string, any> | null
}
// Get admin client for logging
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Send a log to the payment_logs table
 */
export async function logToDatabase(entry: LogEntry) {
  try {
    const supabase = getSupabase()
    
    const { error } = await supabase
      .from('payment_logs')
      .insert({
        log_level: entry.log_level,
        category: entry.category,
        message: entry.message,
        user_id: entry.user_id || null,
        reference: entry.reference || null,
        metadata: entry.metadata || null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Logger] Failed to insert log:', error)
    }
  } catch (err) {
    console.error('[Logger] Error:', err)
  }
}

/**
 * Quick logging helpers
 */
export const logInfo = async (category: string, message: string, opts?: { user_id?: string; reference?: string; metadata?: any }) => {
  await logToDatabase({
    log_level: 'info',
    category,
    message,
    user_id: opts?.user_id,
    reference: opts?.reference,
    metadata: opts?.metadata,
  })
  console.log(`[${category}] ${message}`, opts?.metadata || '')
}

export const logError = async (category: string, message: string, opts?: { user_id?: string; reference?: string; metadata?: any }) => {
  await logToDatabase({
    log_level: 'error',
    category,
    message,
    user_id: opts?.user_id,
    reference: opts?.reference,
    metadata: opts?.metadata,
  })
  console.error(`[${category}] ❌ ${message}`, opts?.metadata || '')
}

export const logWarn = async (category: string, message: string, opts?: { user_id?: string; reference?: string; metadata?: any }) => {
  await logToDatabase({
    log_level: 'warn',
    category,
    message,
    user_id: opts?.user_id,
    reference: opts?.reference,
    metadata: opts?.metadata,
  })
  console.warn(`[${category}] ⚠️ ${message}`, opts?.metadata || '')
}

export const logDebug = async (category: string, message: string, opts?: { user_id?: string; reference?: string; metadata?: any }) => {
  await logToDatabase({
    log_level: 'debug',
    category,
    message,
    user_id: opts?.user_id,
    reference: opts?.reference,
    metadata: opts?.metadata,
  })
  console.log(`[${category}] 🔍 ${message}`, opts?.metadata || '')
}