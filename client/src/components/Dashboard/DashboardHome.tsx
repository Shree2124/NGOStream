import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const DashboardHome: React.FC = () => {
  const {user} = useSelector((state: RootState)=>state.user)
  return (
    <div>
      Welcome {user?.username}
    </div>
  )
}

export default DashboardHome
