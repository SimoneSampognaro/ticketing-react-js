import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Container, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import "../index.css";

function MyHeader(props) {
  const username = props.user.username;
  const errorMsg = props.errorMsg;
  const setErrorMsg = props.setErrorMsg;

	return (
      <>
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
        {/* API errors will be catched and shown here */}
        {errorMsg? <Alert variant='danger my-1' dismissible onClose={()=>setErrorMsg('')}>{errorMsg}</Alert> : false}
      </>
      );
}

export {MyHeader};