import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { Col, Container, Row, Navbar, Button, Spinner, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate, useNavigate } from 'react-router-dom'; 
import { MyTicketList } from './components/MyTicket.jsx';
import { MyTicketForm } from './components/MyTicketForm.jsx'
import { NotFoundLayout, GenericLayout, AddLayout, EditLayout, LoginLayout} from './components/Layout.jsx';
import API from './API.js';

  
function AppWithRouter(props) {

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState({});

  const [tickets, setTickets] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [categories, setCategories] = useState([]);
  const [hasLoggedOut, setHasLoggedOut] = useState(false); // New state for logout tracking
  
  const navigate = useNavigate();

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);  // The useEffect callback is called only the first time the component is mounted.

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (loggedIn && dirty) {
          const fullTicketList = await API.getAllTickets();
          setTickets(fullTicketList);
        } else if (!loggedIn && dirty) {
          const categoriesList = await API.getAllCategories();
          setCategories(categoriesList);
          const genericTicketList = await API.getAllTicketsGeneric();
          setTickets(genericTicketList);
        }
        setDirty(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets(); 
  }, [dirty, loggedIn]);

  function addTicket(ticket) {
    API.addTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => console.error(err));
  }

  function editTicket(ticket){
    API.editTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => console.error(err));
  }

  function closeTicket(ticket){
    API.closeTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => console.error(err));
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setDirty(true);
    setHasLoggedOut(true); // Set logout state to true
    navigate("/");
    /* set state to empty if appropriate */
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setDirty(true);
      setHasLoggedOut(false);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /*function handleLogin(credentials){
    API.logIn(credentials).then(user => loginSuccessful(user)).catch((err) => console.error(err));
  }*/

  return (
    <Container fluid>
        <Routes>
          <Route path="/" element={<GenericLayout loggedIn={loggedIn} user={user} logout={doLogOut}/>} >
            <Route index element={ <MyTicketList tickets={tickets} closeTicket={closeTicket} user={user} loggedIn={loggedIn} hasLoggedOut={hasLoggedOut} /> } />
            <Route path="/add" element={<AddLayout addTicket={addTicket} categories={categories} user={user}/>} />
            <Route path="/edit/:ticketId" element={<EditLayout tickets={tickets} categories={categories} editTicket={editTicket}/>} />
            <Route path="*" element={<NotFoundLayout />} />
          </Route>
          <Route path="/login" element={<LoginLayout login={handleLogin} />} />
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
