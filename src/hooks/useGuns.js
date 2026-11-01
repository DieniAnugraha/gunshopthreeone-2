import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'

const CACHE_KEY = 'bore_barrel_guns_cache'
const CACHE_TIME_KEY = 'bore_barrel_guns_cache_time'
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

export function useGuns(params = {}) {
  const [guns, setGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchGuns = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      if (!forceRefresh) {
        const cachedData = localStorage.getItem(CACHE_KEY)
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
        if (cachedData && cachedTime && Date.now() - Number(cachedTime) < CACHE_TTL) {
          const parsed = JSON.parse(cachedData)
          setGuns(parsed.data || [])
          setPagination(parsed.pagination || null)
          setLoading(false)
          return
        }
      }

      const response = await gunService.getGuns(params)
      if (response.success) {
        const dataList = response.data || []
        const pageInfo = response.pagination || null
        setGuns(dataList)
        setPagination(pageInfo)

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: dataList, pagination: pageInfo }))
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
        } catch {
          // Abaikan quota storage
        }
      } else {
        setError(response.message || 'Failed to fetch products.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching products.')
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        setGuns(parsed.data || [])
      } else {
        setGuns([])
      }
    } finally {
      setLoading(false)
    }
  }, [paramKey])

  useEffect(() => {
    fetchGuns()
  }, [fetchGuns])

  return { guns, loading, error, pagination, refetch: () => fetchGuns(true) }
}