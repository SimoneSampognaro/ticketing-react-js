import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'; 
import { MyTicketList } from './components/MyTicket.jsx';
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
  const [hasLoggedOut, setHasLoggedOut] = useState(false); // State for logout tracking, used for delete answers list
  const [ errorMsg, setErrorMsg ] = useState('');

  // State to handle tokens and call to API for estimations
  const [authToken, setAuthToken] = useState(null);
  const [estimate, setEstimate] = useState(false);   // trigger useEffect to compute estimations
  const [estimations, setEstimations] = useState([]);
  
  const navigate = useNavigate();

  function handleError(err) {
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0].msg) {
        errMsg = err.errors[0].msg;
      }
    } else {
      if (err.error) {
        errMsg = err.error;
      }
    }
    setErrorMsg(errMsg);
  }

  const renewToken = () => {
    API.getAuthToken()
      .then((resp) => setAuthToken(resp.token))
      .catch((err) => handleError(err));
  };

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        renewToken();
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
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
          const categoriesList = await API.getAllCategories();
          setCategories(categoriesList);

          if(user && user.isAdmin){
            setEstimate(true); // Need to compute estimations
          }
        } else if (!loggedIn && dirty) {
          const genericTicketList = await API.getAllTicketsGeneric();
          setTickets(genericTicketList);
        }
        setDirty(false);
      } catch (err) {
        handleError(err);
      }
    };

    fetchTickets(); 
  }, [dirty, loggedIn]);

    useEffect( () => { 
      if(user && estimate){
          if(user.isAdmin && authToken){
            API.getEstimations(authToken,tickets).then((estimations)=>setEstimations(estimations)).catch(() => {renewToken(); setEstimate(true);});
            setEstimate(false);
          }
      }    
      }, [estimate, authToken]);

  function addTicket(ticket) {
    API.addTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => handleError(err));
  }

  function editTicket(ticket){
    API.editTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => handleError(err));
  }

  function closeTicket(ticket){
    API.closeTicket(ticket).then(() => {setDirty(true); navigate('/');}).catch((err) => handleError(err));
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setAuthToken(''); 
    setDirty(true);
    setHasLoggedOut(true); // Set logout state to true, cancel all answers
    navigate("/");
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setDirty(true);
      renewToken();
      setHasLoggedOut(false);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  return (
    <Container fluid>
        <Routes>
          <Route path="/" element={<GenericLayout loggedIn={loggedIn} user={user} logout={doLogOut} errorMsg={errorMsg} setErrorMsg={setErrorMsg} />} >
            <Route index element={ <MyTicketList tickets={tickets} closeTicket={closeTicket} user={user} loggedIn={loggedIn} hasLoggedOut={hasLoggedOut} authToken={authToken} handleError={handleError} estimations={estimations}/> } />
            <Route path="/add" element={<AddLayout addTicket={addTicket} categories={categories} user={user} authToken={authToken} renewToken={renewToken} />} />
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
