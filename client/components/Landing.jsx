/* eslint-disable max-len */

import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/landing.scss';

export default function Landing() {
  return (
    <div className="wrapper">
      <div className="jumbotron container ag-landing--hero">
        <h2 className="hero-text">Welcome to Avant-Garde!!</h2>
        <LinkContainer to="dashboard">
          <Button bsStyle="primary" bsSize="large">Go to Dashboard</Button>
        </LinkContainer>
      </div>
      <div className="container">
        <h3 className="">Avant-Garde Project</h3>
        <div>
          <p className="ag-landing--description">Avant-Garde is a multidisciplinary research project by Schools of Medicine and Computer Science and Engineering  at the UC San Diego. Led by Dr. Davey Smith, associate professor of medicine in the Division of Infectious Diseases, Avant-garde project aims to stimulate high-impact research that may lead to groundbreaking opportunities for the prevention and treatment of HIV/AIDS in drug abusers. </p>
        </div>
      </div>
      <div className="container">
        <h3 className="">Exploratory Visual Analytics Dashboard</h3>
        <p className="ag-landing--description">As part of this endeavor, a heterogeneous dataset containing socio-demographic, clinical and viro-genetic information about patients in San Diego area has been collected.  This data can be used for more effective prevention and targeted intervention by enabling providers to better understand relationships between factors such social, demographic, genetic and genetic  of high risk groups and individuals. To achieve this goal, Dr. Weibel and his team at ubicomp lab has designed and implemented a data exploration platform tailor-made to specific needs of HIV researchers. This tool support data analysis through multiple coordinated views that represent data from various angles. Advanced interaction techniques such as dynamic filtering and brushing-and-linking enables searchers to easily investigate trends, distributions, and relationships.</p>
      </div>
      <div className="container">
        <h3 className="">Team</h3>
        <ul className="ag-landing--team">
          <li>Dr. Nadir Weibel (Supervision)</li>
          <li>Dr. Ali Sarvghad (Design, evaluation, supervision)</li>
          <li>Vincent Liaw (Implementation, testing)</li>
          <li>Joel Sequiera (Implementation, testing)</li>
          <li>Dr. Davey Smith</li>
          <li>Dr. Sanjay Mehta</li>
        </ul>
      </div>
    </div>
  );
}
