import Toolbar from './Toolbar'

const CanvasPanel = () => {
  return (
    <div className="canvas-panel w-full h-full flex flex-col">
      <div className="canvas-container flex-1">
        canvas
      </div>
      <div className="toolbar-container border-t h-[50px] flex items-center px-4 dark:bg-[#18181c] bg-white">
        <Toolbar />
      </div>
    </div>
  )
}

export default CanvasPanel 