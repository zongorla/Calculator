import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as CalculatorStore from '../store/Calculator';
import './Calculator.css';

type CalculatorProps =
    CalculatorStore.CalculatorState &
    typeof CalculatorStore.actionCreators &
    RouteComponentProps<{}>;

class Calculator extends React.PureComponent<CalculatorProps> {
    public render() {
        return (
            <React.Fragment>
                <div className="row">
                        <div className="col-md-4 col-md-offset-4">
                            <div className="row header">
                                <div className="col-md-12">
                                    <p>Calculator</p>
                                </div>
                        </div>
                            <div className="row textbox-secondary">
                                <div className="col-md-12 padding-reset">
                                    <input type="text" name="secondary" disabled value={this.props.textValueSecondary} />
                                </div>
                            </div>
                            <div className="row textbox">
                                <div className="col-md-12 padding-reset">
                                    <input type="text" name="primary" disabled value={this.props.textValue} />
                                </div>
                            </div>
                            <div className="row commonbutton">
                                {this.props.buttons.map(x => <CalculatorButton key={x.text} {...x} onClick={this.props.onButtonClick} ></CalculatorButton>)}
                                <CalculatorButton {...this.props.clearButton} onClick={this.props.clear} ></CalculatorButton>
                                <CalculatorButton {...this.props.loadButton} onClick={this.props.load} ></CalculatorButton>
                                <CalculatorButton {...this.props.saveButton} onClick={this.props.save} ></CalculatorButton>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        );
    }
};

class CalculatorButton extends React.PureComponent<CalculatorStore.CalculatorButton> {
    public render() {
        return <div className={"col-md-" + this.props.width}>
            <button onClick={this.props.onClick} name={this.props.name} disabled={!this.props.enabled}>{this.props.text}</button>
        </div>
    }
}

export default connect(
    (state: ApplicationState) => state.calculator,
    CalculatorStore.actionCreators
)(Calculator as any);
