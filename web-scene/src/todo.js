import './todo.css';

export function mountTodo(container){
 const storageKey='bestie-todos';
 let tasks=[];
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  if(Array.isArray(saved))tasks=saved.filter(t=>t&&typeof t.id==='string'&&typeof t.text==='string'&&t.text.trim()).map(t=>({id:t.id,text:t.text.slice(0,240),done:t.done===true}));
 }catch{}
 container.innerHTML='<h2>to do</h2><ul class="todo-items"></ul><form class="todo-entry"><input aria-label="New task" placeholder="one thing at a time…" maxlength="240" autocomplete="off" enterkeyhint="done"><span class="todo-sr-only" id="todo-hint">Press Enter to add your task.</span></form><p class="todo-sr-only" role="status"></p>';
 const list=container.querySelector('ul'),form=container.querySelector('form'),input=form.querySelector('input'),status=container.querySelector('[role="status"]');
 input.setAttribute('aria-describedby','todo-hint');
 function save(){try{localStorage.setItem(storageKey,JSON.stringify(tasks))}catch{status.textContent='Your tasks will stay here until you close this page. Browser storage is unavailable.'}}
 function append(task){
  const row=document.createElement('li');row.className='todo-item';
  const label=document.createElement('label'),check=document.createElement('input'),text=document.createElement('span'),remove=document.createElement('button');
  check.type='checkbox';check.checked=task.done;text.textContent=task.text;
  remove.type='button';remove.className='todo-remove';remove.textContent='×';remove.setAttribute('aria-label',`Delete task: ${task.text}`);remove.title='Delete task';
  label.append(check,text);row.append(label,remove);list.append(row);
  check.addEventListener('change',()=>{task.done=check.checked;save()});
  remove.addEventListener('click',()=>{
   const next=row.nextElementSibling?.querySelector('input')||row.previousElementSibling?.querySelector('input')||input;
   tasks=tasks.filter(t=>t!==task);row.remove();save();next.focus();
  });
 }
 tasks.forEach(append);
 form.addEventListener('submit',event=>{
  event.preventDefault();const text=input.value.trim();if(!text)return;
  const task={id:crypto.randomUUID(),text,done:false};tasks.push(task);append(task);save();input.value='';input.focus();
  container.querySelector('.todo-items').lastElementChild.scrollIntoView({block:'nearest'});
 });
}
