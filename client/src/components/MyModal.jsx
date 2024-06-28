import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import React from 'react';

function MyModal(props) {
  const { show, handleClose, ticket, username, estimation, isAdmin } = props;

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg">
          
        <Modal.Header closeButton>
          <Modal.Title>Read-only confirmation page</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p><b>Title: </b>{ticket.title}</p>
          <p><b>Estimation time in {isAdmin ? "hours" : "days"}:</b> {estimation}</p>
          <p><b>Username: </b>{username}</p>
          <p><b>Category: </b>{ticket.category}</p>
          <p><b>Description: </b>{ticket.description.split("\n").map((string, index) => (
            <React.Fragment key={index}>
              {string}
              <br />
            </React.Fragment>
          ))}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => { props.addTicket(ticket) }}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export { MyModal };