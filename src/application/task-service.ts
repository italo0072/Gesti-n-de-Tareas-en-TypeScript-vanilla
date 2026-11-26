import { cleanInput, type Task, type TaskInput } from "../domain/task"

export interface TaskRepository {
  read(): Task[]
  update(change: (tasks: Task[]) => Task[]): Promise<Task[]>
}

function createTaskId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")
}

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  list(): Task[] {
    return this.repository.read()
  }

  create(input: TaskInput) {
    const task = { ...cleanInput(input), id: createTaskId(), completed: false }
    return this.repository.update(tasks => [task, ...tasks])
  }

  edit(id: string, input: TaskInput) {
    const fields = cleanInput(input)
    return this.changeOne(id, task => ({ ...task, ...fields }))
  }

  setCompleted(id: string, completed: boolean) {
    return this.changeOne(id, task => ({ ...task, completed }))
  }

  remove(id: string) {
    return this.changeOne(id, () => null)
  }

  private changeOne(id: string, change: (task: Task) => Task | null) {
    return this.repository.update(tasks => {
      const current = tasks.find(task => task.id === id)
      if (!current) throw new Error("La tarea ya se eliminó. Actualizá la lista.")
      const next = change(current)
      return next ? tasks.map(task => task.id === id ? next : task) : tasks.filter(task => task.id !== id)
    })
  }
}
