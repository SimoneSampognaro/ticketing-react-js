import React from 'react';
import { Container, Row, Col, Badge, Button, Card} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyTicket(props) {
  const ticket = props.ticket;

  return (
    <Container className="my-4">
      {/* First Row */}
      <Row className="bg-dark text-white p-3" style={{ backgroundColor: 'darkblue' }}>
        <Col>
          <b>{`${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} - ${ticket.username}`} </b>
        </Col> 
        <Col className="text-end">
          <Button variant="primary" size="sm">Show more</Button>
        </Col>
      </Row>

      {/* Second Row */}
      <Row className="bg-light text-dark p-3 mt-1" style={{ backgroundColor: 'gray' }}>
      <Col xs={2}>
        <Badge pill bg={ticket.state ? "success" : "danger"}>{ticket.state ? "Open" : "Closed"}</Badge>
        </Col>
        <Col xs={7}>
          <b>{ticket.title}</b>
        </Col>
        <Col xs={3} className="text-end"> 
         <b>{ticket.timestamp.format("HH:mm - MMMM D, YYYY")} </b>
        </Col>
      </Row>
      <Row>
        <Col>
        <MyAnswer/>
        </Col>
      </Row>
    </Container>
  );
}


function MyAnswer() {
  return (
    <Card className='my-1' style={{ height: '6rem' }}>
      <Card.Body >
        <Card.Subtitle className="mb-2 text-muted">Username</Card.Subtitle>
        <Card.Text>
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </Card.Text>
        <footer className="blockquote-footer">
            timestamp
          </footer>
      </Card.Body>
    </Card>
  );
}

function MyTicketList(props) {

  return (
    <>       
            {props.tickets.map( (e,index) => 
              <MyTicket key={index} ticket={e}/> )
          }
      </>
  );
}


export { MyTicketList };
