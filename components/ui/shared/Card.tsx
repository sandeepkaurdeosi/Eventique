'use client'

import { IEvent } from '@/lib/mongodb/database/models/event.model'
import { formatDateTime } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { DeleteConfirmation } from './DeleteConfirmation'

type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
  userId?: string;
}

const Card = ({ event, hasOrderLink, hidePrice, userId }: CardProps) => {
  // const isEventCreator = userId === event.organizer._id.toString();
  console.log("User id",userId)
  console.log("Event organizer id",event.organizer._id)

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      
      <Link 
        href={`/events/${event._id}`}
        style={{ backgroundImage: `url(${event.imageUrl})` }}
        className="flex-center grow bg-gray-50 bg-cover bg-center text-grey-500"
      />

      {/* {isEventCreator && !hidePrice && ( */}
        <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm">
          <Link href={`/events/${event._id}/update`}>
            <Image src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>

          <DeleteConfirmation eventId={event._id} />
        </div>
       {/* )}  */}

      <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
        
        {!hidePrice && (
          <div className="flex gap-2">
            <span className="font-semibold w-min rounded-full bg-green-100 px-4 py-1 text-emerald-950">
              {event.isFree ? 'FREE' : `$${event.price}`}
            </span>

            <p className="font-semibold w-min rounded-full bg-gray-200 px-4 py-1 text-gray-900 line-clamp-1">
              {event.category.name}
            </p>
          </div>
        )}
       
        <p className="p-medium-16 text-gray-600">
          {formatDateTime(event.startDateTime).dateTime}
        </p>

        <Link href={`/events/${event._id}`}>
          <p className="font-bold line-clamp-2 flex-1 text-black">
            {event.title}
          </p>
        </Link>

        <div className="flex-between w-full">
          <p className="font-semibold text-gray-800">
            {event.organizer.firstName} | {event.organizer.lastName}
          </p>

          {hasOrderLink && (
            <Link href={`/orders?eventId=${event._id}`} className="flex gap-2">
              <p className="text-primary-500">Order Details</p>
              <Image src="/assets/icons/arrow.svg" alt="search" width={10} height={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Card
