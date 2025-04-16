// listenerMiddleware.ts
import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'

export const listenerMiddleware = createListenerMiddleware();


export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
  >();

export const addAppListner = addListener.withTypes<RootState, AppDispatch>();
