import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (apiCall, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall()
      if (options.onSuccess) options.onSuccess(result)
      return result
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Something went wrong'
      setError(msg)
      if (options.onError) options.onError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute, setError }
}