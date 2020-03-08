import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Calculator from './components/Calculator';
import FetchData from './components/FetchData';

import './custom.css'

export default () => (
    <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/calculator' component={Calculator} />
        <Route path='/fetch-data/:startDateIndex?' component={FetchData} />
    </Layout>
);
