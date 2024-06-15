import { useState } from 'react';
import { Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import API from '../API';

function FormRoute(props) {
    return (
        <Row>
            <Col>
                <AnswerForm addAnswer={props.addAnswer} editAnswer={props.editAnswer}
                  answerList={props.answerList} />
            </Col>
        </Row>
    );
}

function MyTicketForm(props) {
    
    /* If we have an answerId in the URL, we retrieve the answer to edit from the list.
    In a full-stack application, starting from the answerId, 
    we could query the back-end to retrieve all the answer data (updated to last value). */
   
    //const { answerId } = useParams();
    //console.log(answerId);
    //const objToEdit = answerId && props.answerList.find(e => e.id === parseInt(answerId));
    //console.log(objToEdit);

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");

  //  const [errorMsg, setErrorMsg] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        
        const ticket = {
            id: props.ticketId, 
            state: 1, 
            category: category, 
            ownerId: props.ownerId, 
            title: title,  
            description: description
        };
        
        API.addTicket(ticket).then((id) => console.log(id)).catch((err) => console.error(err));
    }


    return (
        <>
    
        <Form onSubmit={handleSubmit}>
            <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </Form.Group>

            <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={category} onChange={(event) => setCategory(event.target.value)} />
            </Form.Group>

            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </Form.Group>

            <div className='my-2'>
                <Button type='submit' variant="primary">Add</Button>
                <Button variant='warning' onClick={()=>{navigate('/')}}>Cancel</Button>
            </div>
        </Form>
        </>
    );

}

export { MyTicketForm };