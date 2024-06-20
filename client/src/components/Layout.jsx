
import { Row, Col, Button, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { MyHeader } from "./MyHeader.jsx";
import { MyTicketForm } from './MyTicketForm.jsx';


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
    <>
    {filmToEdit? 
      <FilmForm editFilm={props.editFilm} filmToEdit={filmToEdit} />
     : <Navigate to={"/add"} />}
    </>
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
  

  
  export { NotFoundLayout, GenericLayout, AddLayout };