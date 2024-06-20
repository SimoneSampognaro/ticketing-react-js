import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { Col, Container, Row, Navbar, Button, Spinner, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate, useNavigate } from 'react-router-dom'; 
import { MyTicketList } from './components/MyTicket.jsx';
import { MyTicketForm } from './components/MyTicketForm.jsx'
import { NotFoundLayout, GenericLayout, AddLayout } from './components/Layout.jsx';
import API from './API.js';

  
function AppWithRouter(props) {

  const [tickets, setTickets] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [categories, setCagories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
      if(dirty){
          API.getAllTickets().then((ticketList) => setTickets(ticketList)).catch((err) => console.error(err));
          API.getAllCategories().then((categoriesList) => setCagories(categoriesList)).catch((err) => console.error(err));
          setDirty(false);
    }      
  }, [dirty]);

  function addTicket(ticket) {
    API.addTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => console.error(err));
  }

  return (
    <Container fluid>
        <Routes>
          <Route path="/" element={<GenericLayout/>} >
            <Route index element={ <MyTicketList tickets={tickets}/> } />
            <Route path="add" element={<AddLayout ownerId={1} addTicket={addTicket} categories={categories}/>} />
            <Route path="*" element={<NotFoundLayout />} />
          </Route>
        </Routes>
      </Container>
  );  
}


function App() {
  return (
    <BrowserRouter>
      <AppWithRouter />
    </BrowserRouter>
  );
}



export default App
