
import { Row, Col, Button, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { MyHeader } from "./MyHeader.jsx";
import { MyTicketForm } from './MyTicketForm.jsx';
import { MyTicketEdit } from './MyTicketEdit.jsx';


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
      <MyTicketForm addTicket={props.addTicket} ownerId={props.ownerId} categories={props.categories}/>
    );
}

function EditLayout(props) {
  
  return(
    <MyTicketEdit tickets={props.tickets} state="1" title="suca" category="payment" description="tusorella" username="ruzia" timestamp="June 20 2024, 20:15:37" categories={props.categories}/>
    );
}

function GenericLayout(props) {
  
    return (
        <>
        <Row>
          <Col>
            <MyHeader/>
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
  

  
  export { NotFoundLayout, GenericLayout, AddLayout, EditLayout };