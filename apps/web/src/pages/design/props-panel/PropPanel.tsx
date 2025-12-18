import React from 'react'
import PagePanel from './PagePanel'
import CmpPanel from './CmpPanel'

const PropPanel = () => {
  const [activePanel, setActivePanel] = React.useState<'page' | 'cmp'>('cmp')

  return (
    <div className='w-full h-full'>
      {
        activePanel === 'page' ? <PagePanel /> : <CmpPanel />
      }
    </div>
  )
}

export default PropPanel