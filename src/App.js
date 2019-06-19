import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

class App extends Component {
  state = {
    id: "",
    note: "",
    notes: []
  };

// when the Component mounts a list of notes will be displayed.  This allows
// you to see all of the previous notes your've made.  This list is stored
// in a querry in the graphql folder.  This querry is stored in a variable called
// listNotes.  listNote.items is the attribute that hold the entire list.

  async componentDidMount(){
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items })
  }

  handleChangeNote = event => this.setState({ note: event.target.value})

  hasExistingNote = () => {
    const { notes, id } = this.state
    if (id) {
      // is the id a valid id?
      const isNote = notes.findIndex(note => note.id  === id ) > -1
      return isNote;
    }
    return false;
  }

  handleAddNote = async event => {
    const { note, notes } = this.state;
    event.preventDefault();
  // check if we have an existing note, if so update it.  otherwise add the note
  if (this.hasExistingNote()) {
    this.handleUpdateNote();
  } else {
    const input = { note };
    const result = await API.graphql(graphqlOperation(createNote, { input }));
    const newNote = result.data.createNote;
    const updatedNotes = [newNote, ...notes];
    this.setState({ notes: updatedNotes, note: "" });
    }
  };

  handleUpdateNote = async () => {
    const { notes, id, note } = this.state;
    const input = { id, note };
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
  // puts the updated note in the correct place
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ]
    this.setState({ notes: updatedNotes, note: "", id: ""});
  }

// async function.  input will hold the note Id in order to identify which note
// to delete.  We will then run the mutation that deletes a note.  you need to
// pass the name of the mutation, deleteNote, and the input variable (this holds
// the id of the note to delete).

  handleDeleteNote = async noteId => {
    const { notes } = this.state
    const input = { id: noteId };
    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId);
    this.setState({ notes: updatedNotes })
  }

  // to update a note.  select a note to edit the text in the form, submit the
  // form, and have that updated note placed in its previous position in the
  // notes list.  First step is to allow users to click on the note.
  // Creating a function that allows you to click on the note, and grabs the id.
  //

  handleSetNote = ({note, id }) => this.setState({ note, id })

  render(){
    const { id, notes, note } = this.state;

    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note Form */}
        <form onSubmit={ this.handleAddNote } className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={ this.handleChangeNote }
            value={ note }
            />

            <button className="pa2 f4" type="submit">
              { id ? "Update Note": "Add Note"}
            </button>
        </form>
        {/* Notes List*/}
        <div>
          { notes.map(item => (
            <div key={ item.id } className="flex items-center">
              <li onClick={() => this.handleSetNote(item) } className="list pa1 f3">
                { item.note }
              </li>
              {/* graphql has a delete mutation we can use to delete notes to
                execute the handleDeletenote funciton you need to provide an
                arguement with the id.  item.id does this */}
              <button
                onClick={() => this.handleDeleteNote(item.id) }
                className="bg-transparent bn f4">
                <span>&times;</span>
              </button>
            </div>
          )) }
        </div>
      </div>
    )
  }
}

export default withAuthenticator(App, { includeGreetings: true });
