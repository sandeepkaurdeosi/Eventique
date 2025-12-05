'use client'
import React, { useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import { IEvent } from '@/lib/mongodb/database/models/event.model';
import { Button } from '../button';
import { checkoutOrder } from '@/lib/actions/Order.actions';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({ event, userId }: { event: IEvent, userId: string }) => {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.');
    }
    if (query.get('canceled')) {
      console.log('Order canceled. Continue shopping!');
    }
  }, []);

  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId
    }

    const checkout = await checkoutOrder(order);

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    if (stripe && checkout.url) {
      window.location.href = checkout.url; // ✅ full URL like "https://checkout.stripe.com/..."
    }
  }

  return (
    <Button onClick={onCheckout} size="lg" className="button sm:w-fit">
      {event.isFree ? 'Get Ticket' : 'Buy Ticket'}
    </Button>
  )
}

export default Checkout;
