import { useState } from 'react';
import { Form, Button, Alert, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API.js';

function LoginForm(props) {
  const [username, setUsername] = useState('admin1@example.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setErrorMessage('');
        props.loginSuccessful(user);
        navigate('/');
      })
      .catch(err => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage('Wrong username or password');
      })
  }
  
  const handleSubmita = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };

      // SOME VALIDATION, ADD MORE if needed (e.g., check if it is an email if an email is required, etc.)
      let valid = true;
      if(username === '' || password === '')
          valid = false;
      
      if(valid)
      {
        doLogIn(credentials);
      } else {
        // TODO: show a better explanation depending on the error.
        setErrorMessage('Invalid content in form.')
      }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    if (!username) {
      setErrorMessage('Username cannot be empty');
    } else if (!password) {
      setErrorMessage('Password cannot be empty');
    } else {
      props.login(credentials);
      navigate("/");
    };
  }  

  return (
    <Row>
      <Col xs={4}></Col>
      <Col xs={4}>
        <h1 className="pb-3">Login</h1>

        <Form onSubmit={handleSubmit}>
          {errorMessage? <Alert dismissible onClose={() => setErrorMessage('')} variant="danger">{errorMessage}</Alert> : null}
          <Form.Group className="mb-3">
            <Form.Label><strong>Email</strong></Form.Label>
            <Form.Control
              type="email"
              value={username} placeholder="Example: user@example.com"
              onChange={(ev) => setUsername(ev.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><strong>Password</strong></Form.Label>
            <Form.Control
              type="password"
              value={password} placeholder="Enter your password"
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </Form.Group>
          <Button className="mt-3" variant="warning" type="submit">Login</Button>
          <Button className="mt-3 mx-1" variant="dark" type="submit" onClick={()=>navigate("/")}>Cancel</Button>
        </Form>
      </Col>
      <Col xs={4}></Col>
    </Row>

  )
};

function LogoutButton(props) {
  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

function LoginButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };