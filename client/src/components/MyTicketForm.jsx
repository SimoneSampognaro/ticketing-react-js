import { useState } from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MyModal } from './MyModal';
import TextareaAutosize from 'react-textarea-autosize';

function MyTicketForm(props) {
    const navigate = useNavigate();

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [ticket, setTicket] = useState(null);
    const [show, setShow] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleClose = () => setShow(false);

    function handleShow() {

        const newTicket = { 
            category: category, 
            title: title.trim(),  
            description: description,
        };

        if (newTicket.title.length == 0) {
            setErrorMsg('Title length cannot be 0');
        } else if (newTicket.category === "" || newTicket.category === "Choose a category") {
            setErrorMsg('Select a category');
        } else if (newTicket.description.trim().length == 0) {
            setErrorMsg('Description cannot be empty or just new lines');
        } else {
            setTicket(newTicket);
            setShow(true);
        }
    }

    // The Form.Select component has an onChange handler that updates the category state when the user selects a different category.
    return (
        <>
            {errorMsg? <Alert variant='danger my-2' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
            { show && <MyModal handleClose={handleClose} show={show} ticket={ticket} addTicket={props.addTicket} username={props.user.username}/> }
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
                    className="form-control" // Bootstrap class for styling
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    minRows={3} // Minimum number of rows
                />
            </Form.Group>

                <div>
                    <Button variant="dark mx-1" onClick={handleShow}>Add</Button>
                    <Button variant='warning' onClick={() => {navigate('/')}}>Cancel</Button>
                </div>
            </Form>
        </>
    );
}

export { MyTicketForm };
