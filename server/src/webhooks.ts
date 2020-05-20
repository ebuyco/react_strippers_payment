import { stripe } from './';
import Stripe from 'stripe';
import { db } from './firebase';
import { firestore } from 'firebase-admin';


const webhookHandlers = {

    'checkout.session.completed': async (data: Stripe.Event.Data) => {

    },

    'payment_intent.succeeded': async (data: Stripe.Payment) => {

    },

    'payment_intent.payment_failed': async( data: Stripe.PaymentIntent) => {

    },

    'customer.subscription.deleted': async (data: Stripe.Subscription) => {
        const customer = await stripe.customers.retrieve( data.customer as string) as Stripe.Customer;
        const userId = customer.metadata.firebaseUID;
        const userRef = db.collection('users').doc(userId);

        await userRef
        .update({
            activePlans: firestore.FindValue.arrayUnion(data.plan.id),
        });

    },
    'invoice.payment_succeeded': async (data: Stripe.Invoice) => {

    },

    'invoice.payment_failed': async (data: Stripe.Invoice) => {
         
        const customer = await stripe.customers.retrieve(data.customer as string) as Stripe.Customer;
        const userSnapshot = await db.collection('users').doc(customer.metadata.firebaseUID).get();
        await userSnapshot.ref.update({ status: 'PAST_DUE'});
    }
};

export const handleStripeWebhook = async(req, res) => {

    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);

    try {
        await webhookHandlers[event.type](event.data.object);
        res.send({ received: true });
    } catch (err) {
        console.log(err);
        res.status(400).send(`Webhook Errors: ${err.message}`);
    }
}

