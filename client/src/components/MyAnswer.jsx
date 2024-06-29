import React from 'react';
import { Card, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyAnswer(props) {
    const answer = props.answer;
    
    return (         
      <Card className='my-1' style={{ height: '{`${answer.answer.split("\n").length}rem`}' }}>
        <Card.Body >
          <Card.Subtitle className="mb-2 text-muted">{answer.username}</Card.Subtitle>
          <Card.Text>
            {answer.answer.replace(/\\n/g, '\n').split('\n').map((string,index) => (
                <React.Fragment key={index}>
                   {string}
                   <br />
               </React.Fragment>
             ))}
          </Card.Text>
          <footer className="blockquote-footer my-1">
              {answer.timestamp.format("HH:mm:ss - MMMM D, YYYY")}
            </footer>
        </Card.Body>
      </Card>
    );
}

function MyAnswerList(props) {
  return (
        <>
          <MyAnswer answer={props.question} />
          {props.answers.map((e, index) => (
            <MyAnswer key={index} answer={e} />
          ))}
        </>
  );
}

export { MyAnswerList, MyAnswer };