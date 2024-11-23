# Pricing-Api

Bienvenido al proyecto **Pricing-Api**.

## Autor
- 👤 **Carlos Alejandro Moreno**
- 🆔 **Legajo:** 47840
- 📧 **Correo:** carlitosmoreno12@hotmail.com
- 🔗 [LinkedIn](https://www.linkedin.com/in/carlos-alejandro-moreno/)

## Arquitectura

Para obtener más información sobre la arquitectura del proyecto, consulta el archivo [ARCHITECTURE.md](./ARCHITECTURE.md).

## Documentación API

Para ver la documentacion de la API, consulta el archivo [README-API.md](./README-API.md).

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Cómo ejecutar el proyecto

### Opción 1: Clonando el Repositorio

Podes ejecutar el proyecto clonando el proyecto o ejecutandolo en docker:

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/CharlyMoreno/pricing-api-microservicios
   cd pricing-api-microservicios
   ```

2. **Instala las dependencias:**

   Asegúrate de tener Node.js y npm instalados. Luego, ejecuta:

   ```bash
   npm install
   ```

3. **Ejecuta la aplicación:**

   Puedes iniciar la aplicación con el siguiente comando:

   ```bash
   npm start
   ```

   Asegúrate de que MongoDB esté corriendo en tu máquina o configurar la conexión a un servicio de MongoDB en la nube.

### Opción 2: Ejecutando en Modo Docker

Para ejecutar el proyecto en modo Docker, sigue estos pasos:

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/CharlyMoreno/pricing-api-microservicios
   cd pricing-api-microservicios
   ```

2. **Construye y ejecuta los contenedores:**

   Utiliza Docker Compose para iniciar la aplicación y la base de datos de MongoDB. En la raíz del proyecto, ejecuta el siguiente comando:

   ```bash
   docker compose up --build
   ```

   Esto construirá la imagen del contenedor y levantará los servicios definidos en el archivo `docker-compose.yml`.

3. **Accede a la API:**

   Una vez que los contenedores estén en ejecución, puedes acceder a la API en `http://localhost:3023`. Asegúrate de que el puerto 3023 no esté en uso por otra aplicación.

## Uso del Proyecto

Para utilizar el proyecto, puedes optar por cualquiera de las dos opciones anteriores. Una vez que la aplicación esté en ejecución, puedes interactuar con la API a través de las rutas definidas.