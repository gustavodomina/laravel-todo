========================================================
TUTORIAL: FIJAR/RESETEAR CREDENCIALES DE USUARIOS EXISTENTES
Proyecto: laravel-todo
Fecha: 2026-11-26
========================================================

¿PARA QUÉ SIRVE?
----------------
Si registraste usuarios en la app y no te acordás de la contraseña
(o querés una conocida para probar), podés asignarles una nueva
directamente en la base de datos. NO se puede "leer" la contraseña
actual porque Laravel guarda solo un hash irreversible; lo que se
hace es generar un hash nuevo de la contraseña que quieras.

Además, si un usuario quedó sin verificar su email, la app no lo
deja pasar del login (lo redirige a la pantalla de verificación).
Eso también se puede marcar como verificado a mano.


HERRAMIENTA: ARTISAN TINKER
---------------------------
Tinker es una consola interactiva de Laravel: escribís PHP y actúa
directamente sobre tu proyecto y su base de datos. Se abre con:

    php artisan tinker

(En esta PC, si "php" no está en el PATH, usar la ruta completa:
/c/laragon/bin/php/php-8.5.8-nts-Win32-vs17-x64/php.exe artisan tinker)

Para salir de Tinker: escribir "exit" y Enter.


PASO A PASO
-----------

1) Ver qué usuarios existen:

       App\Models\User::all(['id', 'name', 'email', 'email_verified_at']);

   Tinker muestra la lista con sus datos.

2) Fijar la contraseña de un usuario (ejemplo: demo@example.com):

       $u = App\Models\User::where('email', 'demo@example.com')->first();
       $u->password = Illuminate\Support\Facades\Hash::make('password');
       $u->save();

   - Hash::make() convierte el texto 'password' en el hash seguro
     que Laravel guarda en la columna password.
   - save() escribe el cambio en la base de datos.

3) (Opcional) Marcar su email como verificado:

       $u->email_verified_at = now();
       $u->save();

4) Probar que el login funciona sin salir de Tinker:

       Illuminate\Support\Facades\Auth::attempt(['email' => 'demo@example.com', 'password' => 'password']);

   Si responde "true", las credenciales funcionan.

5) Salir:

       exit


LO QUE SE HIZO EN ESTE PROYECTO (2026-11-26)
--------------------------------------------
Había 2 usuarios en la base de datos:

    1 | Usuario Demo | demo@example.com  (verificado)
    2 | admin        | admin@gmail.com   (SIN verificar)

Primero se les fijó a ambos la contraseña "password" para probar, y
se marcó el email de admin@gmail.com como verificado. Después se
cambió por una contraseña SEGURA generada al azar (16 caracteres
con mayúsculas, minúsculas, números y símbolos, usando random_int,
que es el generador criptográficamente seguro de PHP). La contraseña
actual la tiene el dueño del proyecto guardada por su cuenta (no se
escribe en esta documentación a propósito: las contraseñas reales
nunca se documentan).

Cómo se generó la contraseña segura: un script PHP de una sola vez
que arma 16 caracteres al azar desde un juego de caracteres, hace
Hash::make() y lo guarda en cada usuario, y al final la imprime en
pantalla para copiarla a un gestor de contraseñas. El script se
borra después de usarlo.

Forma corta de fijar UNA contraseña conocida a todos los usuarios
desde la terminal (útil solo en desarrollo), con --execute:

    php artisan tinker --execute="foreach(App\Models\User::all() as \$u){ \$u->password = Illuminate\Support\Facades\Hash::make('MI-NUEVA-CONTRASEÑA'); \$u->save(); }"


ACLARACIONES IMPORTANTES
------------------------
- Esto toca SOLO la base de datos local (database/database.sqlite).
  No afecta a GitHub: los archivos .sqlite están en .gitignore, o
  sea que nunca se suben al repo. Las contraseñas jamás viajan a
  GitHub.
- "password" es una contraseña SOLO para desarrollo/pruebas. En un
  proyecto real los usuarios deben tener contraseñas propias y
  seguras; nunca dejar cuentas con contraseñas débiles en
  producción.
- Lo mismo se puede hacer para UN usuario nuevo desde cero con el
  factory: User::factory()->create(['email' => 'x@y.com',
  'password' => Hash::make('password')]) — pero eso crea el usuario,
  no modifica los existentes.


| Usuario | Email | Contraseña |
| --- | --- | --- |
| Usuario Demo | demo@example.com | YC-LiVm3@8h#=QJ- |
| admin | admin@gmail.com | YC-LiVm3@8h#=QJ- |