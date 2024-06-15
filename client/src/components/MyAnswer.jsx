import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyAnswer(props) {
    const answer = props.answer;
    
    return (
      <Card className='my-1' style={{ height: '6rem' }}>
        <Card.Body >
          <Card.Subtitle className="mb-2 text-muted">{answer.username}</Card.Subtitle>
          <Card.Text>
            {answer.answer}
          </Card.Text>
          <footer className="blockquote-footer">
              {answer.timestamp.format("HH:mm - MMMM D, YYYY")}
            </footer>
        </Card.Body>
      </Card>
    );
}

function MyAnswerList(props) {

    return ( // passo prima le informazioni sulla domanda, poi le risposte
      <>      
       <MyAnswer answer={props.question}/>  
              {props.answers.map( (e,index) => 
                <MyAnswer key={index} answer={e}/> )
            }
        </>
    );
  }

export { MyAnswerList, MyAnswer };