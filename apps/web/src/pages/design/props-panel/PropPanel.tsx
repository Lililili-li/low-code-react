import React from 'react'
import PagePanel from './components/PagePanel'
import CmpPanel from './components/CmpPanel'

const PropPanel = () => {
  const [activePanel, setActivePanel] = React.useState<'page' | 'cmp'>('page')

  return (
    <div className='w-full h-full'>
      {
        activePanel === 'page' ? <PagePanel /> : <CmpPanel />
      }
    </div>
  )
}

export default PropPanel