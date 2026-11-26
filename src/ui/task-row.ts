import type { Task } from "../domain/task"

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = "") {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

export function taskRow(task: Task): HTMLLIElement {
  const row = element("li", task.completed ? "task done" : "task")
  row.dataset.id = task.id
  const check = element("input", "check")
  check.type = "checkbox"
  check.checked = task.completed
  check.setAttribute("aria-label", "Completada: " + task.title)

  const details = element("div", "details")
  const tags = element("div", "tags")
  tags.append(element("span", "tag", task.category), element("span", "tag " + task.priority.toLowerCase(), "Prioridad " + task.priority.toLowerCase()))
  details.append(element("h3", "", task.title), element("p", "", task.description), tags)

  const actions = element("div", "actions")
  for (const label of ["Editar", "Eliminar"]) {
    const button = element("button", "text-action", label)
    button.dataset.action = label
    button.setAttribute("aria-label", label + ": " + task.title)
    actions.append(button)
  }
  row.append(check, details, actions)
  return row
}
