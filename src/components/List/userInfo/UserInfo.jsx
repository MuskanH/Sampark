import React from 'react'
import {Ellipsis, Video, Pencil} from "lucide-react"
import { useUserStore } from '../../../lib/userStore'

const UserInfo = () => {
  const {currentUser} = useUserStore()
  return (
    <div className='userInfo text-white flex justify-between items-center p-5'>
      <div className='user flex gap-x-4 items-center'>
         <img src={ currentUser.avatar || './assets/user.jpg'} className='w-[40px] h-[40px] rounded-full object-cover '/>
         <h2>{currentUser.username}</h2>
      </div>
      <div className='icons flex gap-x-4'>
      <Ellipsis className='cursor-pointer'/>
      <Video className='cursor-pointer'/>
      <Pencil className='cursor-pointer'/>
      </div>
    </div>
  )
}

export default UserInfo
