import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { clerkClient } from '@clerk/nextjs/server'; // correct import
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env.local');
  }

  // Read svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- missing svix headers', { status: 400 });
  }

  // Read body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return new Response('Verification failed', { status: 400 });
  }

  const eventType = evt.type;
  console.log(`📩 Clerk Webhook Event Received: ${eventType}`);

  // -------------------------- USER CREATED --------------------------
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address ?? '',
      username: username ?? '',
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      photo: image_url ?? '',
    };

    console.log('🧩 Creating MongoDB user:', user);
    const newUser = await createUser(user);

    if (newUser) {
      const client = await clerkClient(); // ⚡ Important: await before using .users
      await client.users.updateUserMetadata(id, {
        publicMetadata: { userId: newUser._id },
      });
      console.log('✅ Clerk metadata updated with MongoDB ID');
    }

    return NextResponse.json({ message: 'OK', user: newUser });
  }

  // -------------------------- USER UPDATED --------------------------
  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      username: username ?? '',
      photo: image_url ?? '',
    };

    const updatedUser = await updateUser(id, user);
    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  // -------------------------- USER DELETED --------------------------
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);
    return NextResponse.json({ message: 'OK', user: deletedUser });
  }

  return new Response('Unhandled event', { status: 200 });
}
