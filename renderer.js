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
};

document.getElementById('addTodo').addEventListener('click', function() {
  const todo = document.getElementById('todoInput').value;
  const transaction = db.transaction(['todos'], 'readwrite');
  const objectStore = transaction.objectStore('todos');
  const request = objectStore.add({ todo: todo });
  
  request.onsuccess = function(event) {
    document.getElementById('todoInput').value = '';
    displayData();
  };
});

function displayData() {
  const objectStore = db.transaction('todos').objectStore('todos');
  const todoList = document.getElementById('todoList');
  todoList.innerHTML = '';
  
  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;
    if(cursor) {
      let listItem = document.createElement('li');
      listItem.innerHTML = cursor.value.todo;
      todoList.appendChild(listItem);
      cursor.continue();
    }
  };
}