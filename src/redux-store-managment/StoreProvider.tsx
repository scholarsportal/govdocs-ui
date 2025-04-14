/*
To use this new `makeStore` (@/lib/redux_lib/store) function we need to create a
new 'client' component that will create the store and share it using the 
React-Redux `Provider` component.
*/

'use client'
import { useRef } from "react"
import { Provider } from 'react-redux'
import { makeStore, AppStore } from "@/redux-store-managment/store"
//import { initializemessage } from "@/app/_main_page/features/counter/counterSlice"

interface Props {
    readonly children: React.ReactNode;
  }

export default function StoreProvider({
    children
} : Props) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()       
        //storeRef.current.dispatch(initializemessage('Hello this is a test'))
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}