import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { loadavg } from 'os';


// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface CalculatorState {
    loading: boolean;
    saving: boolean;
    current: number;
}


// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface IncrementCountAction { type: 'INCREMENT_COUNT' }
export interface DecrementCountAction { type: 'DECREMENT_COUNT' }
export interface RequestMemoryLoadAction {
    type: 'REQUEST_MEMORY_LOAD';
}
export interface RecieveMemoryLoadAction {
    type: 'RECEIVE_MEMORY_LOAD';
    number: number;
}

export interface RequestMemorySaveAction {
    type: 'REQUEST_MEMORY_SAVE';
    number: number;
}
export interface RecieveMemorySaveAction {
    type: 'RECEIVE_MEMORY_SAVE';
}




// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = IncrementCountAction
    | DecrementCountAction
    | RecieveMemoryLoadAction
    | RequestMemoryLoadAction
    | RequestMemorySaveAction
    | RecieveMemorySaveAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    increment: () => ({ type: 'INCREMENT_COUNT' } as IncrementCountAction),
    decrement: () => ({ type: 'DECREMENT_COUNT' } as DecrementCountAction),
    load: (): AppThunkAction<KnownAction> => (dispatch, getState ) => {
        const appState = getState() ;
        if (appState && appState.calculator) {
            fetch(`memory`)
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_MEMORY_LOAD', number: data });
                });
            dispatch({ type: 'REQUEST_MEMORY_LOAD' });
        }
    },
    save: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.calculator) {
            let toSave = appState.calculator.current;
            fetch(`memory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: toSave }),
            })
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_MEMORY_SAVE' });
                });
            dispatch({ type: 'REQUEST_MEMORY_SAVE', number: toSave});
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<CalculatorState> = (state: CalculatorState | undefined, incomingAction: Action): CalculatorState => {
    if (state === undefined) {
        return {
            loading: false,
            saving: false,
            current: 0
        };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'INCREMENT_COUNT':
            return {
                ...state,
                current: state.current + 1
            };
        case 'DECREMENT_COUNT':
            return {
                ...state,
                current: state.current - 1
            };
        case 'RECEIVE_MEMORY_LOAD': {
            return {
                ...state,
                current: action.number,
                loading: false
            };
        }
        case 'REQUEST_MEMORY_LOAD': {
            return {
                ...state,
                loading: true
            }
        }
        case 'RECEIVE_MEMORY_SAVE': {
            return {
                ...state,
                saving: false
            };
        }
        case 'REQUEST_MEMORY_SAVE': {
            return {
                ...state,
                saving: true
            };
        }
        default:
            return state;
    }
};
