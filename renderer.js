const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let db;
let request = indexedDB.open('todoDB', 1);

request.onerror = function(event) {
    console.log('Error opening DB', event);
};

request.onsuccess = function(event) {
    db = request.result;
    displayData();
};

request.onupgradeneeded = function(event) {
  let objectStore = event.currentTarget.result.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
  objectStore.createIndex('todo', 'todo', { unique: false });
  objectStore.createIndex('checked', 'checked', { unique: false }); // Add this line
};


let todoInput = document.getElementById('todoInput');
let addTodoButton = document.getElementById('addTodo');

if(todoInput && addTodoButton) {
    addTodoButton.addEventListener('click', function() {
      const todo = todoInput.value;
      const transaction = db.transaction(['todos'], 'readwrite');
      const objectStore = transaction.objectStore('todos');
      const request = objectStore.add({ todo: todo, checked: false }); // Set checked to false

      request.onsuccess = function(event) {
          todoInput.value = '';
          displayData();
          todoInput.focus();
      };
  });
}

function displayData() {
  const objectStore = db.transaction('todos').objectStore('todos');
  const todoList = document.getElementById('todoList');

  if (todoList) {
      todoList.innerHTML = '';

      objectStore.openCursor().onsuccess = function(event) {
          let cursor = event.target.result;
          if (cursor) {
              let listItem = document.createElement('li');

              let checkbox = document.createElement('input');
              
              checkbox.type = 'checkbox';
              checkbox.checked = cursor.value.checked; // Set the checkbox state

              checkbox.onchange = function() {
                this.nextElementSibling.style.textDecoration = this.checked ? 'line-through' : 'none';
                updateCheckedState(cursor.value.id, this.checked);
              };                 

              let label = document.createElement('span');
              label.innerHTML = cursor.value.todo;

              // Set the text decoration based on the checked state
              label.style.textDecoration = cursor.value.checked ? 'line-through' : 'none';              

              let deleteButton = document.createElement('button');
              deleteButton.innerHTML = 'X';
              deleteButton.onclick = getDeleteHandler(cursor.value.id);

              listItem.appendChild(deleteButton);
              listItem.appendChild(checkbox);
              listItem.appendChild(label);

              todoList.appendChild(listItem);

              cursor.continue();
          }
      };
  }
}

function updateCheckedState(id, checked) {
  const transaction = db.transaction(['todos'], 'readwrite');
  const objectStore = transaction.objectStore('todos');
  const getRequest = objectStore.get(id);
  
  getRequest.onsuccess = function(event) {
      const data = getRequest.result;
      data.checked = checked;  // update the checked state

      const updateRequest = objectStore.put(data);  // update the record in the database

      updateRequest.onsuccess = function(event) {
          console.log('Checked state updated successfully.');
      };

      updateRequest.onerror = function(event) {
          console.error('Error updating checked state:', event);
      };
  };

  getRequest.onerror = function(event) {
      console.error('Error retrieving data for updating checked state:', event);
  };
}




function getDeleteHandler(id) {
  return function() {
      deleteTodo(id);
  };
}


function deleteTodo(id) {
  const transaction = db.transaction(['todos'], 'readwrite');
  const objectStore = transaction.objectStore('todos');
  const request = objectStore.delete(id);

  request.onsuccess = function() {
      displayData(); // Refresh the TODO list after deletion
  };
}

function getDeleteHandler(id) {
  return function() {
      deleteTodo(id);
  };
}
