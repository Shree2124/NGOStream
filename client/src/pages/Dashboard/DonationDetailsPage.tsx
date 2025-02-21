import React from 'react'
import { DonationDetails } from '../../components'

const DonationDetailsPage: React.FC<{type: string}> = ({type}) => {
  return (
    <div>
      <DonationDetails type={type} />
    </div>
  )
}

export default DonationDetailsPage
