# Tutorial de GitHub: cómo publicar tu aplicación paso a paso

Esta guía explica cómo subimos `laravel-todo` a GitHub para que esté disponible
en internet, y cómo seguir trabajando con el repositorio después. Está pensada
para que puedas repetir el proceso con **cualquier** proyecto futuro.

---

## 1. Conceptos básicos (2 minutos)

- **Git**: programa que vive en tu PC y guarda el historial de cambios de tu
  proyecto. Cada "foto" del proyecto se llama **commit**.
- **GitHub**: sitio web que aloja tu proyecto (con su historial de commits) en
  la nube. Cada proyecto alojado se llama **repositorio** (repo).
- **Relación**: en tu PC tenés el repo local; en GitHub, el repo remoto.
  Con `git push` subís los commits; con `git pull` bajás los cambios.
- **GitHub CLI (`gh`)**: herramienta oficial que permite crear el repo en
  GitHub y autenticarte desde la terminal, sin entrar a la web.

## 2. Instalar GitHub CLI

Si no lo tenés instalado (verificá con `gh --version`):

```bash
winget install --id GitHub.cli -e
```

Después **cerrá y abrí la terminal** para que reconozca el comando nuevo.
En Windows queda instalado en `C:\Program Files\GitHub CLI\gh.exe`.

## 3. Autenticarse en GitHub (una sola vez por PC)

```bash
gh auth login
```

Te va a hacer unas preguntas; respondé así:

1. **¿Dónde usás GitHub?** → `GitHub.com`
2. **¿Protocolo preferido?** → `HTTPS`
3. **¿Autenticar Git con tus credenciales de GitHub?** → `Yes`
   (esto es clave: así `git push` funciona sin pedirte usuario y contraseña)
4. **¿Cómo querés autenticarte?** → `Login with a web browser`
5. Te muestra un **código de un solo uso** (ejemplo: `ABCD-1234`). Anotalo.
6. Presioná Enter → se abre el navegador → pegá el código → autorizá.

Verificá que funcionó:

```bash
gh auth status
```

Deberías ver tu usuario y "Logged in to github.com".

## 4. Preparar el proyecto antes de subirlo

### 4.1 ¿El proyecto ya es un repo git?

```bash
cd C:\laragon\www\laravel-todo
git status
```

Si responde con una lista de archivos, ya es un repo (el instalador de Laravel
lo creó con `--git`). Si dice "not a git repository", inicializalo:

```bash
git init -b main
```

> La rama principal se llama **main** por convención moderna. Si tu repo dice
> `master`, renombrala: `git branch -M main`

### 4.2 El archivo .gitignore (muy importante)

Laravel ya trae un `.gitignore` que deja **fuera** del repositorio:

- `.env` → contiene claves secretas de TU instalación (APP_KEY, etc.).
- `node_modules/` y `vendor/` → dependencias (se regeneran con
  `npm install` y `composer install`; subirlas sería enorme e inútil).
- `database/database.sqlite` → tu base de datos local con tus datos.
- Archivos de logs y caché.

**Regla de oro**: nunca subas archivos con contraseñas o claves. El `.gitignore`
es tu primera defensa.

### 4.3 Hacer el primer commit

```bash
git add .
git status          # revisá QUÉ se va a subir (deberían faltar .env, vendor, etc.)
git commit -m "Aplicación inicial: gestor de tareas con Laravel 12 + React"
```

- `git add .` → prepara todos los cambios para el commit.
- `git commit -m "..."` → guarda la foto con un mensaje que explica qué cambió.

## 5. Crear el repositorio en GitHub y subirlo

### Método A: todo desde la terminal con gh

El comando que hace **todo de una** (crea el repo remoto + lo conecta + sube):

```bash
gh repo create laravel-todo --public --source=. --push
```

- `laravel-todo` → nombre del repo en GitHub (será parte de la URL:
  `https://github.com/TU-USUARIO/laravel-todo`).
- `--public` → visible para todos (con `--private` queda solo para vos).
- `--source=.` → "el repo local es esta carpeta en la que estoy parado".
- `--push` → subí los commits inmediatamente después de crearlo.

### Método B: crear el repo en la web + git push (el que usamos en esta PC)

Si `gh auth login` da problemas, este método funciona igual de bien:

1. En el navegador: **https://github.com/new**
   - Nombre: `laravel-todo`, visibilidad **Public**.
   - **NO** tildar "Add a README" ni agregar .gitignore/license (el repo debe
     quedar vacío para que el push inicial no genere conflictos).
   - Clic en **Create repository**.
2. En la terminal, conectar el repo local con el remoto y subir:

```bash
git remote add origin https://github.com/TU-USUARIO/laravel-todo.git
git push -u origin main
```

3. Al hacer push, **Git Credential Manager (GCM)** abre el navegador para que
   autorices a Git. Una vez autorizado, queda guardado y los próximos push no
   piden nada.

> **Problema conocido en esta PC**: el git que venía configurado usaba el
> helper `helper-selector`, que abre una ventanita gráfica para elegir cómo
> autenticar y a veces se queda colgado (el push parece trabado sin error).
> Solución que aplicamos, solo para este repo:
>
> ```bash
> git config --add credential.helper ""        # la cadena vacía resetea la lista de helpers
> git config --add credential.helper manager   # usa directamente GCM
> ```
>
> Si un `git push` queda colgado más de un minuto sin mostrar nada, revisá
> esto: `git config --get-all credential.helper`.

Listo. Abrí la URL de tu repo y vas a ver el código en GitHub.

## 6. El día a día: subir cambios futuros

Cada vez que modifiques el proyecto y quieras guardar + subir los cambios:

```bash
git add .
git commit -m "Descripción corta de qué cambiaste"
git push
```

Ese ciclo de 3 pasos es el 90% del uso diario de git. Recomendaciones:

- Hacé commits **chicos y frecuentes**, no uno gigante cada dos semanas.
- El mensaje debe explicar **qué/por qué** cambió:
  bien → `"Agrega filtro de tareas por fecha"`;
  mal → `"cambios"`.
- Antes de `git push`, un `git status` te muestra qué estás subiendo.

## 7. Comandos útiles para consultar

```bash
git status                    # qué archivos cambiaron desde el último commit
git log --oneline             # historial de commits (una línea por commit)
git diff                      # el detalle línea por línea de lo que cambiaste
gh repo view --web            # abre tu repo en el navegador
gh repo list                  # lista tus repos en GitHub
```

## 8. Cómo llevar el proyecto a otra máquina (replicación)

Si querés clonar tu proyecto en otra PC:

```bash
# 1. Clonar (descargar el repo con todo su historial)
git clone https://github.com/TU-USUARIO/laravel-todo.git
cd laravel-todo

# 2. Instalar dependencias de PHP
composer install

# 3. Crear la configuración local
copy .env.example .env
php artisan key:generate

# 4. Crear la base de datos SQLite vacía y sus tablas
type nul > database\database.sqlite      (en Windows)
php artisan migrate

# 5. Instalar dependencias y compilar el frontend
npm install
npm run build

# 6. Levantar la app
php artisan serve
```

Notá el paso 3: como `.env` **no está** en GitHub (por el `.gitignore`),
se recrea copiando `.env.example`. Por eso ese archivo de ejemplo SÍ se sube.

## 9. Solución de problemas frecuentes

| Problema | Causa / Solución |
|---|---|
| `gh: command not found` | No se instaló o la terminal no se reinició. Usá la ruta completa `"C:\Program Files\GitHub CLI\gh.exe"` o reinstalá. |
| `git push` pide usuario y contraseña | No hiciste `gh auth login` (paso 3) o no elegiste "autenticar Git". Repetilo. |
| `error: failed to push some refs` | Hay commits en GitHub que no tenés localmente. Solución: `git pull` primero, después `git push`. |
| Subí el `.env` por error | ¡Cambiá la APP_KEY y cualquier contraseña expuesta! Sacalo con `git rm --cached .env`, verificate que esté en `.gitignore` y volvé a commitear. |
| Quiero ver qué va a subir antes del commit | `git status` y `git diff` son tus amigos, siempre antes de `git add`. |

## 10. Resumen del flujo completo (para tener a mano)

```bash
# UNA SOLA VEZ:
winget install --id GitHub.cli -e          # instalar gh
gh auth login                              # conectarse a GitHub
cd C:\laragon\www\laravel-todo
git add . && git commit -m "inicial"       # primer commit
gh repo create laravel-todo --public --source=. --push   # crear y subir

# TODOS LOS DÍAS:
git add .
git commit -m "qué cambiaste hoy"
git push
```
