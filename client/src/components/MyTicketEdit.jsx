import React, { useState } from 'react';
import { Form, ButtonGroup, ToggleButton, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyTicketEdit(props) {
    const { ticketId } = useParams();
    const objToEdit = ticketId && props.tickets.find(e => e.id === parseInt(ticketId));

    // Default values to handle undefined objToEdit
    const [radioValue, setRadioValue] = useState(objToEdit ? objToEdit.state.toString() : "1");
    const [category, setCategory] = useState(objToEdit ? objToEdit.category : "");
    const ticket = objToEdit || {};

    const radios = [
        { name: 'Closed', value: '0' },
        { name: 'Open', value: '1' },
    ];

    const handleSubmit = () => {
        props.editTicket({ id: ticketId, category: category, state: radioValue });
    };

    return (
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

            {ticketId && objToEdit ? (
                <>
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
                                {ticket.description.split("\n").map((string, index) => (
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
                                            value={radio.value}
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

                    <Row className="mb-3">
                        <Col>
                            <Button variant="dark" onClick={handleSubmit}>
                                Save Changes
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                <Row className="mb-3">
                    <Col>
                        <div className="fs-5 text-danger">
                            Ticket not found or invalid ticket ID.
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export { MyTicketEdit };