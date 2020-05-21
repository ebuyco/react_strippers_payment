import express, { Request, Response, NextFunction } from 'express';
export const app = express();

import cors from 'cors';
import { auth } from './firebase';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payment';
import { createSetupIntent, listPaymentMethods } from './customers';
import { createSubscription, cancelSubscription, listSubscription } from './billing';
import { handleStripeWebhook } from './webhooks';


app.use(cors({ origin: true }));


app.use(
    express.json({
            verify: (req, res, buffer) => (req['rawBody'] = buffer),
    })
);

app.use(decodeJWT);

async function decodeJWT(req: Request, res: Response, next: NextFunction){

    if(req.headers?.authorization?.startsWith('Bearer')){

        const idToken = req.headers.authorization.split('Bearer ')[1];

            try {
                const decodeToken = await auth.verifyIdToken(idToken);
                req['currentUser'] = decodeToken;
            } catch (err){
                console.log(err);
            }
    }
    next();

}