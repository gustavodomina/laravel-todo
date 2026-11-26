========================================================
TUTORIAL: TESTS AUTOMÁTICOS CON PHPUnit (CRUD DE TAREAS)
Proyecto: laravel-todo
Fecha: 2026-11-26
========================================================

¿QUÉ SON LOS TESTS Y POR QUÉ SIRVEN?
-------------------------------------
Un test es un pequeño programa que revisa automáticamente que tu
aplicación se comporte como esperás. En vez de abrir el navegador y
hacer clic por clic cada vez que cambiás algo, ejecutás un comando y
en segundos te dice "todo funciona" o "esto se rompió".

Laravel ya viene con PHPUnit configurado. Los tests viven en la
carpeta tests/ y se dividen en dos grupos:

  - tests/Unit     -> prueban una pieza chiquita y aislada (el modelo Task).
  - tests/Feature  -> prueban flujos completos (entrar a una página, crear
                      una tarea, borrarla...) como si fueran un usuario.

Importante: los tests NO tocan tu base de datos real (database/database.sqlite).
Usan una base de datos en memoria que se crea y se borra en cada test.
Eso está configurado en phpunit.xml (DB_CONNECTION=sqlite, DB_DATABASE=:memory:).


CÓMO EJECUTAR LOS TESTS
-----------------------
Desde la carpeta del proyecto, en una terminal:

    php artisan test

Vas a ver un ✓ verde por cada test que pasa y una ⨯ roja por cada uno
que falla, con la explicación del error. Al final, el resumen:

    Tests:    56 passed (198 assertions)

Otros comandos útiles:

    php artisan test --compact          (salida resumida, solo puntitos)
    php artisan test tests/Feature/TaskTest.php   (solo un archivo)
    php artisan test --filter=users_can_create_a_task   (solo un test)

Nota para esta PC: como Laragon no está en el PATH de todas las
terminales, si "php" no funciona hay que usar la ruta completa:

    /c/laragon/bin/php/php-8.5.8-nts-Win32-vs17-x64/php.exe artisan test


QUÉ TESTS ESCRIBIMOS
--------------------

1) tests/Feature/TaskTest.php (10 tests de flujo completo)

   - guests are redirected to login
     Un visitante sin sesión no puede ver, crear, editar ni borrar
     tareas: las 4 rutas lo mandan al login.

   - unverified users cannot manage tasks
     Un usuario registrado pero que todavía no verificó su email
     es redirigido a la pantalla de verificación.

   - index shows only the authenticated users tasks
     Creamos tareas para dos usuarios distintos y comprobamos que
     cada uno ve SOLO las suyas. Acá se usa assertInertia, que
     revisa los datos que Laravel le manda a la página React.

   - users can create a task
     Enviamos el formulario de creación y verificamos que la tarea
     quedó guardada en la base de datos con los datos correctos.

   - creating a task requires a title
     Si el título va vacío, la validación rechaza el envío, vuelve
     al formulario con el error y no se guarda nada.

   - users can update their task
     Editar título, notas y fecha de vencimiento funciona.

   - users can toggle completed
     Marcar como completada y desmarcar funciona.

   - users cannot update another users task
     Si un usuario intenta editar la tarea de OTRO, recibe un 403
     (prohibido) y la tarea queda intacta.

   - users can delete their task
     Borrar una tarea propia la elimina de la base de datos.

   - users cannot delete another users task
     Intentar borrar la tarea de otro da 403 y la tarea sigue ahí.

2) tests/Unit/TaskTest.php (4 tests del modelo Task)

   - completed is cast to boolean
     Aunque guardemos 1 o 0, al leerlo siempre es true/false.

   - due date is cast to a date
     La fecha se convierte en un objeto Carbon (CarbonInterface),
     que es como Laravel maneja fechas.

   - a task belongs to a user
     La relación funciona: $task->user devuelve el usuario dueño.

   - user_id cannot be mass assigned
     Seguridad: si alguien manda user_id por el formulario, Laravel
     lo ignora. El dueño de una tarea se asigna solo desde el
     controlador ($request->user()->tasks()->create(...)), nunca
     desde los datos del formulario. Así nadie puede "regalarse"
     o "colarse" tareas de otra persona.


ERRORES QUE APARECIERON Y CÓMO SE RESOLVIERON
---------------------------------------------
La primera vez que corrimos la suite, 2 tests unitarios fallaron.
Sirve como ejemplo de cómo se trabaja con tests:

1) "due date is cast to a date" esperaba Illuminate\Support\Carbon
   pero Laravel 12 usa CarbonImmutable (fechas que no se pueden
   modificar por accidente). Solución: assertInstanceOf contra
   Carbon\CarbonInterface, que es la interfaz que cumplen las dos.

2) "user_id cannot be mass assigned" usaba Task::create(...) y la
   base de datos rechazó el insert porque user_id es NOT NULL.
   Ojo: la protección SÍ funcionaba (user_id fue ignorado), el que
   estaba mal escrito era el test. Solución: crear el modelo con
   new Task([...]) sin guardarlo, y verificar que user_id quedó null.

Después de los arreglos: 56 tests, 198 aserciones, todo en verde.


LA RECETA (resumen práctico)
----------------------------
1. Escribir un test es: simular una acción (get/post/patch/delete),
   afirmar qué debe pasar (redirect, error 403, dato en la base) y
   dejar que RefreshDatabase limpie todo al terminar.
2. Correr siempre "php artisan test" antes de subir cambios a GitHub.
3. Si un test falla, primero preguntarse: ¿está mal el código o está
   mal el test? Esta vez eran los tests.
