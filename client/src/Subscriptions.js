import React, {useState, useEffect, Suspense } from 'react';
import {fetchFromAPI } from './helpers';
import {useUser, AuthCheck } from 'reactfire';

import { db } from './firebase';
import { SignIn, SignOut } from './Customers';


function UserData(props) {
    const [ data, SignOut ] = useState({});

    useEffect(
        () => {
            const unsubscribe = db.collection('users').doc(props.user.uid).onSnapShot(doc => setData(doc.data()))
            return () => unsubscribe()
        },
        [props.user]
    )

    return(
        <>
            <pre>
                Stripe Customer ID: {data.stripeCustomerId} <br/>
                Subscriptions: {JSON.stringify(data.activePlans || [])}
            </pre>
        </>
    );
}

function SubscribeToPlan(props){
        const stripe = useStripe();
        const elements = useElements();
        const user = useUser();

        const [plan, setPlan ] = useState();
        const [ subscriptions, setSubscriptions ] = useState([]);
        const [ loading, setLoading ] = useState(false);

        useEffect(() => {
            getSubscriptions();
        }, [user]);

        const getSubscriptions = async() => {
            if(user) {
                const subs = await fetchFromAPI('subscriptions', {method: 'GET'});
                setSubscriptions(subs);
            }
        }

        const cancel = async (id) => {
            setLoading(true);
            await fetchFromAPI('subscriptions/' + id, {method: 'PATCH'});
            alert('canceled');
            await getSubscriptions();
            setLoading(false);
        };

        
}