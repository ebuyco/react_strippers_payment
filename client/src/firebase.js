import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export const firebaseConfig = {
        apiKey: 'Your API KEY',
        authDomain: 'name_of_app.firebase.com',
        databaseURL: 'https://stripe-test.firebaseio.com',
        projectId: 'stripe-test',
        storageBucket: 'stripe-test.appspot.com',
        messagingSenderId:'senderId_its_bolean',
        appId: 'appID_its_bolean_combined_string',
}

firebase.initializeApp(firebaseConfig)

export const db = firebaseConfig.firestore();
export const auth = firebase.auth();