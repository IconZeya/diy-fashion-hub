// Direct REST API calls to Supabase for better performance
// Bypasses the Supabase JS client which can have connection issues
// Note: Uses anon key for public reads. Authenticated mutations go through API routes.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown> | Record<string, unknown>[]
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
}

interface SupabaseResponse<T> {
  data: T | null
  error: { message: string; code?: string } | null
  status: number
}

export async function supabaseRest<T = unknown>(
  table: string,
  options: FetchOptions = {}
): Promise<SupabaseResponse<T>> {
  const { method = 'GET', body, headers = {}, params = {} } = options

  // Build URL with query params
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })

  const requestHeaders: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...headers,
  }

  if (body) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // For GET requests that want data back
  if (method === 'GET') {
    requestHeaders['Accept'] = 'application/json'
  }

  // For mutations that want data back
  if (method === 'POST' || method === 'PATCH') {
    requestHeaders['Prefer'] = headers['Prefer'] || 'return=representation'
  }

  if (method === 'DELETE') {
    requestHeaders['Prefer'] = 'return=minimal'
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorText
      } catch {}

      return {
        data: null,
        error: { message: errorMessage, code: String(response.status) },
        status: response.status,
      }
    }

    // Handle empty responses (204 No Content, or DELETE)
    if (response.status === 204 || method === 'DELETE') {
      return { data: null, error: null, status: response.status }
    }

    const text = await response.text()
    if (!text) {
      return { data: null, error: null, status: response.status }
    }

    const data = JSON.parse(text) as T
    return { data, error: null, status: response.status }
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : 'Unknown error' },
      status: 0,
    }
  }
}

// Helper for SELECT queries with filters
export async function supabaseSelect<T = unknown>(
  table: string,
  options: {
    select?: string
    filters?: Record<string, string | number | boolean | undefined>
    order?: { column: string; ascending?: boolean }
    range?: { from: number; to: number }
    single?: boolean
  } = {}
): Promise<SupabaseResponse<T>> {
  const params: Record<string, string> = {}

  if (options.select) {
    params['select'] = options.select
  }

  // Add filters as query params (PostgREST format)
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params[key] = `eq.${value}`
      }
    })
  }

  if (options.order) {
    params['order'] = `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`
  }

  const headers: Record<string, string> = {}

  if (options.range) {
    headers['Range'] = `${options.range.from}-${options.range.to}`
    headers['Range-Unit'] = 'items'
  }

  if (options.single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json'
  }

  return supabaseRest<T>(table, { method: 'GET', params, headers })
}

// Helper for INSERT
export async function supabaseInsert<T = unknown>(
  table: string,
  data: Record<string, unknown> | Record<string, unknown>[],
  options: { returnData?: boolean } = {}
): Promise<SupabaseResponse<T>> {
  return supabaseRest<T>(table, {
    method: 'POST',
    body: data,
    headers: {
      'Prefer': options.returnData ? 'return=representation' : 'return=minimal',
    },
  })
}

// Helper for UPDATE
export async function supabaseUpdate<T = unknown>(
  table: string,
  filters: Record<string, string | number>,
  data: Record<string, unknown>,
  options: { returnData?: boolean } = {}
): Promise<SupabaseResponse<T>> {
  const params: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value]) => {
    params[key] = `eq.${value}`
  })

  return supabaseRest<T>(table, {
    method: 'PATCH',
    body: data,
    params,
    headers: {
      'Prefer': options.returnData ? 'return=representation' : 'return=minimal',
    },
  })
}

// Helper for DELETE
export async function supabaseDelete(
  table: string,
  filters: Record<string, string | number>
): Promise<SupabaseResponse<null>> {
  const params: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value]) => {
    params[key] = `eq.${value}`
  })

  return supabaseRest<null>(table, {
    method: 'DELETE',
    params,
  })
}
