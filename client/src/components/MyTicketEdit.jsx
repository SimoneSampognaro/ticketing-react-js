import React, { useState, useEffect } from 'react';
import { Form, ButtonGroup, ToggleButton, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API';

function MyTicketEdit(props) {

    const { ticketId } = useParams();

    const [radioValue, setRadioValue] = useState("");
    const [ticket, setTicket] = useState();
    const [category, setCategory] = useState("");

    const radios = [
        { name: 'Closed', value: '0' },
        { name: 'Open', value: '1' },
    ];

    // load from server to be updated
    useEffect(() => {
        API.getTicketById(parseInt(ticketId)).then((ticket) => setTicket(ticket)).catch((err) => console.error(err));  
    }, []);

    return ( !ticket ? <Spinner className="m-2" />
        :
        <>
        <Container className="ticket-info my-3 p-3 border rounded">
            <Row className="mb-3">
                <Col>
                    <Link to="/">
                        <Button variant="dark my-1" size="sm-large">
                            <i className="bi bi-arrow-left"></i>
                        </Button>
                    </Link>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="fs-5">
                        <strong>Title:</strong><br />
                        {ticket.title}
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col xs={4}>
                    <div className="fs-5">
                        <strong>Category:</strong><br />
                        <Form.Group>
                            <Form.Select value={category} onChange={(event) => setCategory(event.target.value)}>
                                <option value="">{ticket.category}</option>
                                {props.categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="fs-5">
                        <strong>Description:</strong><br />
                        {ticket.description.split("\n").map((string,index) => (
                <React.Fragment key={index}>
                   {string}
                   <br />
               </React.Fragment>
             ))}
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="fs-5">
                        <strong>State:</strong><br />
                        <ButtonGroup>
                            {radios.map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-${idx}`}
                                    type="radio"
                                    variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                                    name="radio"
                                    value={ticket.state}
                                    checked={radioValue === radio.value}
                                    onChange={(e) => setRadioValue(e.currentTarget.value)}
                                >
                                    {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="fs-5">
                        <strong>Username:</strong><br />
                        {ticket.username}
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <div className="fs-5">
                        <strong>Timestamp:</strong><br />
                        {ticket.timestamp.format("MMMM DD YYYY, HH:mm:ss")}
                    </div>
                </Col>
            </Row>
        </Container>
    </>    
    );

}

export { MyTicketEdit };
