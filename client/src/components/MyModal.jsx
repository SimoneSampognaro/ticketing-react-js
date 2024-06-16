import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function MyModal(props) {
  // category , description, username, title
  return (
    <>
      <Modal
        show={props.show}
        onHide={props.handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Read-only confirmation page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p><b>Title: </b>{props.ticket.title}</p>
            <p><b>Username: </b>{props.ticket.username}</p>
            <p><b>Category: </b>{props.ticket.category}</p>
            <p><b>Description: </b>{props.ticket.description}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>{props.addTicket(props.ticket)}}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export { MyModal };