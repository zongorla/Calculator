import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

export interface CalculatorState {
    buttons: Array<CalculatorButton>;
    saveButton: CalculatorButton,
    loadButton: CalculatorButton,
    clearButton: CalculatorButton,
    textValue: string;
    textValueSecondary: string;
    otherOperand: Operand;
    currentOperand: Operand,
    operator: Operator;
    canEditCurrentValue: boolean;
    errorMessage: string; 
}

interface OperationExecutor {
    (left: Operand, right: Operand): number;
}

export class Operator{
    readonly text: string;
    readonly executor: OperationExecutor;
    constructor(text: string, executor: OperationExecutor) {
        this.text = text;
        this.executor = executor;
    }

    execute(left: Operand, right: Operand): Operand {
        const result: number = this.executor(left, right);
        return new Operand(result.toString());
    }
}
interface OperatorMap { [key: string]: Operator; }

export const operators: OperatorMap = {
    add: new Operator("+", (left,right) => left.value + right.value),
    substract: new Operator("-", (left, right) => left.value - right.value),
    multiply: new Operator("*", (left, right) => left.value * right.value),
    divide: new Operator("/", (left, right) => {
        return left.value / right.value
    }),
    noop: new Operator("", function (left, right) {
        throw new Error("Invalid operation");
    }),
}

class Operand {

    readonly hasValue: boolean;
    readonly hasDecimal: boolean;
    private readonly _value: string ;
    constructor(value: string | null, hasDecimal: boolean = false){
        if (value === null) {
            this.hasValue = false;
            this._value = "";
        } else {
            this.hasValue = true;
            this._value = value;
        }
        this.hasDecimal = hasDecimal;
    }

    get value(): number {
        if (this.hasValue) {
            return this.parse();
        } else {
            throw Error("Null reference exception");
        }
    }

    isValid(): boolean {
        const parsed = Number.parseFloat(this._value);
        if (Number.isNaN(parsed)) {
            return false;
        }
        return true;
    }

    private parse(): number {
        return Number.parseFloat(this._value);
    }

    concat(character: string) {
        if (this._value === "0" && character === "0") {
            character = "";
        } 
        return new Operand(this._value + character, this.hasDecimal || character===decimalSeparator.text);
    }

    get stringValue(): string {
        if (this.hasValue) {
            return "" + this._value;
        } else {
            return "";
        }
    }
}

const NullOperand = new Operand(null);

enum ButtonType {
    NUMBER=1,
    OPERATOR=2,
    DECIMALSEPARATOR = 3,
    EQUALS = 4,
    ACTION=4
}

export interface CalculatorButton {
    text: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    width: number;
    enabled: boolean;
    name: string;
    type: ButtonType;
}

export interface ClearScreenAction { type: 'CLEAR_SCREEN' }

export interface RequestMemoryLoadAction { type: 'REQUEST_MEMORY_LOAD';}
export interface RecieveMemoryLoadAction { type: 'RECEIVE_MEMORY_LOAD'; number: number | null; }
export interface ErrorMemoryLoadAction { type: 'ERROR_MEMORY_LOAD'; number: number | null; }

export interface RequestMemorySaveAction { type: 'REQUEST_MEMORY_SAVE'; number: number | null;}
export interface RecieveMemorySaveAction { type: 'RECEIVE_MEMORY_SAVE'; }
export interface ErrorMemorySaveAction { type: 'ERROR_MEMORY_SAVE'; }

export interface HandleButtonAction {
    type: 'HANDLE_BUTTON_CLICK';
    button: CalculatorButton;
}

export type KnownAction = ClearScreenAction
    | RecieveMemoryLoadAction
    | RequestMemoryLoadAction
    | ErrorMemoryLoadAction
    | RequestMemorySaveAction
    | RecieveMemorySaveAction
    | ErrorMemorySaveAction
    | HandleButtonAction;

export const actionCreators = {
    clear: () => ({ type: 'CLEAR_SCREEN' } as ClearScreenAction),
    load: (): AppThunkAction<KnownAction> => (dispatch, getState ) => {
        const appState = getState() ;
        if (appState && appState.calculator) {
            fetch(`memory`).then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_MEMORY_LOAD', number: data });
                }).catch(() => {
                    dispatch({ type: 'ERROR_MEMORY_SAVE' })
                });
            dispatch({ type: 'REQUEST_MEMORY_LOAD' });
        }
    },
    save: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.calculator && appState.calculator.currentOperand.hasValue) {
            let toSave = appState.calculator.currentOperand.value;
            fetch(`memory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: toSave }),
            }).catch(() => {
                dispatch({ type: 'ERROR_MEMORY_SAVE' });
            }).then(() => {
                dispatch({ type: 'RECEIVE_MEMORY_SAVE' });
            });
            dispatch({ type: 'REQUEST_MEMORY_SAVE', number: toSave});
        }
    },
    onButtonClick: (event: React.MouseEvent<HTMLButtonElement>): AppThunkAction<HandleButtonAction> => (dispatch, getState) => {
        const appState = getState();
        if (appState && appState.calculator) {
            let button = appState.calculator.buttons.find(x => x.name === (event.target as HTMLButtonElement).name);
            if (button !== undefined) {
                dispatch({ type: "HANDLE_BUTTON_CLICK", button: button })
            }
        }
    }
};

const numberButton = (value: number) => ({
    enabled: true,
    text: "" + value,
    name: "" + value,
    width: 3,
    type:ButtonType.NUMBER
})

const operatorButton = (value: string, name: string) => ({
    enabled: true,
    text: value,
    name: name,
    width: 3,
    type: ButtonType.OPERATOR
})

const actionButton = (value: string) => ({
    enabled: true,
    text: value,
    name: value,
    width: 4,
    type: ButtonType.ACTION
})

const decimalSeparator = {
    enabled: true,
    text: ".",
    name: "decimalSeparator",
    width: 3,
    type: ButtonType.DECIMALSEPARATOR
}

const equalsButton = {
    enabled: true,
    text: '=',
    name: 'equals',
    width: 3,
    type: ButtonType.EQUALS
}

function getInitialState(): CalculatorState{
   
    let buttons = [
        ...[9, 8, 7].map(numberButton), operatorButton("/","divide"),
        ...[6, 5, 4].map(numberButton), operatorButton("*","multiply"),
        ...[3, 2, 1].map(numberButton), operatorButton("-","substract"),
        numberButton(0), decimalSeparator, equalsButton, operatorButton("+", "add")] as Array<CalculatorButton>;
    return {
        otherOperand:NullOperand,
        operator: operators.noop, 
        textValue: "",
        saveButton: actionButton("Save") as CalculatorButton,
        loadButton: actionButton("Load") as CalculatorButton,
        clearButton: actionButton("Clear") as CalculatorButton,
        buttons,
        currentOperand: NullOperand,
        canEditCurrentValue: true,
        errorMessage: "",
        textValueSecondary: ""
    };
}

const calculateDisplayValue = (state: CalculatorState): CalculatorState => {
    if (state.otherOperand.hasValue) {
        state.textValueSecondary = state.otherOperand.stringValue + " " + state.operator.text;
        state.textValue = state.currentOperand.stringValue;
    } else {
        state.textValueSecondary = "";
        state.textValue = state.currentOperand.stringValue;
    }
    return state;
}

const reduce: Reducer<CalculatorState> = (state: CalculatorState | undefined, incomingAction: Action): CalculatorState => {
    if (state === undefined) {
        return getInitialState();
    }
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'CLEAR_SCREEN': {
            return clearScreen(state);
        }
        case 'REQUEST_MEMORY_LOAD': {
            return setButtonState({
                ...state
            }, false);
        }
        case 'RECEIVE_MEMORY_LOAD': {
            return setButtonState(recieveMemoryLoad(state,action),true);    
        }
        case 'ERROR_MEMORY_LOAD': {
            return setButtonState({
                ...state,
                canEditCurrentValue: true
            }, true);
        }
        case 'REQUEST_MEMORY_SAVE': {
            return setButtonState({ ...state }, false);
        }
        case 'RECEIVE_MEMORY_SAVE': {
            return setButtonState({
                ...state,
                canEditCurrentValue: true
            }, true);
        }
        case 'ERROR_MEMORY_SAVE': {
            return setButtonState({
                ...state,
                canEditCurrentValue: true
            }, true);
        }
        case "HANDLE_BUTTON_CLICK": {
            return handleButtonClick(state, action);
        }
        default:
            return state;
    }
}

export const reducer: Reducer<CalculatorState> = (state: CalculatorState | undefined, incomingAction: Action): CalculatorState => {
    return calculateDisplayValue(reduce(state, incomingAction));
};

function clearScreen(state: CalculatorState): CalculatorState {
    return {
        ...state,
        currentOperand: NullOperand,
        otherOperand: NullOperand,
        operator: operators.noop,
        canEditCurrentValue: true
    };
}

function setButtonState(state: CalculatorState, enable:boolean) {
    state.buttons = state.buttons.map(x => ({ ...x, enabled:enable }))
    return state;
}

function recieveMemoryLoad(state: CalculatorState, action: RecieveMemoryLoadAction): CalculatorState {
    if (action.number !== null) {
        return {
            ...state,
            currentOperand: new Operand(action.number.toString()),
            canEditCurrentValue: true
        };
    } else {
        return state;
    }
}

function handleButtonClick(state: CalculatorState, incomingAction: HandleButtonAction): CalculatorState {
    switch (incomingAction.button.type) {
        case ButtonType.OPERATOR: {
            return handleOperatorClick(state, incomingAction);
        }
        case ButtonType.DECIMALSEPARATOR: {
            return handleDecimalClick(state, incomingAction);
        }
        case ButtonType.NUMBER: {
            return handleNumberClick(state, incomingAction);
        }
        case ButtonType.EQUALS: {
            return handleEqualsClick(state, incomingAction);           
        }
        default: {
            return state;
        }
    }
}

function handleOperatorClick(state: CalculatorState, incomingAction: HandleButtonAction): CalculatorState {
    const newOperator = operators[incomingAction.button.name];
    state.canEditCurrentValue = true;
    if (isLeadingMinus(state, newOperator)) {
        return appendTextToCurrent(state, "-");
    }
    if (canExecuteOperation(state)) {
        return {
            ...state,
            otherOperand: execute(state),
            currentOperand: NullOperand,
            operator: newOperator
        }
    }
    if (state.operator === operators.noop && state.currentOperand.isValid()) {
        return {
            ...state,
            otherOperand: state.currentOperand,
            currentOperand: NullOperand,
            operator: newOperator
        }
    }
    return state;
}

function isLeadingMinus(state: CalculatorState, newOperator: Operator):boolean {
    return !state.currentOperand.hasValue && newOperator === operators.substract;
}

function handleDecimalClick(state: CalculatorState, incomingAction: HandleButtonAction): CalculatorState {
    if (!state.currentOperand.hasDecimal && state.canEditCurrentValue) {
        if (state.currentOperand.hasValue) {
            return appendTextToCurrent(state, ".");
        } else {
            return appendTextToCurrent(state,"0.");
        }
    } else {
        return state;
    }
}
function handleNumberClick(state: CalculatorState, incomingAction: HandleButtonAction): CalculatorState {
    if (state.canEditCurrentValue) {
        return appendTextToCurrent(state, incomingAction.button.text);
    } else {
        return state;
    }
}

function appendTextToCurrent(state: CalculatorState, text: string) {
    return {
        ...state,
        currentOperand: state.currentOperand.concat(text)
    }
}

function handleEqualsClick(state: CalculatorState, incomingAction: HandleButtonAction): CalculatorState {
    if (canExecuteOperation(state)) {
        return {
            ...state,
            currentOperand: execute(state),
            canEditCurrentValue: false,
            otherOperand: NullOperand,
            operator: operators.noop
        }
    }
    return state;
}

function execute(state: CalculatorState): Operand {
    return state.operator.execute(state.otherOperand, state.currentOperand)
}

function canExecuteOperation(state: CalculatorState): boolean {
    return state.currentOperand.isValid() && state.otherOperand.isValid() && state.operator !== operators.noop;
}
