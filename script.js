const todoDivs = document.querySelectorAll(".todo-item");
const todoListContainer = document.getElementById("todo-container");

let todos;
let filterMode = '';
let selectedTodo = '';

function init() {
    addNewTodoListener();
    addTodoContainerListeners();
    addOnclickEvents();
    todos = JSON.parse(localStorage.getItem("todos")) || [];
    mode = localStorage.getItem("theme");

    if (mode === "light") document.body.classList.toggle("light");
    if (!todos.length) return updateListCount();    

    todos.forEach(todo => {
        addTodo(todo.name);
        if (todo.completed) {
            document.getElementById(`${todo.name}-box`).checked = true;
            const todoDiv = document.getElementById(todo.name);
            todoDiv.classList.toggle('completed');
        }
    });
}

init();

// ADDING NEW TODO

function addNewTodoListener() {
    const newTodo = document.getElementById("add-todo");
    newTodo.addEventListener("keyup", (event) => {
        const key = event.key || event.keyCode;
        if (key === "Enter" || key === 13) {
            const todo = event.target.value;
            event.currentTarget.value = "";
            todos.push({ name: todo, completed: false });
            localStorage.setItem("todos", JSON.stringify(todos));

            addTodo(todo);
        }
    });
}

function addTodo(newTodo) {
    const todoDivContainer = document.getElementById("todo-container");
    const todoDiv = createTodoDivElement(newTodo);
    todoDivContainer.appendChild(todoDiv);
    addTodoItemEventListeners(todoDiv);
    updateListCount();
}

// ATTACH ONCLICK EVENTS TO CLICKABLE ELEMENTS

function addOnclickEvents() {
    document.querySelector(".toggle-btn").onclick = toggleTheme;
    document.querySelector(".clear-completed").onclick = clearCompletedTodos;
    document.getElementById('filterAll').onclick = filterAll;
    document.getElementById('filterAll').classList.add("filter-active");
    document.getElementById('filterActive').onclick = filterActive;
    document.getElementById('filterCompleted').onclick = filterCompleted;
}


// FOR SORTING

function addTodoItemEventListeners(todoDiv) {
    todoDiv.addEventListener("dragstart", (event) => {
        todoDiv.classList.add("dragging");
        selectedTodo = event.target;
    });

    todoDiv.addEventListener("dragend", () => {
        todoDiv.classList.remove("dragging");
    });
}

function addTodoContainerListeners() {
    todoListContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
        const todoElementAfterCurrent = getTodoElementAfterCurrent(event.clientY) || null;
        todoListContainer.insertBefore(selectedTodo, todoElementAfterCurrent);
    });
}

function getTodoElementAfterCurrent(currentY) {
    const draggables = [...document.querySelectorAll(".todo-item:not(.dragging)")];

    return draggables.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = box.top + (box.height/2) - currentY;
        if (offset > 0 && offset < closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}

// CREATE HTML ELEMENTS FOR NEW TODO

function createTodoDivElement(todo) {
    const todoDiv = document.createElement("div");
    todoDiv.className = "todo-item";
    todoDiv.id = todo;
    todoDiv.draggable = true;

    if (filterMode === 'completed') todoDiv.className += ' filtered';
    
    const todoCheckbox = createCheckboxElement(todo);
    const todoText = document.createElement("p");
    todoText.textContent = todo;
    const todoCross = createCrossElement(todo);

    todoDiv.appendChild(todoCheckbox);
    todoDiv.appendChild(todoText);
    todoDiv.appendChild(todoCross);

    return todoDiv;
}

function createCheckboxElement(todo) {
    const todoCheckbox = document.createElement("input");
    todoCheckbox.type = "checkbox";
    todoCheckbox.id = `${todo}-box`;

    const todoCheckboxSpan = document.createElement("span");
    todoCheckboxSpan.className = "cstm-checkbox";
    todoCheckboxSpan.onclick = () => {
        completeTodo(todo);
    };

    const todoCheckboxLabel = document.createElement("label");
    todoCheckboxLabel.className = "checkbox";
    todoCheckboxLabel.htmlFor = `${todo}-box`;
    todoCheckboxLabel.appendChild(todoCheckbox);
    todoCheckboxLabel.appendChild(todoCheckboxSpan);

    return todoCheckboxLabel;
}

function createCrossElement(todo) {
    const todoCross = document.createElement("span");
    todoCross.className = "cross";
    todoCross.id = todo;
    todoCross.onclick = () => {
        deleteTodo(todo);
    };

    return todoCross;
}

// VARIOUS TODO METHODS

function completeTodo(myTodo) {
    todos.some(todo => {
        if (todo.name === myTodo) {
            todo.completed ? todo.completed = false : todo.completed = true;
            return true;
        }
    });
    localStorage.setItem("todos", JSON.stringify(todos));
    const todoDiv = document.getElementById(myTodo);
    todoDiv.classList.toggle('completed');
}

function deleteTodo(myTodo) {
    const todoDiv = document.getElementById(myTodo);
    todoDiv.parentElement.removeChild(todoDiv);
    todos = todos.filter(todo => todo.name !== myTodo);
    localStorage.setItem("todos", JSON.stringify(todos));
    updateListCount();
}

function clearCompletedTodos() {
    todos.forEach(todo => {
        if (todo.completed) {
            const todoDiv = document.getElementById(todo.name);
            todoDiv.parentElement.removeChild(todoDiv);
        }
    });
    todos = todos.filter(todo => !todo.completed);
    localStorage.setItem("todos", JSON.stringify(todos));
    updateListCount();
}

// FILTERING

function filterAll() {
    filterMode = "all";
    removeFilter();
    this.classList.add("filter-active");
    updateListCount();
}

function filterActive() {
    filterMode = "active";
    filterByActiveOrComplete(true);
    this.classList.add("filter-active");
}

function filterCompleted() {
    filterMode = "completed";
    filterByActiveOrComplete(false);
    this.classList.add("filter-active");
}

function removeFilter() {
    Array.from(document.querySelectorAll('.todo-item')).forEach((todo) => todo.classList.remove('filtered'));
    Array.from(document.querySelectorAll('.filter-link')).forEach((filterLink) => filterLink.classList.remove('filter-active'));
}

function filterByActiveOrComplete(boolean) {
    removeFilter();
    let count = 0;
    todos.forEach(todo => {
        if (todo.completed === boolean) {
            const todoDiv = document.getElementById(todo.name);
            todoDiv.classList.add("filtered");
        } else count++;
    });
    updateListCount(count);
}

// MISC

function updateListCount(todoCount = todos.length) {
    const countDiv = document.getElementById("list-count");
    const count = todoCount;
    count === 1 ? countDiv.innerText = `${count} item left` : countDiv.innerText = `${count} items left`;    
}

function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.className || 'dark');
}