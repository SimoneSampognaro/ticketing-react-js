import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { Col, Container, Row, Navbar, Button, Spinner, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate, useNavigate } from 'react-router-dom'; 
import { MyHeader } from "./components/MyHeader.jsx";
import { MyTicketList } from './components/MyTicket.jsx';
import API from './API.js';

  
function App() {

  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    API.getAllTickets().then((ticketList) => setTickets(ticketList)).catch((err) => console.error(err));
  }, []);

  return (
    <Container fluid>
        <Row>
          <Col>
            <MyHeader/>
          </Col>
        </Row>
        <Row>
          <Col>
          <MyTicketList tickets={tickets}/>
          </Col>
        </Row>
      </Container>
  );
}

export default App
