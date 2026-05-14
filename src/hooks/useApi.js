import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (apiCall, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall()
      if (options.onSuccess) options.onSuccess(result)
      return result
    } catch (err) {
      // Extract the most specific error message available
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        err?.message                 ||
        'Something went wrong'

      // Log full error detail in dev
      if (import.meta.env.DEV) {
        console.error('❌ API Error:', {
          status:  err?.response?.status,
          url:     err?.config?.url,
          sent:    err?.config?.data,
          message: msg,
          full:    err?.response?.data,
        })
      }

      setError(msg)
      if (options.onError) options.onError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute, setError }
}