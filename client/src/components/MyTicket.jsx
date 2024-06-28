import React from 'react';
import { Container, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MyAnswerList } from './MyAnswer';
import TextareaAutosize from 'react-textarea-autosize';
import API from '../API';
import { MyButtonGroup } from './MyButtonGroup';
import { MyAnswerForm } from './MyAnswerForm';

function MyTicket(props) {
  const ticket = props.ticket;

  const [answers, setAnswers] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [joinConversation, setJoinConversation] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState('');
  const [estimation, setEstimation] = useState("");

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
  if (dirty && props.loggedIn) {     // in realtà non servirebbe isLoggedIn perchè non vedi il bottone!
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
      setEstimation("");
      showingLess();
    }
  }, [props.hasLoggedOut]);

  useEffect(() => {
    if(props.authToken && props.loggedIn && props.user.isAdmin) // dirty per evitare che tutti richiedano estimation???
      API.getEstimation(props.authToken,{category: ticket.category, title: ticket.title}).then((estimation) => setEstimation(estimation)).catch(()=>{});

  }, [props.authToken]);

  return (
    <Container className="mb-4"> {/* Add margin-bottom here for spacing */}
      {/* First Row */}
      <Row className="bg-dark text-white p-3" style={{ backgroundColor: 'darkblue' }}>
      <Col xs={9}>
         <b>{`${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} - ${ticket.username}`}</b>
         {props.user.isAdmin && estimation ? <span>{` - ${estimation} hours`}</span> : ''}
      </Col>
        <Col xs={3} className="text-end">
          <MyButtonGroup 
            showMore={showMore}
            showingMore={showingMore}
            showingLess={showingLess}
            closeTicket={props.closeTicket}
            ticketId={ticket.id}
            user={props.user}
            loggedIn={props.loggedIn}
            ownerId={ticket.ownerId}
            state={ticket.state}
          />
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
              <MyAnswerForm
                handleSubmit={handleSubmit}
                newAnswer={newAnswer}
                setNewAnswer={setNewAnswer}
                errorMsg={errorMsg}
                setJoinConversation={setJoinConversation}
                deleteFormInformation={deleteFormInformation}
              />
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
        <MyTicket key={index} ticket={e} closeTicket={props.closeTicket} user={props.user} loggedIn={props.loggedIn} hasLoggedOut={props.hasLoggedOut} authToken={props.authToken}/>
      ))}
    </Container>
  );
}

export { MyTicketList };
