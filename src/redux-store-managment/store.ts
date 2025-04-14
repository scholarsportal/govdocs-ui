import type { Action, ThunkAction} from '@reduxjs/toolkit';
import { combineSlices, configureStore} from '@reduxjs/toolkit';
import { ocrApi } from '@/state-management/ocr/api';
import { ocrJobsApi } from '@/state-management/ocr_jobs/ocr';
import { documentsApi } from '@/state-management/documents/api';

// Since this is a next js app, we need to move from defining `store` as a global
// or module-singleton variable, to defining `makeStore` function that returns a
// new store for each request. This is because next js is server-rendered.
export function makeStore() {
    const store = configureStore({
        reducer: combineSlices({
            [ocrApi.reducerPath]: ocrApi.reducer,
            [ocrJobsApi.reducerPath]: ocrJobsApi.reducer,
            [documentsApi.reducerPath]: documentsApi.reducer,
        }),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(
                ocrApi.middleware,
                ocrJobsApi.middleware,
                documentsApi.middleware,
            ),
    });
    
    return store;
}

// Infer the type of `makeStore` from its usage
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
 // Infer the `AppDispatch` and `Thunk` types from the store itself
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
ThunkReturnType,
RootState,
unknown,
Action>;
