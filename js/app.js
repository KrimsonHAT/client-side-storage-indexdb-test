let DB;

// SELECTORES DE LA INTERFAZ
const formulario = document.querySelector('form'),
      mascota = document.querySelector('#mascota'),
      cliente = document.querySelector('#cliente'),
      telefono = document.querySelector('#telefono'),
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      sintomas = document.querySelector('#sintomas'),
      citas = document.querySelector('#citas'),
      headingAdministra = document.querySelector('#administra');


    //   Esperar por el DOM READY YA QUE SESSION STORAGE REQUIERE QUE ESTE CARGADO EL DOM
    // Y TODO ESTARA DENTRO DEL DOCUMENT READY

    document.addEventListener('DOMContentLoaded',()=>{
    //   Ctrear la base de datos--> 2 params 1ero nombre de la base datos
    // segundo la version

    let crearDB = window.indexedDB.open('citas',1);
        
    
    // Si hay un error enviar a la consola
        crearDB.onerror = function(){
            console.log("Hubo un error")
        }

        // Si todo esta bien mostrar en consola y asignar la base de datos
        crearDB.onsuccess = function(){
            // console.log("Todo listo!!")
            


            // Asignar a la base de datos
            DB = crearDB.result;
            // console.log(DB)
            mostrarCitas();
        }
        // Este metodo solo corre una vez ideal para schema de db

        crearDB.onupgradeneeded = function(e){
            // EL EVENTO ES LA MISMA BASE DE DATOS
            let db = e.target.result;
            console.log(db);
        // DEfinir el object store toma 2 params 1ero nombre base de datos y
        // segundo las opciones
        // keypath es el indice de la base de datos
        let objectStore = db.createObjectStore('citas', {keyPath: 'key',
       autoIncrement: true});
            // Crear indices y campos de la base de datos, createIndex : 3 params,
            // nombre,keypath y  opciones
            objectStore.createIndex('mascota','mascota',{unique : false});
            objectStore.createIndex('cliente','cliente',{unique : false});
            objectStore.createIndex('telefono','telefono',{unique : false});
            objectStore.createIndex('fecha','fecha',{unique : false});
            objectStore.createIndex('hora','hora',{unique : false});
            objectStore.createIndex('sintomas','sintomas',{unique : false});

            console.log("base de datos creada lista ")
   
        }

        formulario.addEventListener('submit',agregarDatos)
  


        function agregarDatos(e){
            e.preventDefault();

            const nuevaCita = {
                mascota: mascota.value,
                cliente: cliente.value,
                telefono: telefono.value,
                fecha: fecha.value,
                hora: hora.value,
                sintomas: sintomas.value
            }
            // console.log(nuevaCita)

           

            // en indexdb se utilizan las transaccioness
            let transaction = DB.transaction(('citas'),'readwrite');
            let objectStore = transaction.objectStore('citas');
            // console.log(objectStore)
            let peticion = objectStore.add(nuevaCita);


            console.log(peticion)


            peticion.onsuccess = () => {
                formulario.reset();
            }

            transaction.oncomplete = () =>{
                console.log("cita agregada");
                mostrarCitas();

            }
            transaction.onerror = () =>{
                console.log("Hubo un error")
            }
            
        }

        function mostrarCitas(){
            // Limpiar las ciotas anteriores
            while(citas.firstChild){
                citas.removeChild(citas.firstChild);
            }

            // Creamos un object store
            let objectStore = DB.transaction('citas').objectStore('citas');

            // Esto retoma una peticion
            objectStore.openCursor().onsuccess = function(e){
                // cursor se va a ubicar en el registro indicado
                // para acceder a los datos
                let cursor = e.target.result;

                if(cursor){
                    let citaHtml = document.createElement('li');

                    citaHtml.setAttribute('data-cita-id',cursor.value.key);
                    citaHtml.classList.add('list-group-item');


                    citaHtml.innerHTML = `
                            <p class = "font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                            <p class = "font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                            <p class = "font-weight-bold">Teléfono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                            <p class = "font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                            <p class = "font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                            <p class = "font-weight-bold">Síntomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                    
                    `;
                    // Boton de boorar
                    const bntBorrar = document.createElement('button');
                    bntBorrar.classList.add('borrar', 'btn', 'btn-danger');
                    bntBorrar.innerHTML = '<span aria-hidden="true">X</span> Borrar'
                    bntBorrar.onclick = borrarCita;
                    citaHtml.appendChild(bntBorrar);

                    // append en el padre
                    citas.appendChild(citaHtml);


                    // consultar los próximos registros
                    cursor.continue();
                }else{
                    // cuando no hay registros
                   if(!citas.firstChild){
                    headingAdministra.textContent = 'Agrega citas para comenzar';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay registros';
                    citas.appendChild(listado);
                   }else{
                       headingAdministra.textContent = 'Administra tus Citas';
                   }
                }

            }
        }

        function borrarCita(e) { 
           let citaID=e.target.parentElement.getAttribute("data-cita-id");

            // en indexdb se utilizan las transaccioness
            let transaction = DB.transaction(('citas'),'readwrite');
            let objectStore = transaction.objectStore('citas');
            // console.log(objectStore)
            let peticion = objectStore.delete(citaID);

            transaction.oncomplete = () =>{
                e.target.parentElement.parentElement.removeChild(e.target.parentElement);

                    // cuando no hay registros
                    if(!citas.firstChild){
                        headingAdministra.textContent = 'Agrega citas para comenzar';
                        let listado = document.createElement('p');
                        listado.classList.add('text-center');
                        listado.textContent = 'No hay registros';
                        citas.appendChild(listado);
                       }else{
                           headingAdministra.textContent = 'Administra tus Citas';
                       }



            }
        }
    })