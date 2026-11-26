========================================================
TUTORIAL: GIT Y GITHUB DESDE LA TERMINAL DE VSCODIUM
Proyecto ejemplo: laravel-todo (C:\laragon\www\laravel-todo)
Repo: https://github.com/gustavodomina/laravel-todo
Fecha: 2026-11-26
========================================================

Este tutorial está pensado para que lo hagas VOS, paso a paso, desde
la terminal integrada de VSCodium. Nadie más tiene que ejecutar estos
comandos por vos.

ÍNDICE
  0. Abrir el proyecto y la terminal en VSCodium
  1. Preparativos por única vez (verificación)
  2. Publicar un proyecto por primera vez
  3. Actualizaciones del día a día (add / commit / push)
  4. Práctica real: subir los tests que faltan
  5. Comandos útiles para mirar el estado del repo
  6. Problemas típicos y soluciones


--------------------------------------------------------
0. ABRIR EL PROYECTO Y LA TERMINAL EN VSCODIUM
--------------------------------------------------------

1) Abrí VSCodium.
2) Menú File > Open Folder... (Archivo > Abrir carpeta) y elegí:

       C:\laragon\www\laravel-todo

   Importante: abrí la CARPETA del proyecto, no un archivo suelto.
   Así la terminal que abras adentro ya va a estar parada en el
   lugar correcto.

3) Abrí la terminal integrada:
   - Atajo: Ctrl + Ñ (o Ctrl + ` en teclado en inglés, la tecla del
     acento grave, arriba de Tab).
   - O por menú: Terminal > New Terminal.

   Abajo aparece un panel con una línea parecida a:

       PS C:\laragon\www\laravel-todo>

   Eso significa que estás en la terminal y en la carpeta correcta.
   Todo lo que sigue se escribe ahí, un comando por vez, apretando
   Enter después de cada uno.

4) Comprobá que git funciona:

       git --version

   Debería responder algo como "git version 2.52.0.windows.1".


--------------------------------------------------------
1. PREPARATIVOS POR ÚNICA VEZ (VERIFICACIÓN)
--------------------------------------------------------

Git necesita saber quién sos para firmar los commits. Esto ya quedó
configurado en esta PC, pero conviene verificarlo:

       git config --global user.name
       git config --global user.email

Deberían responder:

       gustavodomina
       gustavodomina@users.noreply.github.com

Si alguna vez (en otra PC, o si cambiás de usuario de GitHub)
responden vacío, se configura así:

       git config --global user.name "TU-NOMBRE"
       git config --global user.email "TU-EMAIL"

Nota: el email "users.noreply.github.com" es especial: GitHub te lo
da para que tus commits se asocien a tu cuenta SIN exponer tu email
real. Se consigue en GitHub > Settings > Emails.


--------------------------------------------------------
2. PUBLICAR UN PROYECTO POR PRIMERA VEZ
--------------------------------------------------------

OJO: laravel-todo YA está publicado. Esta sección es para que
entiendas cómo se hizo y para que la uses en tu PRÓXIMO proyecto.

El método es "crear el repo vacío en la web de GitHub y empujar
desde la terminal". Son 6 pasos:

PASO 1 - Crear el repo vacío en GitHub (en el navegador)
   - Entrá a https://github.com y hacé clic en el botón "+"
     (arriba a la derecha) > "New repository".
   - Repository name: por ejemplo "mi-nuevo-proyecto".
   - Elegí Public o Private.
   - MUY IMPORTANTE: NO tildes "Add a README", NI ".gitignore",
     NI "license". El repo tiene que nacer totalmente vacío, si no
     después git pelea porque hay dos historias distintas.
   - Clic en "Create repository".
   - GitHub te muestra una página con la URL del repo, algo como:

         https://github.com/gustavodomina/mi-nuevo-proyecto.git

     Copiala, la vas a pegar en el paso 5.

PASO 2 - Inicializar git en la carpeta del proyecto (terminal)

       cd C:\laragon\www\mi-nuevo-proyecto
       git init

   Esto crea la carpeta oculta .git, que es donde git guarda todo el
   historial. Respuesta esperada: "Initialized empty Git repository".

PASO 3 - Preparar y hacer el primer commit

       git add .
       git commit -m "Commit inicial"

   - "git add ." agrega TODOS los archivos al área de preparación
     (staging). El punto significa "todo lo de esta carpeta".
   - "git commit" guarda esa foto en el historial. El texto entre
     comillas es el mensaje: siempre en presente y describiendo el
     cambio ("Agrega tests del CRUD", no "tests").

PASO 4 - Renombrar la rama principal a "main"

       git branch -M main

   Git a veces crea la rama inicial como "master"; GitHub usa
   "main". Este comando la renombra para que coincidan.

PASO 5 - Conectar el proyecto con el repo de GitHub

       git remote add origin https://github.com/gustavodomina/mi-nuevo-proyecto.git

   "origin" es simplemente el apodo del repo remoto. Con este
   comando git sabe a dónde tiene que empujar.

PASO 6 - Subir todo (push)

       git push -u origin main

   - "-u" vincula tu rama main local con la del remoto, para que de
     ahora en más alcance con escribir "git push" solito.
   - La primera vez, Windows abre una ventanita del "Git Credential
     Manager" (GCM) pidiendo autorización: elegí "Browser" /
     "Sign in with your browser", iniciá sesión en GitHub y aceptá.
     Las credenciales quedan guardadas: no te lo vuelve a pedir.
   - Si en vez de eso aparece una ventana "Credential Helper
     Selector": elegí "manager" y tildá la casilla "Always use this
     from now on". (Este fue exactamente el problema que tuvimos con
     laravel-todo.)

Al terminar, refrescá la página del repo en el navegador y deberías
ver todos tus archivos subidos.


--------------------------------------------------------
3. ACTUALIZACIONES DEL DÍA A DÍA (ADD / COMMIT / PUSH)
--------------------------------------------------------

Una vez que el repo ya existe, el flujo de trabajo diario es SIEMPRE
el mismo, de 3 pasos (por eso se le dice "los 3 comandos"):

       git add .
       git commit -m "mensaje que describa el cambio"
       git push

Ejemplo de rutina real:
1. Programás un rato en VSCodium (cambiás archivos, creás otros).
2. Mirás qué cambió con "git status" (ver sección 5).
3. Cuando el cambio está terminado y probado: add, commit, push.

Consejo: commits chicos y frecuentes. Un commit por "cosa terminada"
(una feature, un arreglo, los tests). No juntes 3 días de cambios en
un solo commit gigante.

Ejemplos de buenos mensajes de commit:
   - "Agrega tests de PHPUnit para el CRUD de tareas"
   - "Corrige la fecha que se mostraba un día antes"
   - "Agrega tutorial de tests en documentacion"


--------------------------------------------------------
4. PRÁCTICA REAL: SUBIR LOS TESTS QUE FALTAN
--------------------------------------------------------

AHORA MISMO el repo laravel-todo tiene cambios sin subir: los tests
que acabamos de escribir y los tutoriales nuevos. Es la oportunidad
perfecta para practicar el flujo del día a día con cambios reales.

Abrí la terminal en VSCodium (proyecto laravel-todo) y seguí:

PASO 1 - Ver qué cambió:

       git status

   Deberías ver en rojo (sin preparar), más o menos:

       Changes not staged for commit:
           ...
       Untracked files:
           tests/Unit/TaskTest.php
           tests/Feature/TaskTest.php
           documentacion/tutorial-tests.txt
           documentacion/tutorial-git-terminal.txt

   "Untracked" = archivo nuevo que git todavía no sigue.
   "Not staged" = archivo conocido que tiene cambios sin preparar.

PASO 2 - Preparar todo:

       git add .

PASO 3 - Verificar qué quedó preparado (opcional pero recomendable):

       git status

   Ahora los mismos archivos deberían aparecer en verde bajo
   "Changes to be committed".

PASO 4 - Hacer el commit:

       git commit -m "Agrega tests PHPUnit del CRUD y tutoriales"

   Respuesta esperada: algo como "[main abc1234] Agrega tests..."
   con el resumen de archivos y líneas agregadas.

PASO 5 - Subir a GitHub:

       git push

   Como ya hicimos "push -u" la primera vez, ahora alcanza con
   "git push" a secas. No debería pedir credenciales (ya quedaron
   guardadas en GCM).

PASO 6 - Comprobar:
   - En la terminal: "git status" debe decir "nothing to commit,
     working tree clean" y "Your branch is up to date with
     'origin/main'".
   - En el navegador: entrá a
     https://github.com/gustavodomina/laravel-todo
     y verificá que aparezcan las carpetas tests/ (con los TaskTest)
     y documentacion/ con los archivos nuevos.

Si llegaste hasta acá con los 6 pasos, ya dominás el ciclo completo.


--------------------------------------------------------
5. COMANDOS ÚTILES PARA MIRAR EL ESTADO DEL REPO
--------------------------------------------------------

Estos comandos NO modifican nada, solo muestran información.
Usalos sin miedo:

   git status
       Qué archivos cambiaron, cuáles están preparados y cuáles no.

   git log --oneline
       El historial de commits, uno por línea (hash + mensaje).
       Para salir: tecla Q.

   git diff
       Muestra línea por línea qué cambió en los archivos
       todavía NO preparados. Para salir: Q.

   git diff --staged
       Igual, pero para lo que YA preparaste con git add
       (útil justo antes de commitear).

   git remote -v
       Muestra la URL del repo remoto (origin).

   git branch
       Lista las ramas locales; la que tiene * es la actual.


--------------------------------------------------------
6. PROBLEMAS TÍPICOS Y SOLUCIONES
--------------------------------------------------------

PROBLEMA: "git push" se queda colgado y no pasa nada.
  CAUSA: la ventana del "Credential Helper Selector" está abierta
  en algún lugar de la pantalla esperando un clic.
  SOLUCIÓN: buscá la ventanita (a veces aparece detrás de VSCodium),
  elegí "manager" y tildá "Always use this from now on". En
  laravel-todo ya quedó arreglado de forma local para este repo.

PROBLEMA: git push responde "! [rejected] ... (fetch first)".
  CAUSA: en GitHub hay commits que no tenés en tu PC (por ejemplo,
  editaste algo por la web).
  SOLUCIÓN: primero traer los cambios remotos y después volver a
  subir:

      git pull
      git push

PROBLEMA: "Please tell me who you are" al hacer commit.
  CAUSA: falta la identidad de git.
  SOLUCIÓN: ejecutar los dos git config --global de la sección 1.

PROBLEMA: "fatal: not a git repository".
  CAUSA: la terminal no está parada en la carpeta del proyecto (o el
  proyecto todavía no tiene git inicializado).
  SOLUCIÓN: verificar que la línea de la terminal diga
  "C:\laragon\www\laravel-todo" y, si hace falta, "cd" hasta ahí o
  ejecutar "git init" (sección 2, paso 2).

PROBLEMA: commiteé algo que no quería (por ejemplo una carpeta
  personal del editor).
  SOLUCIÓN PREVENTIVA: para eso existe el archivo .gitignore, en la
  raíz del proyecto. Todo lo que esté listado ahí, git lo ignora.
  En laravel-todo ya ignora, entre otras cosas, *.code-workspace.
  Si te equivocaste y preparaste algo de más ANTES del commit, se
  puede sacar del staging con:

      git restore --staged nombre-del-archivo


--------------------------------------------------------
RESUMEN DE BOLSILLO
--------------------------------------------------------

  Primera vez (proyecto nuevo):
      crear repo vacío en la web
      git init
      git add .
      git commit -m "Commit inicial"
      git branch -M main
      git remote add origin URL-DEL-REPO
      git push -u origin main

  Todos los días:
      git status          (mirar qué cambié)
      git add .           (preparar)
      git commit -m "..." (guardar la foto)
      git push            (subir a GitHub)
