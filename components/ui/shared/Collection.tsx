'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { IEvent } from '@/lib/mongodb/database/models/event.model'
import Card from './Card'
import Pagination from './Pagination'
import { Button } from '@/components/ui/button'

interface CollectionProps {
  data: IEvent[]
  emptyTitle: string
  emptyStateSubtext: string
  collectionType?: 'Events_Organized' | 'My_Tickets' | 'All_Events'
  limit?: number
  page?: number
  totalPages?: number
  urlParamName?: string
  userId?: string
}

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  collectionType,
  page = 1,
  totalPages = 1,
  urlParamName,
  userId,
}: CollectionProps) => {
  const isEmpty = !data || data.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Image
          src="/assets/images/empty.svg"
          alt="empty state"
          width={200}
          height={200}
          className="mb-5"
        />

        <h2 className="text-xl font-bold text-gray-700">{emptyTitle}</h2>
        <p className="text-gray-500">{emptyStateSubtext}</p>

        {collectionType === 'Events_Organized' && (
          <Link href="/events/create">
            <Button className="mt-4">Create Event</Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-10 mt-6 mb-10">
      <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        {data.map((event) => {
          const hasOrderLink = collectionType === 'My_Tickets'
          const hidePrice = collectionType === 'My_Tickets'

          return (
            <li key={event._id} className="flex justify-center">
              <Card
                event={event}
                hidePrice={hidePrice}
                hasOrderLink={hasOrderLink}
                userId={userId}
              />
            </li>
          )
        })}
      </ul>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          urlParamName={urlParamName}
        />
      )}
    </div>
  )
}

export default Collection

