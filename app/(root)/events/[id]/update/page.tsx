import EventForm from "@/components/ui/shared/Eventform"
import { getEventById } from "@/lib/actions/event.actions"
import { auth } from "@clerk/nextjs/server"

type UpdateEventProps = {
  params: Promise<{
    id: string
  }>
}

const UpdateEvent = async ({ params }: UpdateEventProps) => {
  // ⛔ params is now a Promise → unwrap politely
  const { id } = await params

  const { sessionClaims } = await auth()
  const userId = sessionClaims?.userId as string

  // 🔍 check event by id
  const event = await getEventById(id)

  // ❤️ gracefully handle if missing
  if (!event) {
    return (
      <section className="wrapper my-8">
        <h1 className="text-xl font-bold">Event Not Found</h1>
        <p className="text-gray-500">Looks like this event wandered off into the void 🥲</p>
      </section>
    )
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center flex justify-center items-center md:py-10">
        <h3 className=" font-bold text-3xl text-center  sm:text-left">
          Update Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event._id.toString()}
          userId={userId}
        />
      </div>
    </>
  )
}

export default UpdateEvent
