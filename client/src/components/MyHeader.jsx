import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Container, Button } from 'react-bootstrap';
import './custom.css';

function MyHeader(props) {
	return (
        <Navbar className="bg-body-tertiary">
          <Container>
            <Navbar.Brand style={{color: "dark-blue"}}>
             <i className="bi bi-person-workspace mx-2"></i>
                Ticketing System</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
              <Button variant="primary">Login</Button>
                { /* Signed in as: <a href="#login">Mark Otto</a>*/}
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
}

export {MyHeader};