import React,{useState,useEffect}  from 'react';
import CardModal from './CardModal'
import axios from 'axios'
import {Droppable} from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import './AddItem.css'

const URL = 'http://localhost:8080'

function AddItem({list,cards,updateLists,listIndex,lists}) {

  const [items, updateitems] = useState([])
  const [showCardNaming, updateShowCardNaming] = useState(false)
  const [cardname, updateCardName] = useState('')

  function showHiddenCardNaming(){
    updateShowCardNaming(true)
  }
  function nameCard(e){
    updateCardName(e.target.value)
  }
  function addCard(e){
    e.preventDefault()
    let date = new Date()
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0');
    let yyyy = date.getFullYear();
    let time = date.toLocaleTimeString('sv-SE')
    date = mm + '/' + dd + '/' + yyyy;
    let id = uuidv4()
    cards.push({name:cardname, description:'', date:date, time:time, id:id })
    axios.post(`${URL}/v2/lists/${list.id}/cards`, {name:cardname, description:'', date:date, time:time, id:id })
    .then(response=>{
      updateShowCardNaming(false)
      updateCardName('')
    })
    .catch(error=>{
      console.log(error)
    })
  }

  return (
    <Droppable droppableId={list.id}>
    {(provided)=> (
    <div className="List"
    ref={provided.innerRef}
    {...provided.droppableProps}
    >
    <p className="letext">{list.listname}</p>
    <div>
    {cards.map((card,index)=>(
      <CardModal updateLists={updateLists} lists={lists} key={card.id} listIndex={listIndex} list={list} card={card} index={index}/>
    ))}
    {provided.placeholder}
    </div>

    {showCardNaming === false ?
    <div className="AddCard" onClick={showHiddenCardNaming}>
    <span className="material-icons material-icons-AddCard">add</span>
    <p className="AddCardText">Add a card</p>
    </div>
    :
    <form className="SubmitCard" onSubmit={addCard}>
    <input type="text" onChange={nameCard} required placeholder="add card text...."/>
    <input type="submit" value="Add Card"/>
    </form>
  }
    </div>
  )}
  </Droppable>
  );
}


export default AddItem;
