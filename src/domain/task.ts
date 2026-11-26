export const priorities = ["Alta", "Media", "Baja"] as const
export type Priority = (typeof priorities)[number]
export type Status = "todas" | "pendientes" | "completadas"

export interface TaskInput {
  title: string
  description: string
  category: string
  priority: Priority
}

export interface Task extends TaskInput {
  id: string
  completed: boolean
}

export interface Filters {
  query: string
  priority: Priority | ""
  status: Status
}

export function cleanInput(input: TaskInput): TaskInput {
  const title = input.title.trim()
  const category = input.category.trim()
  const description = input.description.trim()
  if (!title || !category || !description) throw new Error("Completá el título, la descripción y la categoría.")
  if (title.length > 120 || category.length > 40 || description.length > 1200) {
    throw new Error("Revisá la longitud de los campos.")
  }
  if (!priorities.includes(input.priority)) throw new Error("Seleccioná una prioridad válida.")
  return { title, description, category, priority: input.priority }
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false
  const task = value as Partial<Task>
  return typeof task.id === "string" && task.id.length > 0 &&
    typeof task.completed === "boolean" && typeof task.title === "string" &&
    typeof task.description === "string" && typeof task.category === "string" &&
    priorities.some(priority => task.priority === priority)
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es").trim()
}

export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  const query = normalize(filters.query)
  return tasks.filter(task =>
    (!filters.priority || filters.priority === task.priority) &&
    (filters.status === "todas" || task.completed === (filters.status === "completadas")) &&
    normalize(task.title).includes(query)
  )
}
