import React from 'react';
import { Form, Button } from 'react-bootstrap';
import TextareaAutosize from 'react-textarea-autosize';

function MyAnswerForm(props) {
  const { handleSubmit, newAnswer, setNewAnswer, errorMsg, setJoinConversation, deleteFormInformation } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <TextareaAutosize
          className="form-control"
          placeholder="Type your answer here"
          name="newAnswer"
          value={newAnswer}
          onChange={(event) => setNewAnswer(event.target.value)}
          minRows={3}
        />
        {errorMsg && <Form.Label className="text-danger">{errorMsg}</Form.Label>}
      </Form.Group>
      {/* Content validation and API call in MyTicket component*/}
      <Button variant="dark my-1" type="submit">Submit</Button>
      {/* Make the form disappear and delete its informations */}
      <Button variant="secondary my-1 mx-1" onClick={() => { setJoinConversation(false); deleteFormInformation(); }}>
        Close
      </Button>
    </Form>
  );
}

export { MyAnswerForm };