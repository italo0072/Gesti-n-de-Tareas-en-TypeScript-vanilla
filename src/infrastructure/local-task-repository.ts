import { isTask, type Task } from "../domain/task"
import type { TaskRepository } from "../application/task-service"

export const storageKey = "margen.tareas.v1"

export class LocalTaskRepository implements TaskRepository {
  read(): Task[] {
    let raw: string | null
    try {
      raw = localStorage.getItem(storageKey)
    } catch {
      throw new Error("Permití el almacenamiento local en tu navegador para usar Margen.")
    }
    if (raw === null) return []
    try {
      const data: unknown = JSON.parse(raw)
      if (Array.isArray(data) && data.every(isTask) && new Set(data.map(item => item.id)).size === data.length) return data
    } catch {}
    throw new Error("No se pudieron leer las tareas guardadas. Se conservó el contenido original.")
  }

  async update(change: (tasks: Task[]) => Task[]): Promise<Task[]> {
    const write = () => {
      const tasks = change(this.read())
      try {
        localStorage.setItem(storageKey, JSON.stringify(tasks))
      } catch {
        throw new Error("No se pudo guardar el cambio. Revisá el espacio y los permisos del navegador.")
      }
      return tasks
    }
    return navigator.locks ? navigator.locks.request(storageKey, write) : write()
  }
}
