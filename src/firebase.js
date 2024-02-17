import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD08BHncye4KdKrPg7SZs14jKcsL2Uqcms',
  authDomain: 'arisu-portal.firebaseapp.com',
  projectId: 'arisu-portal',
  storageBucket: 'arisu-portal.appspot.com',
  messagingSenderId: '976965664704',
  appId: '1:976965664704:web:f442d7683103b360a49225'
}

firebase.initializeApp(firebaseConfig)

export const auth = firebase.auth()
export const db = firebase.firestore()
export default firebase
