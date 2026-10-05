# Same, Bestie — web 3D

Experiencia Three.js/WebGL: cuarto voxel, luz cálida, bokeh, bloom, film grain, lectura, paso de página, juego con lápiz, escritura y pomodoro con pausas y rondas. Toda la escena se dibuja en el navegador. El proyecto Expo en la raíz se conserva como código previo; GitHub Pages publica este directorio.

## Desarrollo

```sh
npm ci
npm run dev
npm test
npm run build
```

La compilación usa `/samebestie/` como base para GitHub Pages. El desarrollo local usa `/`. El modelo comprimido y el decodificador Meshopt se sirven desde el mismo sitio, sin Blender ni CDN durante el uso.

Estudio: 5–120 minutos, pausas: 5–60, en pasos de 5; 1–12 rondas. Los controles viven en la barra inferior. La sesión conserva su estado local al recargar y recupera el tiempo transcurrido si la pestaña se suspende. Bao permanece oculto en esta cámara de focus y Chatito alterna lectura, paso de página, juego con el lápiz y escritura. Las aletas siguen el punto de contacto de cada objeto; el lápiz deja pequeños trazos sobre el cuaderno. Pausar la sesión o el movimiento detiene la secuencia, y reiniciar devuelve los objetos al escritorio.

El GLB es una exportación optimizada del modelo Blender. Las fuentes de modelado se conservan en el workspace de diseño, fuera de este proyecto web. El motor corre como una primera implementación visual: faltan las seis actuaciones emocionales completas, integración de los flujos anteriores, cuentas, sincronización y extensiones. Safari físico aún no está validado. No se garantiza el mismo rendimiento en todos los dispositivos.

## Reexportar el modelo

Desde este directorio, con Blender y el archivo fuente local:

```sh
blender --background --factory-startup --python scripts/export_scene.py -- /ruta/chatito-study-desk.blend
node scripts/optimize.mjs
npm test
```

La exportación añade una superficie continua detrás de los vóxeles biselados de Chatito, conservando sus colores y piezas animables. Evita los túneles que dejaban ver el fondo entre cubitos, especialmente en el plano central de la cámara frontal. `raycast-seam.mjs` comprueba el GLB comprimido en posturas frontal, respirando y leyendo. No se aplica SSAO sobre la escena: las sombras reales del cuarto permanecen, pero la calidad alta no agrega manchas sobre la cara.

En Ambiente → Probar acciones se puede previsualizar leer, pasar página, jugar con el lápiz, escribir y tomar awita sin modificar el reloj. «Volver al pomodoro» restaura la secuencia automática. Cada descanso y el final de la sesión activan una toma de agua y un recordatorio breve.

### Relojes y avisos

En **Ambiente → Relojes del mundo** se pueden apilar hasta tres ciudades, cambiar su zona y quitar relojes. El primer reloj toma la zona del equipo; Lima y Berkeley están entre las primeras opciones. `Intl.DateTimeFormat` usa zonas IANA (Berkeley: `America/Los_Angeles`), fecha local y horario de verano. La selección se conserva en este navegador, sin geolocalización ni cuenta.

En **Ambiente → Alarmas y avisos**, el sonido se prepara al pulsar Empezar/Continuar o Probar alarma. Hay un aviso en pantalla en cada cambio de turno y al completar las rondas. Los avisos del sistema requieren activación y permiso del navegador; el botón Probar alarma permite comprobarlos sin avanzar el pomodoro. El service worker sirve para mostrar/abrir notificaciones, sin caché offline ni programación push. La página debe seguir abierta: el cierre, suspensión del equipo y limitaciones de pestañas en segundo plano pueden retrasar o impedir la entrega. Al volver de una suspensión se muestra solo el turno actual; no una ráfaga de avisos vencidos. Al recargar no se reproducen alarmas antiguas.

La luz del fondo ahora admite 0–2 y la luz cálida 0–3. Se conservan los valores guardados y el render anterior; la diferencia de desenfoque de la referencia era una elección de ajustes, no un fallo de GPU confirmado.

Verificación: pruebas del límite de tres relojes, zonas inválidas, cambio de día, inicio/fin del horario de verano de Berkeley, y alarmas en estudio/pausa/fin, pausa manual, reinicio y recuperación de rondas omitidas.

### Luz frontal, temperatura y viñeteado

**Luz del frente** (antes Luz cálida) regula juntas la luz principal, la lámpara, el relleno y la luz ambiental que iluminan al personaje y la mesa. También atenúa la emisión visible de la lámpara; las luces decorativas del fondo conservan su brillo. La **Temperatura de luz** ofrece una gradación artística cálida/neutra/fría de 1800–9000 K, con 3200 K como aspecto original. Cambia el color de las luces y de la emisión de la lámpara, sin modificar el valor de intensidad. **Viñeteado** va de 0 (desactivado) a 0.9, con bordes suaves y centro despejado; se aplica a la escena, no a la interfaz. Los nuevos ajustes se guardan junto al ambiente existente sin borrar sus preferencias anteriores.

### Composición de bokeh en dos capas

La escena se divide al cargar en fondo y primer plano. El GLB agrupa los elementos estáticos en Room/Room_Glow: `scene-layers.js` separa sus triángulos por la zona del escritorio en coordenadas del mundo, conservando los atributos originales. Chatito, la página y los objetos de las animaciones se asignan explícitamente al primer plano.

Orden: render del fondo sin elementos frontales → bokeh y luminosidad del fondo → render del primer plano con profundidad limpia → bloom → color, antialias, grano y viñeta. El desenfoque nunca recibe píxeles ni mipmaps de la lámpara o del personaje; ya no depende de rechazar sus bordes mediante un mapa de profundidad. Las sombras se actualizan con las dos capas presentes antes de los renders parciales. El rango de bokeh y las preferencias guardadas se conservan.

Prueba sobre el GLB publicado: 12 rayos de lámpara/escritorio solo encuentran esas superficies en el primer plano; se conservan los 1,542,362 triángulos. Las cinco acciones mantienen al personaje y sus objetos fuera del fondo. Verificación visual con bokeh al máximo.

### Reloj de arena vinculado al pomodoro

El reloj estático se reemplaza por uno voxel articulado en la misma posición, apoyado en la alfombrilla. La cantidad de arena de cada cámara representa el tiempo restante del turno (estudio o pausa), conservando el volumen total. Se calcula desde la fecha de fin del pomodoro; no es un bucle independiente. Al pausar se detienen el giro y el chorro, y el avance se recupera al recargar.

Al Empezar, al cambiar de turno y **cada vez que se pulsa Continuar**, Chatito alcanza el reloj, lo levanta, gira 180° y lo apoya antes de retomar su actividad. Continuar conserva los minutos restantes: reinicia únicamente el gesto. La activación y el tiempo del gesto se guardan con la sesión. Con movimiento desactivado la arena sigue indicando el tiempo y se omite el gesto. **Probar acciones → Voltear reloj** permite repetir la animación sin tocar el timer; la arena de esa vista previa avanza acelerada para inspeccionarla.

Pruebas: mitad de turno de estudio/pausa, orientaciones alternadas, conservación de arena, pausa, reset, continuación sin reinicio, recarga a mitad de sesión y eliminación de las 184 caras triangulares del reloj antiguo. En navegador se comprobó Pausar a 24:53 → Continuar → nuevo giro con 24:51, sin volver a 25:00.

### Sonidos por momento

Ambiente → Alarmas y avisos permite elegir por separado el sonido de **Inicio / retomar**, **Pausa** y **Fin de las rondas**. Hay siete opciones: el ascendente original (Do–Mi–Sol), su reverso exacto (Sol–Mi–Do), Campanitas, Gotas, Teclas suaves, Abrazo y Estrellitas. Los botones de escucha previsualizan sin modificar el timer ni enviar notificaciones, incluso si el sonido automático está desactivado. Las selecciones se guardan conservando los permisos y preferencias existentes.

Inicio suena al Empezar/Continuar estudio y al volver automáticamente del descanso; Pausa al entrar/retomar descanso; Fin solo al completar todas las rondas. Pausar manualmente, reiniciar o recargar no produce una nueva alarma. Se mantiene la supresión de avisos duplicados al recuperar una pestaña suspendida. Web Audio sintetiza los sonidos localmente, sin descargas de audio. Las pruebas cubren las siete melodías, inversión exacta, selección persistente, enrutamiento por fase, silencio y preview.

### English product voice

The live web UI is English, including loading/error states, timer phases, notifications, animation previews, sound names, clock editors, English weekday/month formatting and accessibility labels. Clock time zones, 24-hour display, saved settings and sound IDs are preserved.

Copy follows the project marketing brief: Chatito speaks as a teammate in “we,” with light lowercase internet language, no guilt and no hustle framing. Examples: “hi bestie. tiny start together?”, “lowkey, we’ve got this. one thing at a time.” and “wait, we actually did that. water break?” Utility controls and permission errors remain literal and easy to understand.
