import PagePanel from './PagePanel'
import CmpPanel from './CmpPanel'
import { useDesignStore } from '@/store/modules/design'

const PropPanel = () => {
  const cmpId = useDesignStore(state => state.currentCmpId)
  return (
    <div className='w-full h-full'>
      {
        cmpId ? <CmpPanel /> : <PagePanel />
      }
    </div>
  )
}

export default PropPanel