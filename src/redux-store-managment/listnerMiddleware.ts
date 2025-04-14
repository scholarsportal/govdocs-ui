// listenerMiddleware.ts
import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'
import { addAuthListners } from '@/state-management/auth/authListner';

export const listenerMiddleware = createListenerMiddleware();


export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
  >();

export const addAppListner = addListener.withTypes<RootState, AppDispatch>();

addAuthListners(startAppListening);