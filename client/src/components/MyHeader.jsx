import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import "../index.css";

function MyHeader(props) {
  const username = props.user.username;

	return (
        <Navbar expand="lg" className="bg-custom">
          <Container>
            <Navbar.Brand style={{color: "white"}}>
             <i className="bi bi-person-workspace mx-2"></i>
                Ticketing System
              </Navbar.Brand>
            <Navbar.Collapse className="justify-content-end">
            {username ? <div>
              <Navbar.Text style={{color: "white"}} className='fs-6 mx-1' >
              {"Signed in as: " + username }
              </Navbar.Text>
              <Button className='mx-2' variant='dark' onClick={props.logout}>Logout</Button>
            </div> :
            <Link to={`/login`}>
               <Button variant="dark">Login</Button>
               </Link>   
            }
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
}

export {MyHeader};