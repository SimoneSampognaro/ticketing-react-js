import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Container, Button } from 'react-bootstrap';
c

function MyHeader(props) {
	return (
        <Navbar expand="lg" className="bg-custom">
          <Container>
            <Navbar.Brand style={{color: "white"}}>
             <i className="bi bi-person-workspace mx-2"></i>
                Ticketing System</Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
              <Button variant="dark">Login</Button>
                { /* Signed in as: <a href="#login">Mark Otto</a>*/}
              </Navbar.Text>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
}

export {MyHeader};