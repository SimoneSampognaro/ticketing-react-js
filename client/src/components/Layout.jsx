
import { Row, Col, Button, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { MyHeader } from "./MyHeader.jsx";
import { MyTicketForm } from './MyTicketForm.jsx';
import { MyTicketEdit } from './MyTicketEdit.jsx';
import { LoginForm } from './Auth';

function NotFoundLayout(props) {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
}

function AddLayout(props) {
    return (
      <MyTicketForm addTicket={props.addTicket} categories={props.categories} user={props.user}/>
    );
}

function LoginLayout(props) {
  return (
    <Row>
      <Col>
        <LoginForm loginSuccessful={props.loginSuccessful} login={props.login}/>
      </Col>
    </Row>
  );
}

function EditLayout(props) {
  
  return(
    <MyTicketEdit tickets={props.tickets} state="1" title="suca" category="payment" description="tusorella" username="ruzia" timestamp="June 20 2024, 20:15:37" categories={props.categories} editTicket={props.editTicket}/>
    );
}

function GenericLayout(props) {
  
    return (
        <>
        <Row>
          <Col>
            <MyHeader loggedIn={props.loggedIn} user={props.user} logout={props.logout}/>
          </Col>
        </Row>
        <Row>
          <Col>
          <Outlet />
          </Col>
        </Row>
      </>
    );
}
  

  
  export { NotFoundLayout, GenericLayout, AddLayout, EditLayout, LoginLayout };