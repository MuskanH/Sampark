import React from 'react'
import "./List.css"
import UserInfo from './userInfo/UserInfo'
import ChatList from './ChatList/ChatList'

const List = () => {
  return (
    <div className='list text-white flex flex-col '>
      <UserInfo/>
      <ChatList/>
    </div>
  )
}

export default List
