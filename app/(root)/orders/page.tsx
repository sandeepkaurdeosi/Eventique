'use client'
import { Suspense } from "react";
import { useState, useEffect, useCallback } from 'react'
import Search from '@/components/ui/shared/Search'
import { getOrdersByEvent } from '@/lib/actions/Order.actions'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { IOrderItem } from '@/lib/mongodb/database/models/order.model'
import { useSearchParams } from "next/navigation";

interface OrdersProps {
  params: { eventId: string }
}

const Orders = ({ params }: OrdersProps) => {
  const { eventId } = params
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  
  const [orders, setOrders] = useState<IOrderItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(
    async () => {
      setLoading(true)
      try {
        const data = await getOrdersByEvent({
          eventId,
          searchString: query,
        })
        setOrders(data || [])
      } catch (err) {
        console.error('Failed to fetch orders', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    },
    [eventId, query]
  )

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10 md:mx-24">
        <h3 className="wrapper text-3xl font-bold text-center sm:text-left">
          Orders
        </h3>
      </section>

      <section className="wrapper md:mx-20 my-5">
        <Search />
      </section>

      <section className="wrapper overflow-x-auto md:mx-24">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No orders found.</p>
        ) : (
          <table className="w-full border-collapse border-t">
            <thead>
              <tr className="p-medium-14 border-b text-grey-500">
                <th className="min-w-[250px] py-3 text-left">Order ID</th>
                <th className="min-w-[200px] flex-1 py-3 pr-4 text-left">Event Title</th>
                <th className="min-w-[150px] py-3 text-left">Buyer</th>
                <th className="min-w-[100px] py-3 text-left">Created</th>
                <th className="min-w-[100px] py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((row: IOrderItem) => (
                <tr key={row._id} className="p-regular-14 lg:p-regular-16 border-b">
                  <td className="min-w-[250px] py-4 text-primary-500">{row._id}</td>
                  <td className="min-w-[200px] flex-1 py-4 pr-4">{row.eventTitle}</td>
                  <td className="min-w-[150px] py-4">{row.buyer}</td>
                  <td className="min-w-[100px] py-4">{formatDateTime(row.createdAt).dateTime}</td>
                  <td className="min-w-[100px] py-4 text-right">{formatPrice(row.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

export default function Page(props: OrdersProps) {
  return (
    <Suspense fallback={<p className="text-center py-10">Loading page...</p>}>
      <Orders {...props} />
    </Suspense>
  )
}
