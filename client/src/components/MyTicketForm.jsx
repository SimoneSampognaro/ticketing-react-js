import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyModal } from './MyModal';
import TextareaAutosize from 'react-textarea-autosize';
import API from '../API.js';

function MyTicketForm(props) {
    const navigate = useNavigate();

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [ticket, setTicket] = useState(null);
    const [show, setShow] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [estimation, setEstimation] = useState("");
    const [estimate, setEstimate] = useState(false);

    const handleClose = () => setShow(false);

    function handleShow() {
        const newTicket = { 
            category: category, 
            title: title.trim(),  
            description: description,
            state: 1  // To be consistent with the getEstimations API, the state value will be set on the back end
        };

        if (newTicket.title.length === 0) {
            setErrorMsg('Title length cannot be 0');
        } else if (newTicket.category === "" || newTicket.category === "Choose a category") {
            setErrorMsg('Select a category');
        } else if (newTicket.description.trim().length === 0) {
            setErrorMsg('Description cannot be empty or just new lines');
        } else {
            setTicket(newTicket);
            setEstimate(true);
        }
    }

    useEffect(() => {
        if(props.authToken && props.user && estimate) // Show the modal for confirmation only after receiving the estimation
          API.getEstimations(props.authToken,[ticket])
          .then((estimation) => { setEstimation(estimation[0].estimation); setShow(true); setEstimate(false);})
          .catch(()=>props.renewToken()); // token expired, ask a new one and then retry the API
    
      }, [props.authToken, estimate]);

    return (
        <>
            {errorMsg ? <Alert variant='danger my-2' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
            {show && <MyModal handleClose={handleClose} show={show} ticket={ticket} addTicket={props.addTicket} username={props.user.username} estimation={estimation} isAdmin={props.user.isAdmin} />}
            <Form className="p-3 bg-light">
                <Form.Group className="mb-3">
                    <Form.Label><b>Title</b></Form.Label>
                    <Form.Control type="text" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label><b>Category</b></Form.Label>
                    <Form.Select value={category} onChange={(event) => setCategory(event.target.value)}>
                        <option>Choose a category</option>
                        {props.categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label><b>Description</b></Form.Label>
                    <TextareaAutosize
                        className="form-control"
                        name="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        minRows={3}
                    />
                </Form.Group>

                <div>
                    <Button variant="dark mx-1" onClick={handleShow}>Add</Button>
                    <Button variant='warning' onClick={() => { navigate('/') }}>Cancel</Button>
                </div>
            </Form>
        </>
    );
}

export { MyTicketForm };