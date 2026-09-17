import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const env = { ...process.env }
  for (const file of ['.env.local', '.env']) {
    try {
      const text = readFileSync(resolve(file), 'utf8')
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (match && env[match[1]] === undefined) {
          env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
        }
      }
    } catch {
      // optional file
    }
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const email = env.ADMIN_EMAIL || 'admin@ebm.cm'
const password = env.ADMIN_PASSWORD || `EbmAdmin-${randomBytes(5).toString('base64url')}`
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: existing } = await supabase.auth.admin.listUsers()
const already = existing?.users?.find((user) => user.email === email)

if (already) {
  const { error } = await supabase.auth.admin.updateUserById(already.id, {
    app_metadata: { role: 'admin', account_status: 'active' },
    user_metadata: { ...already.user_metadata, full_name: already.user_metadata?.full_name || 'EBM Admin' },
    email_confirm: true,
    ...(env.ADMIN_PASSWORD ? { password: env.ADMIN_PASSWORD } : {}),
  })
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log(`Admin already exists: ${email}`)
  if (env.ADMIN_PASSWORD) console.log('Password was reset from ADMIN_PASSWORD.')
  else console.log('Password was not changed.')
  process.exit(0)
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: { role: 'admin', account_status: 'active' },
  user_metadata: { full_name: 'EBM Admin', role: 'admin' },
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log(`Created admin ${data.user.email}`)
console.log(`Password: ${password}`)
console.log('Sign in from the login page with Administrator sign in.')
