import React from 'react';
import { Container, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MyAnswerList } from './MyAnswer';
import TextareaAutosize from 'react-textarea-autosize';
import API from '../API';

function MyTicket(props) {
  const ticket = props.ticket;

  const [answers, setAnswers] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [joinConversation, setJoinConversation] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (newAnswer.length === 0) {
      setErrorMsg("Empty text fields are not allowed!");
    } else {
      const answer = {
        answer: newAnswer
      }
      deleteFormInformation();
      API.addAnswer(answer, ticket.id).then(() => setDirty(true)).catch((err) => console.error(err));
    }
  };

  function deleteFormInformation() {
    setNewAnswer("");
    setErrorMsg("");
  }

  const showingLess = () => {
    setShowMore(false);
    setJoinConversation(false);
    deleteFormInformation();
  };

  const showingMore = () => {
    setShowMore(true); 
    setDirty(true);
  };

  useEffect(() => {
    if (dirty) {
      API.getAllAnswersForTicket(ticket.id)
        .then((answerList) => setAnswers(answerList))
        .catch((err) => console.error(err));
      setDirty(false);
    }
  }, [dirty]);

  // Reset answers when user logs out
  useEffect(() => {
    if (props.hasLoggedOut) {
      setAnswers([]);
      showingLess();
    }
  }, [props.hasLoggedOut]);

  return (
    <Container className="mb-4"> {/* Add margin-bottom here for spacing */}
      {/* First Row */}
      <Row className="bg-dark text-white p-3" style={{ backgroundColor: 'darkblue' }}>
        <Col xs={9}>
          <b>{`${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} - ${ticket.username}`}</b>
        </Col>
        <Col xs={3} className="text-end">

          {props.loggedIn && (
              <>
            {props.user.isAdmin ? 
            (
              <Link to={`/edit/${ticket.id}`}>
                <Button variant="warning" size="sm">
                  <i className="bi bi-pencil-square"></i>
                </Button>
              </Link>
            ) : null}
            <Button variant="danger mx-1" size="sm" onClick={() => props.closeTicket({ id: ticket.id })}>
              <i className="bi bi-stopwatch"></i>
            </Button>
              </>
          )}

          {props.loggedIn && (
            showMore ? (
              <Button variant="secondary" size="sm" onClick={showingLess}>
                Show less
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={showingMore}>
                Show more
              </Button>
            )
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
          <b>{ticket.timestamp.format("MMMM DD YYYY, HH:mm:ss")}</b>
        </Col>
      </Row>

      {/* Answer List */}
      {showMore && props.loggedIn && (
        <Row>
          <Col>
            <MyAnswerList answers={answers} question={{ answer: ticket.description, timestamp: ticket.timestamp, username: ticket.username }} />
          </Col>
        </Row>
      )}

      {/* Join Conversation Form */}
      {showMore && props.loggedIn && ticket.state ? (
    <Row>
      <Col>
        {!joinConversation ? (
          <Button variant="link" onClick={() => setJoinConversation(true)}>Join the conversation</Button>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <TextareaAutosize
                className="form-control"
                placeholder="Type your answer here"
                name="newAnswer"
                value={newAnswer}
                onChange={(event) => setNewAnswer(event.target.value)}
                minRows={3}
              />
              {errorMsg && <Form.Label className="text-danger">{errorMsg}</Form.Label>}
            </Form.Group>
            <Button variant="dark my-1" type="submit">Submit</Button>
            <Button variant="secondary my-1 mx-1" onClick={() => { setJoinConversation(false); deleteFormInformation(); }}>
              Close
            </Button>
          </Form>
        )}
      </Col>
    </Row>
  ) : null}

    </Container>
  );
}

function MyTicketList(props) {
  return (
    <Container className="my-4">
      {/* Navigation Button */}
      { props.loggedIn && (
        <Row>
          <Col className="mb-2">
            <Link to="/add">
              <Button variant="dark">+ Add new ticket</Button>
            </Link>
          </Col>
        </Row>
      )}
      {/* Ticket List */}
      {props.tickets.map((e, index) => (
        <MyTicket key={index} ticket={e} closeTicket={props.closeTicket} user={props.user} loggedIn={props.loggedIn} hasLoggedOut={props.hasLoggedOut}/>
      ))}
    </Container>
  );
}

export { MyTicketList };
