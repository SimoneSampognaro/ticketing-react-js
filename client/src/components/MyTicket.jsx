import React from 'react';
import { Container, Row, Col, Badge, Button, Form} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MyAnswerList } from './MyAnswer';
import API from '../API';

function MyTicket(props) {
  const ticket = props.ticket;
  
  const [answers, setAnswers] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [joinConversation, setJoinConversation] = useState(false);

  function showingLess(){ // when user click on show less, i need to remove the answers and also make disappear the form
    setShowMore(false);
    setJoinConversation(false);
  }
  
  useEffect(() => {
    API.getAllAnswersForTicket(ticket.id).then((answerList) => setAnswers(answerList)).catch((err) => console.error(err));
  }, []);

  return (
    <Container className="my-4">
      {/* First Row */}
      <Row className="bg-dark text-white p-3" style={{ backgroundColor: 'darkblue' }}>
        <Col xs={9}>
          <b>{`${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} - ${ticket.username}`} </b>
        </Col> 
        <Col xs={3} className="text-end">
        <Button variant="warning" size="sm"><i className="bi bi-pencil-square"></i></Button>
        <Button variant="danger mx-1" size="sm"><i className="bi bi-stopwatch"></i></Button>
        {showMore ? (
        <>
          <Button variant="secondary" size="sm" onClick={() => showingLess()}>
            Show less
          </Button>
        </>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowMore(true)}>
          Show more
        </Button>
      )}
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
         <b>{ticket.timestamp} </b>
        </Col>
      </Row>
      <Row>
        <Col>
        {showMore && <MyAnswerList answers={answers} question={{answer: ticket.description, timestamp: ticket.timestamp, username: ticket.username}}/>}
        </Col>
      </Row>
      <Row>
        <Col>
          {showMore && !joinConversation && (
            <Button variant="link" onClick={() => setJoinConversation(true)}>Join the conversation</Button>
          )}
          {showMore && joinConversation && (
            <Form >
            <Form.Group controlId="formBasicText">
              <Form.Control type="text" placeholder="Type your answer here" />
            </Form.Group>
            <Button variant="dark my-1" type="submit">
              Submit
            </Button>
            <Button variant="secondary my-1 mx-1" onClick={()=>setJoinConversation(false)}>
              Close
            </Button>
          </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}


/*function MyAnswer() {
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
}*/

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
