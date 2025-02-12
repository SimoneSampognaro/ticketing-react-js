
import { Row, Col, Button } from 'react-bootstrap';
import { Outlet, Link } from 'react-router-dom';
import { MyHeader } from "./MyHeader.jsx";
import { MyTicketForm } from './MyTicketForm.jsx';
import { MyTicketEdit } from './MyTicketEdit.jsx';
import { LoginForm } from "./Authentication.jsx";

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
      <MyTicketForm addTicket={props.addTicket} categories={props.categories} user={props.user} authToken={props.authToken} renewToken={props.renewToken}/>
    );
}

function LoginLayout(props) {
  return (
    <Row>
      <Col>
        <LoginForm login={props.login}/>
      </Col>
    </Row>
  );
}

function EditLayout(props) {
  
  return(
    <MyTicketEdit tickets={props.tickets} categories={props.categories} editTicket={props.editTicket}/>
    );
}

function GenericLayout(props) {
  
    return (
        <>
        <Row>
          <Col>
            <MyHeader loggedIn={props.loggedIn} user={props.user} logout={props.logout} errorMsg={props.errorMsg} setErrorMsg={props.setErrorMsg}/>
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