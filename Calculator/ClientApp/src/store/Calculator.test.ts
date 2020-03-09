import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { CalculatorState, CalculatorButton, HandleButtonAction, operators, reducer, Operator}  from './Calculator';


function getButton(state: CalculatorState, text:string):CalculatorButton {
    let button = state.buttons.find(x => x.text === text);
    if (button === undefined) {
        throw Error("button not found");
    }
    return button;
}


function buttonAction(button: CalculatorButton): HandleButtonAction {
    return { type:"HANDLE_BUTTON_CLICK", button:button}
}

it('initial state created', () => {
    let state = reducer(undefined, {} as Action)
    expect(state).toBeDefined();
    expect(state.buttons.length).toBe(16);
});



describe('first number entry', () => {

    test('can enter single digit', () => {
        testForInput("9", (state) => {
            expectNoop(state);
            expectCurrent(state, 9);
            expectEmptyOther(state);
        })
    });

    test('only acccepts first 0', () => {
        testForInput("000000", (state) => {
            expectNoop(state);
            expectCurrentStr(state, "0");
            expectEmptyOther(state);
        })
    });


    test('can enter multiple digits', () => {
        testForInput("92311654", (state) => {
            expectNoop(state);
            expectCurrent(state, 92311654);
            expectEmptyOther(state);
        })
    });

    test('can enter negative number', () => {
        testForInput("-92311654", (state) => {
            expectNoop(state);
            expectCurrent(state, -92311654);
            expectEmptyOther(state);
        })
    });

    test('can enter float', () => {
        testForInput("923.11654", (state) => {
            expectNoop(state);
            expectCurrent(state, 923.11654);
            expectEmptyOther(state);
        })
    });

    test('only accepts first decimal', () => {
        testForInput("923.116.54", (state) => {
            expectNoop(state);
            expectCurrent(state, 923.11654);
            expectEmptyOther(state);
        })
    });

});
describe('operator entry', () => {
    test('can enter operators', () => {
        testForInput("9+", (state) => {
            expectOperator(state, operators.add);
            expectEmptyCurrent(state);
            expectOther(state, 9);
        });
        testForInput("9-", (state) => {
            expectOperator(state, operators.substract);
            expectEmptyCurrent(state);
            expectOther(state, 9);
        });
        testForInput("9/", (state) => {
            expectOperator(state, operators.divide);
            expectEmptyCurrent(state);
            expectOther(state, 9);
        });
        testForInput("9*", (state) => {
            expectOperator(state, operators.multiply);
            expectEmptyCurrent(state);
            expectOther(state, 9);
        });
    });
    test('can\'t change operator', () => {
        testForInput("966+*", (state) => {
            expectOperator(state, operators.add);
            expectEmptyCurrent(state);
            expectOther(state, 966);
        })
    });
    test('can\'t start with operator', () => {
        testForInput("+", (state) => {
            expectNoop(state);
            expectEmptyCurrent(state);
            expectEmptyOther(state);
        })
    });
    test('can start with - operator', () => {
        testForInput("-", (state) => {
            expectNoop(state);
            expectCurrentStr(state, "-");
            expectEmptyOther(state);
        })
    });
});

describe('exception cases', () => {
    test('divide by 0', () => {
        testForInput("10/0", (state) => {
            expectNoop(state);
            expect(Number.isFinite(state.currentOperand.value)).toBeFalsy();
            expectEmptyOther(state);
        })
        testForInput("10/0+5", (state) => {
            expectNoop(state);
            expect(Number.isFinite(state.currentOperand.value)).toBeFalsy();
            expectEmptyOther(state);
        })
    });
});

describe('full operations', () => {

    test('test operations', () => { 
        testForInput("9+100=", (state) => {
            expectNoop(state);
            expectCurrent(state, 109);
            expectEmptyOther(state);
        });
        testForInput("9-100=", (state) => {
            expectNoop(state);
            expectCurrent(state, -91);
            expectEmptyOther(state);
        });
        testForInput("9*100=", (state) => {
            expectNoop(state);
            expectCurrent(state, 900);
            expectEmptyOther(state);
        });
        testForInput("9/100=", (state) => {
            expectNoop(state);
            expectCurrent(state, 0.09);
            expectEmptyOther(state);
        })
    });

    test('can add after equals', () => {
        testForInput("9+100=+45=", (state) => {
            expectNoop(state);
            expectCurrent(state, 154);
            expectEmptyOther(state);
        })
    });

    test('can chain operation', () => {
        testForInput("9+100+45", (state) => {
            expectOperator(state, operators.add);
            expectCurrent(state, 45);
            expectOther(state, 109);
        })
    });
});

function expectNoop(state: CalculatorState) {
    expect(state.operator).toEqual(operators.noop);
}

function expectOperator(state: CalculatorState, op:Operator) {
    expect(state.operator).toEqual(op);
}

function expectCurrent(state: CalculatorState,value:number) {
    expect(state.currentOperand.value).toEqual(value);
}

function expectCurrentStr(state: CalculatorState, value: string) {
    expect(state.currentOperand.stringValue).toEqual(value);
}

function expectOther(state: CalculatorState, value: number) {
    expect(state.otherOperand.value).toEqual(value);
}

function expectOtherStr(state: CalculatorState, value: string) {
    expect(state.otherOperand.stringValue).toEqual(value);
}


function expectEmptyCurrent(state: CalculatorState) {
    expect(state.currentOperand.hasValue).toBeFalsy();
}

function expectEmptyOther(state: CalculatorState) {
    expect(state.otherOperand.hasValue).toBeFalsy();
}


interface StateAssert {
    (state: CalculatorState): void;
}

function testForInput(inputs: string, assert:StateAssert) {
    let state = reducer(undefined, {} as Action)
    for (let i = 0; i < inputs.length;i++) {
        state = reducer(state, buttonAction(getButton(state, inputs[i])));
    }
    assert(state);
}
