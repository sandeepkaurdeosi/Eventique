'use client'

import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '../input'
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

export type SearchProps = {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Search = ({ placeholder = 'Search title...', value, onChange }: SearchProps) => {
  const [query, setQuery] = useState(value)
  const router = useRouter()
  const searchParams = useSearchParams()

  // sync with parent value
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Memoized push to avoid re-renders
  const updateQuery = useCallback(
    (q: string) => {
      let newUrl = ''

      if (q) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'query',
          value: q,
        })
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['query'],
        })
      }
      router.push(newUrl, { scroll: false })
    },
    [searchParams, router]
  )

  useEffect(() => {
    const debounce = setTimeout(() => {
      updateQuery(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, updateQuery])

  return (
    <div className="flex min-h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
      <Image src="/assets/icons/search.svg" alt="search" width={24} height={24} />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e)
        }}
        className="p-regular-16 border-0 outline-none focus:ring-0"
      />
    </div>
  )
}

export default Search


