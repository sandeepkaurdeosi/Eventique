import EventForm from '@/components/ui/shared/Eventform'
import { auth } from "@clerk/nextjs/server";

const CreateEvent = async () => {
  const { userId } = await auth(); // ✅ this is Clerk ID, always available

  console.log("Clerk User ID:", userId);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-100 to-white">
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-8 md:py-12 flex justify-center items-center">
        <h3 className="text-3xl md:text-4xl font-bold text-center">
          Create Event
        </h3>
      </section>

      <div className="max-w-4xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 border-2 border-gray-300">
          <EventForm userId={userId!} type="Create" />
        </div>
      </div>
    </div>
  )
}

export default CreateEvent

