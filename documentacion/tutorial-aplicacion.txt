# Tutorial de la aplicación: Mis Tareas (laravel-todo)

Esta es la guía completa de la aplicación que construimos. Está escrita paso a paso,
con lenguaje claro, para que puedas entender qué se hizo, por qué, y cómo repetirlo
desde cero en cualquier máquina.

---

## 1. ¿Qué es esta aplicación?

**Mis Tareas** es un gestor de tareas (to-do list) web donde cada usuario:

- Se registra con su nombre, email y contraseña (y verifica su email).
- Inicia sesión en su cuenta.
- Crea tareas con título, notas opcionales y fecha de vencimiento opcional.
- Las marca como completadas o pendientes con un clic.
- Las edita y las elimina (con un diálogo de confirmación).
- Ve sus tareas separadas en "Pendientes" y "Completadas".

Cada usuario ve **solamente sus propias tareas**. Nadie puede editar ni borrar
las tareas de otro (el servidor lo verifica y responde con error 403 si se intenta).

## 2. Tecnologías utilizadas

| Tecnología | Versión / Detalle | ¿Para qué sirve? |
|---|---|---|
| PHP | 8.5.8 (Laragon) | Lenguaje del servidor |
| Laravel | 12.x | Framework PHP: rutas, base de datos, autenticación |
| Starter Kit React | oficial de Laravel | Login/registro/perfil ya armados con React |
| Inertia.js | (incluido en el kit) | "Pega" Laravel con React sin hacer una API aparte |
| React | 19.x | Interfaz de usuario en el navegador |
| Tailwind CSS | (incluido en el kit) | Estilos de la interfaz |
| SQLite | archivo `database/database.sqlite` | Base de datos (no necesita servidor de MySQL) |
| Node.js | v24.18.0 | Compila los archivos JavaScript/React |
| Vite | (incluido) | Empaqueta los assets del frontend |

### ¿Cómo funciona por dentro? (resumen simple)

1. El navegador pide una página (por ejemplo `/tasks`).
2. Laravel (PHP) busca las tareas del usuario en SQLite.
3. Laravel le pasa esos datos a React a través de Inertia.
4. React dibuja la página en el navegador.
5. Cuando hacés clic en "Agregar" o "Eliminar", React envía la petición a Laravel,
   Laravel modifica la base de datos y React actualiza la pantalla **sin recargar la página**.

## 3. Cómo se creó el proyecto (paso a paso)

### 3.1 Requisito previo: el instalador de Laravel

```bash
composer global require laravel/installer
```

Esto instala el comando `laravel`, que crea proyectos nuevos con todo configurado.

### 3.2 El comando que creó todo

```bash
cd C:\laragon\www
laravel new laravel-todo --database=sqlite --react --phpunit --npm --git --no-boost --no-interaction
```

Cada opción significa:

- `laravel-todo` → nombre de la carpeta del proyecto.
- `--database=sqlite` → usa SQLite (crea el archivo `database/database.sqlite`
  y deja el `.env` configurado con `DB_CONNECTION=sqlite`).
- `--react` → instala el **React Starter Kit**: login, registro, verificación de
  email, reset de contraseña, perfil, passkeys y diseño, todo ya hecho en React.
- `--phpunit` → prepara PHPUnit para escribir tests.
- `--npm` → instala las dependencias de Node y compila el frontend.
- `--git` → inicializa un repositorio git con la rama principal.
- `--no-boost` → no instala herramientas extra de IA.
- `--no-interaction` → no hace preguntas, usa las opciones pasadas.

> **Nota sobre Laragon**: PHP y Composer de Laragon no siempre están en el PATH
> de otras terminales. Si `php` no es reconocido, usa la ruta completa:
> `C:\laragon\bin\php\php-8.5.8-nts-Win32-vs17-x64\php.exe`
> y `C:\laragon\bin\composer\composer.phar`.

### 3.3 Ajustes después de crear el proyecto

En el archivo `.env` se cambió el nombre de la aplicación:

```
APP_NAME="Mis Tareas"
```

Ese nombre aparece en el título de las pestañas del navegador y en el logo.

## 4. La funcionalidad de tareas: qué archivos se crearon/modificaron

### 4.1 La base de datos (migración)

Archivo: `database/migrations/2026_11_26_195102_create_tasks_table.php`

Una **migración** es como un plano de la tabla: se escribe en PHP y Laravel
se encarga de crear la tabla en la base de datos. La tabla `tasks` tiene:

| Columna | Tipo | Explicación |
|---|---|---|
| `id` | número | Identificador único (lo genera Laravel) |
| `user_id` | número | De qué usuario es la tarea (clave foránea; si se borra el usuario, se borran sus tareas) |
| `title` | texto | Título de la tarea (obligatorio) |
| `notes` | texto | Notas (opcional) |
| `due_date` | fecha | Vencimiento (opcional) |
| `completed` | sí/no | Si está completada (arranca en "no") |
| `created_at` / `updated_at` | fecha y hora | Cuándo se creó / modificó (automático) |

Se crea con:

```bash
php artisan make:model Task -m -c
```

que genera de una vez el **Modelo**, la **Migración** (`-m`) y el **Controlador** (`-c`).

Y se aplica a la base de datos con:

```bash
php artisan migrate
```

### 4.2 El modelo (la "representación" de una tarea)

Archivo: `app/Models/Task.php`

El modelo le dice a Laravel cómo hablar con la tabla `tasks`:

- `#[Fillable(['title', 'notes', 'due_date', 'completed'])]` → qué columnas se
  pueden llenar desde un formulario (protege contra que alguien intente
  modificar columnas que no debe, como `user_id`).
- `casts()` → convierte `due_date` en fecha y `completed` en verdadero/falso
  automáticamente.
- `user()` → relación: "esta tarea pertenece a un usuario".

En `app/Models/User.php` se agregó la relación inversa:

```php
public function tasks(): HasMany
{
    return $this->hasMany(Task::class);
}
```

"Un usuario tiene muchas tareas". Gracias a esto se puede escribir
`$user->tasks()` para obtener todas las tareas de ese usuario.

### 4.3 El controlador (la lógica de cada acción)

Archivo: `app/Http/Controllers/TaskController.php`

Tiene 4 métodos, uno por cada acción:

- **index**: busca las tareas del usuario autenticado (primero las pendientes,
  más nuevas primero) y renderiza la página React `tasks/index`.
- **store**: valida los datos del formulario de creación y crea la tarea.
  Con `$request->user()->tasks()->create(...)` la tarea queda asignada
  directamente al usuario actual.
- **update**: valida y actualiza. Antes chequea
  `abort_unless($task->user()->is($request->user()), 403)`:
  si la tarea no es tuya, respuesta 403 (prohibido).
- **destroy**: mismo chequeo de seguridad y borra la tarea.

La **validación** es importante: `title` es obligatorio y de hasta 255 caracteres;
si algo no cumple, Laravel devuelve el error y React lo muestra debajo del campo
(nunca llega basura a la base de datos).

### 4.4 Las rutas (las "direcciones" de la app)

Archivo: `routes/web.php`

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
});
```

- `middleware(['auth', 'verified'])` → para entrar a estas rutas hay que estar
  **logueado** y con el **email verificado**. Si no, te manda al login.
- `Route::resource(...)->only([...])` crea 4 rutas de una sola vez:

| Método HTTP | URL | Acción |
|---|---|---|
| GET | `/tasks` | Ver la lista (index) |
| POST | `/tasks` | Crear (store) |
| PUT/PATCH | `/tasks/{id}` | Modificar (update) |
| DELETE | `/tasks/{id}` | Borrar (destroy) |

Podés verlas con: `php artisan route:list --path=tasks`

### 4.5 El frontend (React)

Archivo principal: `resources/js/pages/tasks/index.tsx`

Es la página que ves en `/tasks`. Lo más importante:

- Recibe `tasks` (la lista) desde Laravel como propiedad.
- El formulario de creación usa `useForm` de Inertia: guarda lo que escribís,
  lo envía con `post()` y muestra los errores de validación con `<InputError>`.
- Cada tarea es un componente `TaskRow` con:
  - un botón circular para alternar completada/pendiente (`router.patch`),
  - un lápiz que abre el **diálogo de edición** (`router.patch` al guardar),
  - una papelera que abre el **diálogo de confirmación** y recién ahí borra
    (`router.delete`).
- Las fechas se muestran en formato argentino (`es-AR`) parseando año/mes/día
  por separado, para evitar el clásico error de que el día se corra uno por
  la diferencia horaria.

Archivo modificado: `resources/js/components/app-sidebar.tsx`

Se agregó el ítem "Tareas" al menú lateral:

```ts
{
    title: 'Tareas',
    href: tasksIndex(),
    icon: ListTodo,
},
```

### 4.6 Wayfinder (rutas tipeadas)

El kit usa **Wayfinder**: cuando agregás rutas en Laravel, genera automáticamente
funciones TypeScript en `resources/js/routes/` (por ejemplo `tasksIndex()`,
`tasksDestroy(id)`). Así el frontend no escribe URLs a mano y si una ruta cambia,
el compilador avisa. Se regenera solo al compilar (`npm run build` o `npm run dev`)
o manualmente con `php artisan wayfinder:generate`.

> **Ojo**: para compilar el frontend, PHP tiene que estar en el PATH, porque el
> plugin de Vite llama a `php artisan wayfinder:generate` por detrás.

## 5. Cómo correr la aplicación

### Opción A: con Laragon (recomendada)

1. Abrí **Laragon** y apretá **Start All**.
2. Laragon crea automáticamente la URL bonita: **http://laravel-todo.test**
   (apunta a la carpeta `public/` del proyecto).

### Opción B: servidor de desarrollo de Laravel

```bash
cd C:\laragon\www\laravel-todo
php artisan serve
```

y abrís **http://localhost:8000**.

### Si cambiás código del frontend

- Con `npm run dev` corriendo en otra terminal, los cambios React se ven al
  instante (hot reload). Ideal para desarrollar.
- Si no, después de cambiar algo hay que recompilar: `npm run build`.

### Resumen de comandos útiles

```bash
php artisan migrate            # aplica migraciones pendientes a la base de datos
php artisan route:list         # lista todas las rutas
php artisan tinker             # consola interactiva de Laravel
npm run dev                    # frontend en modo desarrollo (hot reload)
npm run build                  # compila el frontend para producción
npx tsc --noEmit               # verifica errores de tipos TypeScript
```

## 6. Estructura de carpetas del proyecto (lo esencial)

```
laravel-todo/
├── app/
│   ├── Http/Controllers/TaskController.php   ← lógica de tareas
│   └── Models/                               ← Task.php y User.php
├── database/
│   ├── database.sqlite                       ← LA BASE DE DATOS (un solo archivo)
│   └── migrations/                           ← planos de las tablas
├── resources/js/
│   ├── components/                           ← botones, diálogos, sidebar…
│   ├── pages/tasks/index.tsx                 ← página de tareas
│   └── routes/                               ← rutas generadas por Wayfinder
├── routes/web.php                            ← direcciones de la app
├── .env                                      ← configuración local (NO se sube a GitHub)
└── documentacion/                            ← estos tutoriales
```

## 7. Cosas que aprendimos en el camino (tips)

- **El email de verificación no sale de tu PC**: en desarrollo, Laravel "escribe"
  los emails en `storage/logs/laravel.log` en vez de enviarlos. El link de
  verificación se saca de ahí.
- **Nunca uses `confirm()` nativo del navegador** en apps modernas: se ve feo,
  no se puede estilizar y puede trabar automatizaciones. Mejor un diálogo de la
  biblioteca de componentes (en este proyecto, `Dialog` de shadcn/ui).
- **403 vs 404**: cada endpoint de modificación chequea que la tarea sea del usuario antes
  de tocarla. Eso evita que alguien adivine IDs y modifique datos ajenos.
- **SQLite es ideal para aprender y para apps chicas**: la base de datos entera
  es el archivo `database/database.sqlite`. Para copiarla a otra máquina, se
  copia el archivo (o se regenera con `php artisan migrate`).
