import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';

export default function Header() {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/">Avant-Garde</Link>
        </Navbar.Brand>
      </Navbar.Header>
      <Nav pullRight>
        <LinkContainer to="dashboard">
          <NavItem eventKey={1}>Dashboard</NavItem>
        </LinkContainer>
      </Nav>
    </Navbar>
  );
}
