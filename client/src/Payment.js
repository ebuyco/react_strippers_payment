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
              <h3>Step 2: Submit a Payment Method</h3>
              <p>Collect credit card details, then submit the payment. </p>  
              <p>
                 Normal Card: <code>4242424242424242424242</code>                 
             </p>    
             <p>
                 3D Secure Card: <code>400000000025000031555</code>
             </p>
             <hr/>
             <CardElement/>
             <button
              className="btn btn-success" 
              type="submit"
              >
                Pay    
             </button>
            </form>
       </>
    );
}


function PaymentIntentData(props){
    if (props.data){
        const {id, amount, status, client_secret } = props.data;
        return(
            <>
                <h3>
                    Payment Intent
                    <span 
                    className={
                        'badge' + (status === 'succeeded' ? 'badge-success' : 'badge-secondary')
                    }
                    >
                        {status}
                    </span>
                    <pre>
                        ID: {id} <br/>
                        Client Secret: {client_secret} <br/>
                        Amount: {amount} <br/>
                        Status: {status}
                        <br/>
                    </pre>
                </h3>
            </>
        );
    } else {
        return (
            <p>Payment Intent Not Created Yet</p>
        );
    }
}

export default Payments;