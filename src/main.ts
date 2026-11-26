import "./style.css"
import { filterTasks, type Filters, type Priority, type Task } from "./domain/task"
import { TaskService } from "./application/task-service"
import { LocalTaskRepository, storageKey } from "./infrastructure/local-task-repository"
import { taskRow } from "./ui/task-row"

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error("Falta el elemento " + id)
  return node as T
}

const service = new TaskService(new LocalTaskRepository())
const filters: Filters = { status: "todas", priority: "", query: "" }
const list = byId("tasks")
const search = byId<HTMLInputElement>("search")
const priorityFilter = byId<HTMLSelectElement>("priority-filter")
const statusButtons = document.querySelectorAll<HTMLButtonElement>("[data-status]")
const editor = byId<HTMLDialogElement>("editor")
const confirmDelete = byId<HTMLDialogElement>("confirm")
const form = byId<HTMLFormElement>("task-form")
const titleField = form.elements.namedItem("title") as HTMLInputElement
const categoryField = form.elements.namedItem("category") as HTMLInputElement
const descriptionField = form.elements.namedItem("description") as HTMLTextAreaElement
const priorityField = form.elements.namedItem("priority") as HTMLSelectElement
let tasks: Task[] = []
let editingId: string | null = null
let deletingId: string | null = null
let toastTimer: number | undefined

function notify(message: string) {
  clearTimeout(toastTimer)
  byId("toast").textContent = message
  toastTimer = window.setTimeout(() => { byId("toast").textContent = "" }, 4000)
}

function showError(id: string, error: unknown) {
  const node = byId(id)
  node.textContent = error instanceof Error ? error.message : "Ocurrió un error. Intentá de nuevo."
  node.hidden = false
}

function resetFilters() {
  filters.status = "todas"
  filters.query = search.value = ""
  filters.priority = priorityFilter.value = ""
}

function render() {
  const visible = filterTasks(tasks, filters)
  list.replaceChildren(...visible.map(taskRow))
  const completed = tasks.filter(task => task.completed).length
  const percent = tasks.length ? Math.round(100 * completed / tasks.length) : 0
  byId("total").textContent = String(tasks.length)
  byId("percent").textContent = percent + "%"
  byId<HTMLProgressElement>("progress").value = percent
  byId("summary-count").textContent = completed + " de " + tasks.length + " " + (tasks.length === 1 ? "tarea completada" : "tareas completadas")
  byId("results").textContent = "Mostrando " + visible.length + " de " + tasks.length + (tasks.length === 1 ? " tarea" : " tareas")
  for (const button of statusButtons) button.setAttribute("aria-pressed", String(button.dataset.status === filters.status))
  byId("empty").hidden = visible.length > 0 || !byId("load-error").hidden
  byId("empty-title").textContent = tasks.length ? "Sin coincidencias" : "Tu lista está vacía"
  byId("empty-text").textContent = tasks.length ? "Probá otro título, estado o prioridad." : "Agregá tu primera tarea para empezar."
  byId("empty-action").textContent = tasks.length ? "Limpiar filtros" : "Crear mi primera tarea"
}

function load() {
  try {
    tasks = service.list()
    byId("load-error").hidden = true
  } catch (error) {
    showError("load-error", error)
  }
  render()
}

function openEditor(task?: Task) {
  editingId = task?.id ?? null
  form.reset()
  titleField.value = task?.title ?? ""
  categoryField.value = task?.category ?? ""
  descriptionField.value = task?.description ?? ""
  priorityField.value = task?.priority ?? "Media"
  byId("editor-title").textContent = task ? "Editar tarea" : "Nueva tarea"
  byId("save").textContent = task ? "Guardar cambios" : "Crear tarea"
  byId("editor-error").hidden = true
  editor.showModal()
  titleField.focus()
}

function focusRow(id: string, selector: string) {
  const row = Array.from(list.children).find(node => (node as HTMLElement).dataset.id === id)
  const target = row?.querySelector<HTMLElement>(selector) ?? byId("new")
  target.focus()
}

byId("new").addEventListener("click", () => openEditor())
byId("empty-action").addEventListener("click", () => {
  if (!tasks.length) return openEditor()
  resetFilters()
  render()
  search.focus()
})
for (const button of statusButtons) button.addEventListener("click", () => {
  filters.status = button.dataset.status as Filters["status"]
  render()
})
search.addEventListener("input", () => { filters.query = search.value; render() })
priorityFilter.addEventListener("change", () => { filters.priority = priorityFilter.value as Filters["priority"]; render() })

for (const dialog of [editor, confirmDelete]) {
  dialog.querySelectorAll(".cancel, .close").forEach(button => button.addEventListener("click", () => dialog.close()))
}

form.addEventListener("submit", async event => {
  event.preventDefault()
  const id = editingId
  const input = { title: titleField.value, description: descriptionField.value, category: categoryField.value, priority: priorityField.value as Priority }
  const save = byId<HTMLButtonElement>("save")
  save.disabled = true
  try {
    tasks = await (id ? service.edit(id, input) : service.create(input))
    if (!id) resetFilters()
    byId("load-error").hidden = true
    editor.close()
    render()
    if (id) focusRow(id, "button")
    else byId("new").focus()
    notify(id ? "Cambios guardados." : "Tarea creada.")
  } catch (error) {
    showError("editor-error", error)
  } finally {
    save.disabled = false
  }
})

list.addEventListener("change", async event => {
  const check = event.target
  if (!(check instanceof HTMLInputElement)) return
  const id = check.closest("li")?.dataset.id
  if (!id) return
  check.disabled = true
  try {
    tasks = await service.setCompleted(id, check.checked)
    render()
    notify(check.checked ? "Tarea completada." : "Tarea marcada como pendiente.")
  } catch (error) {
    load()
    showError("load-error", error)
  }
  focusRow(id, "input")
})

list.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return
  const action = event.target.closest<HTMLButtonElement>("button")
  if (!action) return
  const task = tasks.find(item => item.id === action.closest("li")?.dataset.id)
  if (!task) return
  if (action.dataset.action === "Editar") return openEditor(task)
  deletingId = task.id
  byId("confirm-message").textContent = "Se eliminará «" + task.title + "» de este navegador. Esta acción es permanente."
  byId("delete-error").hidden = true
  confirmDelete.showModal()
})

byId<HTMLFormElement>("delete-form").addEventListener("submit", async event => {
  event.preventDefault()
  if (!deletingId) return
  const button = confirmDelete.querySelector<HTMLButtonElement>("[type=submit]")!
  button.disabled = true
  try {
    tasks = await service.remove(deletingId)
    confirmDelete.close()
    deletingId = null
    render()
    byId("new").focus()
    notify("Tarea eliminada.")
  } catch (error) {
    showError("delete-error", error)
  } finally {
    button.disabled = false
  }
})

const now = new Date()
const date = byId<HTMLTimeElement>("today")
date.textContent = new Intl.DateTimeFormat("es-SV", { weekday: "short", day: "numeric", month: "short" }).format(now)
date.dateTime = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")
window.addEventListener("storage", event => {
  if (event.key === storageKey || event.key === null) load()
})
load()
