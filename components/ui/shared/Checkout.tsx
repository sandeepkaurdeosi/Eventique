'use client'
import React, { useEffect } from 'react';
import { IEvent } from '@/lib/mongodb/database/models/event.model';
import { Button } from '../button';

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
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
      buyerId: userId,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <Button onClick={onCheckout} size="lg" className="button sm:w-fit">
      {event.isFree ? 'Get Ticket' : 'Buy Ticket'}
    </Button>
  );
};

export default Checkout;
