import PagePanel from './PagePanel'
import CmpPanel from './CmpPanel'
import { useDesignStore } from '@/store/modules/design'

const PropPanel = () => {
  const {currentCmp} = useDesignStore()
  const isCmpPanel = !!currentCmp.id;
  return (
    <div className='w-full h-full'>
      {
        isCmpPanel ? <CmpPanel /> : <PagePanel />
      }
    </div>
  )
}

export default PropPanel