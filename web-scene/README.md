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
