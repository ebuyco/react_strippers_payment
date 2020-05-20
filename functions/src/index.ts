import * as functions from 'firebase-functions';
import express from 'express';
import * as admin from 'firebase-admin';
admin.initializeApp();


import Stripe from 'stripe';
export const stripe = new Stripe(functions.config().stripe.secret, {
        apiVersion: '2020-03-02',
});


const app = express();
export const api = functions.https.onRequest(app);


import { createStripeCheckoutSession } from './checkout';

export const stripeCheckout = functions.https.onCall(async (data,context) => {
       if (context.auth)  {

       } else {

       }    
       
       const checkoutSession = await createStripeCheckoutSession(data.line_items);
       return checkoutSession;
});