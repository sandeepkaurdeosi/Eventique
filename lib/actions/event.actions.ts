/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/mongodb/database'
import Event from '@/lib/mongodb/database/models/event.model'
import User from '@/lib/mongodb/database/models/user.model'
import Category from '@/lib/mongodb/database/models/category.model'
import { handleError } from '@/lib/utils'
import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

// Helper to find category
const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

// Helper for populating event with user + category
const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// ========================== CREATE EVENT ==========================
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()

    let organizer = await User.findOne({ clerkId: userId })

    if (!organizer) {
      console.log('Organizer not found — creating new MongoDB user...')

      const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      })

      const clerkUser = await response.json()

      const firstName = clerkUser.first_name || 'User'
      const lastName = clerkUser.last_name || 'Unknown'
      const username =
        clerkUser.username ||
        `${firstName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`
      const email = clerkUser.email_addresses?.[0]?.email_address || 'noemail@clerk.dev'
      const photo = clerkUser.image_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

      organizer = await User.create({
        clerkId: clerkUser.id,
        email,
        username,
        firstName,
        lastName,
        photo,
      })

      console.log('✅ New MongoDB user created:', organizer._id)
    }

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: organizer._id,
    })

    revalidatePath(path)
    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}

// ========================== GET EVENT BY ID ==========================
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()
    const event = await populateEvent(Event.findById(eventId))
   if (!event) {
  console.log('❌ Event not found for ID:', eventId)
  return null;
}
    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

// ========================== UPDATE EVENT ==========================
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const organizer = await User.findOne({ clerkId: userId })
    if (!organizer) throw new Error('Organizer not found for Clerk ID: ' + userId)

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toString() !== organizer._id.toString()) {
      throw new Error('Unauthorized or event not found')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    )

    revalidatePath(path)
    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

// ========================== DELETE EVENT ==========================
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()
    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

// ========================== GET ALL EVENTS ==========================
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

// ========================== GET EVENTS BY USER ==========================
export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    const organizer = await User.findOne({ clerkId: userId })
    if (!organizer) throw new Error('Organizer not found')

    const conditions = { organizer: organizer._id }
    const skipAmount = (page - 1) * limit

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// ========================== GET RELATED EVENTS ==========================
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}
