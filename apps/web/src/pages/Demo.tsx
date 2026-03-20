import { useEffect, useState } from "react"

const Demo = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    console.log(count);
    
    return () => {
      console.log('我变了');
    }
  }, [count])

  return (
    <div>
      <button onClick={() => setCount(prev => prev + 1)}>
        点击我
      </button>
    </div>
  )
}

export default Demo