import { Card, Badge, Row, Col, Table} from 'react-bootstrap';
import { CustomRectangle, CustomRectangleHeader} from './MyRectangle.jsx';

function MyTicket(props) {
  const ticket = props.ticket;

  return (
    <Card className="my-2" style={{ width: '45rem' }}>
        <Card.Header as="h5">{ticket.title}</Card.Header>
      <Card.Body>
        <Badge pill bg="primary">{ticket.category}</Badge>
        <Card.Text>
        {ticket.description}
        </Card.Text>
        <footer className="blockquote-footer">
            {ticket.username}
          </footer>
        <Card.Subtitle className="mb-2 text-muted">{ticket.timestamp.format("HH:mm - MMMM D, YYYY")}</Card.Subtitle>
      </Card.Body>
    </Card>
  );
}

function MyTicket2(props) {
    const ticket = props.ticket;
  
    return (
        <tr>
      <Card className="my-2" style={{ width: '45rem' }}>
          <Card.Header as="h5">
        <Row className="justify-content-between align-items-center">
          <Col xs="auto">
            <span>{ticket.title}</span>
          </Col>
          <Col xs="auto">
            <span>{ticket.username}</span>
          </Col>
        </Row>
      </Card.Header>
        <Card.Body>
            <CustomRectangle/>
        </Card.Body>
      </Card>
      </tr> 
    );
  }

function MyTicketList2(props) {
    return (
        <Table>
        {/* <Table striped bordered hover> */}
        <thead>
          <tr>
            <th>Date</th>
            <th>Text</th>
            <th>Author</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>        
                  {props.tickets.map( (e,index) => 
                   <CustomRectangle /> )
          }
        </tbody>
      </Table>
    );
}

function MyTicketList(props) {
    return (
        <>
        {props.tickets.map( (e,index) => 
                   <MyTicket/> )
          }
        </>
    );
}

export { MyTicketList, MyTicket };