import {
  ReactNode,
  createContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { Cycle, cyclesReducer } from '../reducers/Cycles/reducers'
import {
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/Cycles/actions'
import { differenceInSeconds } from 'date-fns'

interface createCycleData {
  task: string
  minutesAmount: number
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  markCurrentCycleAsFinished: () => void
  amountSecondsPassed: number
  setSecondsPassed: (seconds: number) => void
  createNewCycle: (data: createCycleData) => void
  interruptCurrentCycle: () => void
}

export const CyclesContext = createContext({} as CyclesContextType)

interface CyclesContextProviderProps {
  children: ReactNode
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  // const [cycles, setCycles] = useState<Cycle[]>([])
  const [CyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    (initialState) => {
      const storedStateAsJson = localStorage.getItem(
        '@ignite-timer:cycles-state-1.0.0',
      )

      if (storedStateAsJson) {
        return JSON.parse(storedStateAsJson)
      }

      return initialState
    },
  )

  const { cycles, activeCycleId } = CyclesState

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
    }
    return 0
  })

  /**
   * Set the seconds passed after started the task
   *
   * @param seconds
   *
   */
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  /**
   * HandleCreateNewCycle
   *
   * Functions that create new cycle
   */
  function createNewCycle(data: createCycleData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(addNewCycleAction(newCycle))
    setSecondsPassed(0)
  }

  /**
   * handleInterruptCycle
   *
   * Function that interrupt the current cycle
   */
  function interruptCurrentCycle() {
    dispatch(interruptCurrentCycleAction())
  }

  /**
   * Mark the current cycle as fineshed
   *
   */
  function markCurrentCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction())
  }

  useEffect(() => {
    const stateJSON = JSON.stringify(CyclesState)

    localStorage.setItem('@ignite-timer:cycles-state-1.0.0', stateJSON)
  }, [CyclesState])

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountSecondsPassed,
        markCurrentCycleAsFinished,
        setSecondsPassed,
        createNewCycle,
        interruptCurrentCycle,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
