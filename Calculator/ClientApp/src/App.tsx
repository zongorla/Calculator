import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Calculator from './components/Calculator';

import './custom.css'

export default () => (
    <Layout>
        <Route path='/' component={Calculator} />
    </Layout>
);
