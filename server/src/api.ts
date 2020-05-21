import express, { Request, Response, NextFunction } from 'express';
export const app = express();

import cors from 'cors';
import { auth } from './firebase';
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payment';
import { createSetupIntent, listPaymentMethods } from './customers';
import { createSubscription, cancelSubscription, listSubscriptions } from './billing';
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

function runAsync(callback: Function){
        return ( req: Request, res: Response, next: NextFunction) => {
                        callback(req, res, next).catch(next);
        };
}

function validateUser(req: Request) {
        const user = req['currentUser'];

        if(!user){
                throw new Error(
                   'You must logged in to make this request. i.e Authroization: Bearer <token>'
                )
        }
        return user;
}

app.post('/test', (req: Request, res: Response) => {
        const amount =req.body.amount;
        res.status(200).send({ with_tax: amount * 7 });
});

app.post(
        '/checkouts/',
        runAsync(async ({ body }: Request, res: Response) => {
                    res.send(await createStripeCheckoutSession(body.line_items));
        })
);

app.post(
    '/payments',
    runAsync(async ({ body }: Request, res: Response) => {
                res.send(await createPaymentIntent(body.amount));
    })
);

app.post(
    '/wallet',
    runAsync(async (req: Request, res: Response) => {
         const user = validateUser(req);
         const setupIntent = await createSetupIntent(user.id);
         res.send(setupIntent);      
    })
);

app.get(
    '/wallet',
    runAsync(async (req: Request, res: Response) => {
                const user = validateUser(req);

                const wallet = await listPaymentMethods(user.id);
                res.send(wallet.data);
    })
);

app.post(
    '/subscriptions/',
    runAsync(async (req: Request, res: Response) => {
                const user = validateUser(req);
                const { plan, payment_method } = req.body;
                const subscription = await createSubscription(user.uid, plan, payment_method);
                res.send(subscription);
    })
);

app.get(
    '/subscriptions/',
    runAsync(async (req: Request, res: Response) => {
            const user = validateUser(req);

            const subscriptions = await listSubscriptions(user.uid);

            res.send(subscriptions.data);
    })
);

app.patch(
    '/subscriptions/:id',
    runAsync(async (req: Request, res: Response) => {
          const user = validateUser(req);
          res.send(await cancelSubscription(user.uid, req.params.id));
    })
);

app.post(
    'hooks',
    runAsync(handleStripeWebhook)
);