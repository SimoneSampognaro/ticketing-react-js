import React from 'react';
import { Container, Row, Col, Button, Badge} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function CustomRectangle() {
  return (
    <Container className="my-4">
      <Row className="bg-light border p-3 align-items-center" style={{ borderRadius: '8px' }}>
        <Col xs="auto">
        <Badge pill bg="success">Open</Badge>
        </Col>
        <Col className="text-center">
          <b>Title</b>
        </Col>
        <Col className="text-center">
          <span>Middle Text 2</span>
        </Col>
        <Col className="text-center">
          <span>Middle Text 3</span>
        </Col>
        <Col xs="auto">
          <Button variant="primary">Right Button</Button>
        </Col>
      </Row>
    </Container>
  );
}

function CustomRectangleHeader() {
    return (
      <Container className="my-4">
        <Row className="bg-light border p-3 align-items-center" style={{ borderRadius: '8px' }}>
          <Col xs="auto">
          <span><b>State</b></span>
          </Col>
          <Col className="text-center">
          <span><b>Title</b></span>
          </Col>
          <Col className="text-center">
            <span>Middle Text 2</span>
          </Col>
          <Col className="text-center">
            <span>Middle Text 3</span>
          </Col>
          <Col xs="auto">
            <Button variant="primary">Right Button</Button>
          </Col>
        </Row>
      </Container>
    );
  }


export {CustomRectangle, CustomRectangleHeader};
