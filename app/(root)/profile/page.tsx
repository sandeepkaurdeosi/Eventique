import Collection from '@/components/ui/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/Order.actions' 
import { IOrder } from '@/lib/mongodb/database/models/order.model'
import { SearchParamProps } from '@/types'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="text-center py-10 text-red-500">User not authenticated</div>;
  }

  const params = await searchParams;

  const ordersPage = Number(params?.ordersPage) || 1;
  const eventsPage = Number(params?.eventsPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });
  const orderedEvents = orders?.data.map((order: IOrder) => order.event) || [];
  const organizedEvents = await getEventsByUser({ userId, page: eventsPage });

  return (
    <>
      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10 md:ml-24 md:mr-24">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className='font-bold text-3xl text-center sm:text-left'>My Tickets</h3>
          <Button asChild size="lg" className="button flex">
            <Link href="/#events">
              Explore More Events
            </Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8  md:ml-24 md:mr-24">
        <Collection 
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
          userId={userId} // pass userId to Card
        />
      </section>

      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10 md:ml-24 md:mr-24">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className='font-bold text-3xl text-center sm:text-left'>Events Organized</h3>:
          <Button asChild size="lg" className="button hidden sm:flex">
            <Link href="/events/create">
              Create New Event
            </Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8 md:ml-24 md:mr-24">
        <Collection 
          data={organizedEvents?.data}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
          userId={userId} // pass userId to Card
        />
      </section>
    </>
  )
}

export default ProfilePage

