import React, { useState } from 'react';
import { fetchFromAPI } from './helpers';
import { CardElement, userStripe, useElements } from '@stripe/react-stripe-js';


const Payments = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [amount, setAmount ] = useState(0);
    const [paymentIntent, setPaymentIntent] = useState();

    const createPaymentIntent = async (event) => {
            const validAmount = Math.min(Math.max(amount, 50), 9999999);
            setAmount(validAmount);

            const pi = await fetchFromAPI('payments', { body: { amount: validAmount}});
            setPaymentIntent(pi);
    }

    const handleSubmit = async(event) => {
                event.preventDefault();

                const cardElement = elements.getElement(CardElement);

                const {
                    paymentIntent: updatedPaymentIntent,
                    error,
                } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
                    payment_method: { card: cardElement},
                });

                if(error){
                    console.log(error);
                    error.payment_intent && setPaymentIntent(error.payment_intent);
                } else {
                    setPaymentIntent(updatedPaymentIntent);
                }
    }

    return(
        <>
            <h2>Payments</h2>
            <p>
                One-time payment scenario.
            </p>
            <div className="well">
                <PaymentIntentData data={paymentIntent} />
            </div>

            <div className="well">
                        <h3>Step 1: Create a Payment Intent </h3>
                <p>
                    Change the amount of the payment in the form, then request a Payment
                    Intent to create context for one-time payment. Min 50 , Max 9999999
                </p>   

                     <div className="form-inline">
                         <input 
                         type="number"
                         className="form-control"
                         value={amount}
                         disabled={paymentIntent}
                         onChange={(e) => setAmount(e.target.value)}
                         />
                         <button 
                         className="btn btn-success"
                         disabled={amount <= 0 }
                         onCLick={createPaymentIntent}
                         hidden={paymentIntent}
                         >
                             Ready to pay ${(amount / 100).toFixed(2)}
                         </button>
                     </div>
            </div>
            <hr/>

            <form 
            onSubmit={handleSubmit}
            className="well"
            hidden={!paymentIntent || paymentIntent.status === 'succeeded' }
            >

            </form>
        </>
    )
}