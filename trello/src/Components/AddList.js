import React,{useState,useEffect}  from 'react';
import AddItem from './AddItem'
import {DragDropContext} from 'react-beautiful-dnd'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import './AddList.css'

const URL = 'http://localhost:8080'
function AddList() {
  const [showInput, updateInput] = useState(false)
  const [listname, updatelistname] = useState('')
  const [lists, updateLists] = useState([])

  useEffect(()=>{
    axios.get(`${URL}/lists`)
    .then(response=>{
      console.log(response)
      updateLists(response.data)
    })
  },[])

  function showinput(){
    updateInput(true)
  }
  function nameList(e){
    updatelistname(e.target.value)
  }
  function addlist(e){
    e.preventDefault()
    let id = uuidv4()
    updateLists(
      [...lists,
      {listname:listname, id:id, cards:[]}]
    )
    updatelistname('')
    updateInput(false)
    axios.post(`${URL}/lists`,{listname:listname, id:id, cards:[]})
    .then(response=>{

    })
  }

  function close(){
    updateInput(false)
  }

  function onDragEnd(result){
    let id = uuidv4()
    const {destination, source, draggableId} = result;
    if(!destination){
      return;
    }
    if(
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ){
      return;
    }
    if(destination.droppableId === source.droppableId){
    let sourceIndexList = lists.findIndex(list => list.id === source.droppableId)
    let getOriginalCard = lists[sourceIndexList].cards[source.index]
    let newCards = Array.from(lists[sourceIndexList].cards)
    newCards.splice(source.index,1)
    newCards.splice(destination.index,0,getOriginalCard)
    console.log(destination.index)
      axios.post(`${URL}/v1/lists/${source.droppableId}/cards`, {cards:newCards})

    updateLists([
      ...lists.slice(0, sourceIndexList),
      {listname:lists[sourceIndexList].listname, id:source.droppableId,cards:newCards},
      ...lists.slice(sourceIndexList+1)
    ])
    return;
  }
  let sourceIndexList = lists.findIndex(list => list.id === source.droppableId)
  let destinationIndexList = lists.findIndex(list => list.id === destination.droppableId)
  let getOriginalCard = lists[sourceIndexList].cards[source.index]
  let cardsFromSource = Array.from(lists[sourceIndexList].cards)
  let cardsFromDestination = Array.from(lists[destinationIndexList].cards)
  cardsFromSource.splice(source.index,1)
  cardsFromDestination.splice(destination.index,0,getOriginalCard)

  axios.delete(`${URL}/lists/${source.droppableId}/cards/${draggableId}`)
  axios.post(`${URL}/v1/lists/${destination.droppableId}/cards`, {cards:cardsFromDestination} )

  if(sourceIndexList>destinationIndexList){
    updateLists([
      ...lists.slice(0, destinationIndexList),
      {listname:lists[destinationIndexList].listname, id:destination.droppableId,cards:cardsFromDestination},
      ...lists.slice(destinationIndexList+1, sourceIndexList),
      {listname:lists[sourceIndexList].listname, id:source.droppableId,cards:cardsFromSource},
      ...lists.slice(sourceIndexList+1)
    ])
    return;
  }else{
    updateLists([
      ...lists.slice(0, sourceIndexList),
      {listname:lists[sourceIndexList].listname, id:source.droppableId,cards:cardsFromSource},
      ...lists.slice(sourceIndexList+1, destinationIndexList),
      {listname:lists[destinationIndexList].listname, id:destination.droppableId,cards:cardsFromDestination},
      ...lists.slice(destinationIndexList+1)
    ])
    return;
  }


  }

  return (
    <div className="listoflist">
    <DragDropContext onDragEnd={onDragEnd} >
    {lists.map((list, index)=>(
        <AddItem key={list.id} list={list} lists={lists} listIndex={index} updateLists={updateLists} cards={list.cards}/>
    ))}
    </DragDropContext>
    {showInput === false ?
    <div className="AddList" onClick={showinput}>
    <span className="material-icons material-iconsAdd">add</span>
    <p className="AddListText">add list</p>
    </div>
    :
    <div className="AddListInput">
    <form onSubmit={addlist}>
    <input type="text" className="listname" required onChange={nameList} placeholder="listname...."/>
    <div className="AddListButton">
    <input type="submit" className="SubmitList" value="add list"/>
    <span className="material-icons material-iconsClose" onClick={close}>close</span>
    </div>
    </form>
    </div>
  }
    </div>
  );
}


export default AddList;
