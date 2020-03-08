import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as CalculatorStore from '../store/Calculator';

type CalculatorProps =
    CalculatorStore.CalculatorState &
    typeof CalculatorStore.actionCreators &
    RouteComponentProps<{}>;

class Calculator extends React.PureComponent<CalculatorProps> {
    public render() {
        return (
            <React.Fragment>
                <h1>Calculator</h1>

                <p>This is a simple example of a React component.</p>

                <p aria-live="polite">Current count: <strong>{this.props.count}</strong></p>

                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.props.increment(); }}>
                    Inc
                </button>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.props.decrement(); }}>
                    Dec
                </button>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.props.load(); }}>
                    Load
                </button>
                <button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.props.save(); }}>
                    Save
                </button>
            </React.Fragment>
        );
    }
};

export default connect(
    (state: ApplicationState) => state.calculator,
    CalculatorStore.actionCreators
)(Calculator as any);
