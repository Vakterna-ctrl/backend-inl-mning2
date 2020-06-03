import React,{useState}  from 'react';
import AriaModal from 'react-aria-modal'
import {Draggable} from 'react-beautiful-dnd'
import axios from 'axios'
import './CardModal.css'

const URL = 'http://localhost:8080'

function CardModal({card,index, list, updateLists,listIndex, lists}) {

  const [modalActive, updateModalActive] = useState(false)
  const [showEditDescription, updateShowEditDescription] = useState(false)
  const [showTitleInput, updateShowTitleInput] = useState(false)
  const [currentName, updateName] = useState('')
  const [description, updateDescription] = useState('')

  function activateModal(e){
    e.stopPropagation()
    updateModalActive(true)
  }

  function deactivateModal(e){
    e.stopPropagation()
    updateModalActive(false)
    updateShowTitleInput(false)
  }

  function getApplicationNode(){
    return document.getElementById('root');
  }

  function showEdit(){
    updateShowEditDescription(true)
  }

  function getText(e){
    updateDescription(e.target.value)
  }

  function saveNewDescription(){
    card.description = description
    console.log(`${URL}/lists/${list.id}/cards/${card.id}/descriptions`)
    axios.patch(`${URL}/lists/${list.id}/cards/${card.id}/descriptions`, {description: description})
    updateShowEditDescription(false)
  }

  function showEditTitle(){
    updateShowTitleInput(true)
  }

  function getName(e){
    updateName(e.target.value)
  }

  function renameName(e){
    e.preventDefault();
    card.name = currentName
    axios.patch(`${URL}/lists/${list.id}/cards/${card.id}/names`, {name:currentName})
    updateShowTitleInput(false)
  }

  function deleteCard(e){
    e.stopPropagation();
    let newSetCard = list.cards.filter(item => item.id !== card.id)
    updateLists([
      ...lists.splice(0, listIndex),
      {...lists[listIndex],
      cards: newSetCard},
      ...lists.splice(listIndex+1)
    ])
    axios.delete(`${URL}/lists/${list.id}/cards/${card.id}`)
    updateModalActive(false)

  }

  const modal = modalActive
      ? <AriaModal
          titleText="demo one"
          onExit={deactivateModal}
          initalFocus={'.modalbutton'}
          getApplicationNode={getApplicationNode}
          underlayStyle={{ paddingTop: '2em' }}
        >
          <div id="demo-one-modal" className="modal">
          <div className="CardDescription">
          {showTitleInput === false ?
          <div className="CardTitle">
          <h1 className="Title">{card.name}</h1>
          <button onClick={showEditTitle} className="TitleButton">Edit Title</button>
          </div>
          :
          <form onSubmit={renameName} className="formTitle">
          <input onChange={getName} required type="text"/>
          <input type="submit" value="Re-name title"/>
          </form>
          }
          <p>This card was created on date {card.date} and on time {card.time} </p>
          <div className="description">
          <h2>Description</h2>
          <button onClick={showEdit} className="EditModal">Edit</button>
          </div>
          {showEditDescription === false ?
          <p style={{marginTop:"0"}}>{card.description}</p>
          :
          <>
          <textarea onChange={getText} id="w3review" name="w3review" rows="4" cols="50">
          {card.description}
          </textarea>
          <button onClick={saveNewDescription} style={{cursor:'pointer', marginBottom:"30px"}}>Save</button>
          </>
          }
          </div>
          <button className="modalbutton" onClick={deactivateModal}>Close</button>
          <button onClick={deleteCard}>Delete Card</button>
          </div>
        </AriaModal>
      : false;


  return (
    <Draggable draggableId={card.id} index={index}>
    {(provided, snapshot) => (
    <div className="Card" onClick={activateModal} {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
    <div style={{cursor:snapshot.isDragging ? 'grab': 'pointer', width:'100%'}}>
    <p className="CardText">{card.name}</p>
    </div>
    <div>
    {modal}
    </div>
    </div>
    )}
    </Draggable>
  );
}


export default CardModal;
