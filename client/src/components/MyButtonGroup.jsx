import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function MyButtonGroup(props) {
  const { showMore, showingMore, showingLess, closeTicket, ticketId, user, loggedIn, ownerId, state } = props;
    // lo stopwatch lo vedi solo se ticket aperto e se sei admin o owner
  return (
    <>
      {loggedIn && (
        <>
          {/* Button for edit visible only by admins */}
          {user.isAdmin ? (
            <Link to={`/edit/${ticketId}`}>
              <Button variant="warning" size="sm">
                <i className="bi bi-pencil-square"></i>
              </Button>
            </Link>
          ) : "" }
          
          {/* Button for closing the ticket visible only by admins and ticket's owner */}
          {state && (user.userId === ownerId || user.isAdmin) ?
           (
            <Button variant="danger mx-1" size="sm" onClick={() => closeTicket({ id: ticketId })}>
              <i className="bi bi-stopwatch"></i>
            </Button>
          ) : "" }
        </>
      )}
      {/* Buttons to make appear/disappear answers block texts, visible only by logged-in users */}
      {loggedIn && (
        showMore ? (
          <Button variant="secondary" size="sm" onClick={showingLess}>
            Show less
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={showingMore}>
            Show more
          </Button>
        )
      )}
    </>
  );
}

export { MyButtonGroup };
