import PagePanel from './PagePanel'
import CmpPanel from './CmpPanel'
import { useDesignComponentsStore } from '@/store/design/components'

const PropPanel = () => {
  const cmpId = useDesignComponentsStore(state => state.currentCmpId)
  return (
    <div className='w-full h-full'>
      {
        cmpId ? <CmpPanel /> : <PagePanel />
      }
    </div>
  )
}

export default PropPanel