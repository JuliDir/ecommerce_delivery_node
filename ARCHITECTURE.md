# Pricing-Api

## Descripción

El microservicio de **Pricing** gestiona los precios de un catálogo, genera políticas de descuentos, maneja precios especiales, cupones y descuentos, y permite consultar precios para el proceso de compras. También notifica cambios de precios de forma asíncrona a otros servicios, como **Stats**.

## Casos de Uso

#### 1. **Mantenimiento de Cupones**
- **Actor:** Usuario.
- **Descripción:** Permite a los administradores crear, actualizar y consultar cupones en el sistema.
  - **Validaciones:**
    1. **Creación de cupones:**
       - Verificación de la existencia de un cupón con el mismo código. Si ya existe, se lanza un error con el mensaje "Coupon already exists with this code.".
       - Validación de los campos `discount_type` y `discount_value` para asegurar que el tipo de descuento y el valor del descuento sean correctos.
    2. **Actualización de cupones:**
       - Verificación de que el cupón a actualizar exista en el sistema. Si no se encuentra, se lanza un error con el mensaje "Coupon not found".
    3. **Consulta de cupones:**
       - Recupera todos los cupones existentes sin validaciones adicionales.

#### 2. **Aplicación de Cupones en la Compra**
- **Actor:** Usuario.
- **Descripción:** Permite a los clientes aplicar un cupón a una compra y calcular el precio total con el descuento aplicado.
  - **Validaciones:**
    1. **Verificación de validez del cupón:**
       - El sistema valida que el cupón esté activo y dentro del rango de fechas permitido. Si no es válido, se lanza un error con el mensaje "Invalid or inactive coupon or outside the date range".
    2. **Verificación de productos aplicables:**
       - Se verifica que los productos seleccionados sean válidos para el cupón. Si uno o más productos no son aplicables, se lanza un error con el mensaje "Coupon is not valid for one or more selected products".
    3. **Verificación de monto mínimo de compra:**
       - Se valida que el total de la compra con descuento sea igual o superior al monto mínimo especificado en el cupón. Si no lo es, se lanza un error con el mensaje "Total purchase amount is below the minimum required".
    4. **Verificación de límite de uso del cupón:**
       - Se verifica si el cupón ha alcanzado su límite de usos. Si el límite ha sido alcanzado, se lanza un error con el mensaje "Coupon usage limit exceeded".
    5. **Cálculo del descuento:**
       - Según el tipo de descuento (`PERCENTAGE` o `FIXED`), se calcula el descuento aplicable y se devuelve el total con el descuento.

#### 3. **Mantenimiento de Descuentos**
- **Actor:** Usuario.
- **Descripción:** Permite a los administradores crear, actualizar y consultar descuentos que se aplican a productos o categorías específicas.
  - **Validaciones:**
    1. **Creación de descuentos:**
       - El sistema permite la creación de descuentos sin validaciones adicionales específicas en este proceso.
    2. **Actualización de descuentos:**
       - Verificación de la existencia del descuento a actualizar. Si no se encuentra, se lanza un error con el mensaje "Discount not found".
    3. **Aplicación de descuento:**
       - Según el tipo de descuento (`PERCENTAGE` o `FIXED`), se calcula el descuento aplicable al precio. Si el descuento es un porcentaje, se aplica un porcentaje del precio; si es fijo, se resta una cantidad fija.

#### 4. **Aplicación de Descuentos a Productos**
- **Actor:** Usuario.
- **Descripción:** Permite aplicar descuentos a productos cuando se consultan sus precios. El precio final incluye descuentos activados para ese artículo.
  - **Validaciones:**
    1. **Verificación de descuentos activos:**
       - Se consulta si hay descuentos activos para el artículo. Si no se encuentran descuentos, el precio se mantiene sin cambios.
    2. **Cálculo de precio con descuento:**
       - Los descuentos se aplican acumulativamente. El precio final con descuento no puede ser negativo, por lo que se asegura que el precio nunca baje de 0.
    3. **Devolver precio con descuentos:**
       - El precio final con descuento y la lista de descuentos aplicados son devueltos al cliente.

#### 5. **Mantenimiento de Precios de Productos**
- **Actor:** Usuario.
- **Descripción:** Permite la creación y actualización de precios para productos en el catálogo. También se valida la fecha de vigencia del precio.
  - **Validaciones:**
    1. **Fecha de validez del precio:**
       - Se valida que el precio esté dentro del rango de fechas permitido (utilizando `start_date` y `end_date`). Si el precio no está dentro del rango, se lanza un error con el mensaje "The current date is not within the allowed range".
    2. **Verificación de precios existentes:**
       - Si ya existe un precio para el artículo, se marca el precio anterior como expirado (actualizando su `end_date`).
    3. **Verificación de precio válido:**
       - Se valida que el valor del precio no sea nulo. Si no se especifica un precio, se lanza un error con el mensaje "Price is required".
    4. **Notificación de cambios en el precio:**
       - Cuando un nuevo precio es creado, se envía una notificación a través de RabbitMQ para actualizar otros sistemas relacionados.

#### 6. **Consulta de Precios de Productos**
- **Actor:** Cliente.
- **Descripción:** Permite a los clientes consultar el precio de un artículo y obtener el precio con descuentos aplicados.
  - **Validaciones:**
    1. **Verificación de existencia del producto:**
       - Si no se encuentra el producto, se lanza un error con el mensaje "Product not found".
    2. **Aplicación de descuentos:**
       - Se consulta si hay descuentos activos para el artículo y se aplica el descuento correspondiente para calcular el precio final con descuento.
    3. **Devolución de precios:**
       - El precio con descuento y los descuentos aplicados son devueltos al cliente.

#### 7. **Notificación de Cambios de Precios**
- **Actor:** Sistema de estadísticas o sistemas externos.
- **Descripción:** Notificar a otros sistemas sobre los cambios de precios para su análisis y uso en reportes.
  - **Validaciones:**
    1. **Notificación de actualización de precios:**
       - Cada vez que se crea o actualiza un precio, el sistema debe enviar un mensaje asíncrono (usando RabbitMQ) para informar a otros sistemas sobre el cambio de precio.

## Modelo de Datos

1. **Discount**
   - `id`: string - Identificador único del descuento
   - `name`: string - Nombre del descuento
   - `type`: string - Tipo de descuento (`porcentaje`, `fijo`, etc.)
   - `value`: number - Valor numérico del descuento
   - `start_date`: date - Fecha de inicio de validez del descuento
   - `end_date`: date - Fecha de fin de validez del descuento
   - `article_ids`: array of strings - Lista de IDs de productos a los que se aplica el descuento

2. **Price**
   - `id`: string - Identificador único del precio
   - `article_id`: string - ID del producto asociado a este precio
   - `price`: number - Precio del producto en el período especificado
   - `start_date`: date - Fecha de inicio de este precio
   - `end_date`: date - Fecha de fin de este precio

3. **CouponUsage**
   - `id`: string - Identificador único del uso del cupón
   - `code`: string - Código del cupón utilizado
   - `createdAt`: string - Fecha y Hora de uso del cupón.

4. **Coupon**
   - `id`: string - Identificador único del cupón
   - `code`: string - Código del cupón que se aplica para obtener el descuento
   - `discount_type`: string - Tipo de descuento (`porcentaje`, `fijo`, etc.)
   - `discount_value`: number - Valor del descuento (opcional, para tipos de descuento con valor específico)
   - `applicable_products`: array of strings - IDs de los productos a los que aplica el cupón (opcional)
   - `minimum_purchase`: number - Monto mínimo de compra para poder usar el cupón (opcional)
   - `uses_limit`: number - Número máximo de veces que se puede usar el cupón
   - `start_date`: date - Fecha de inicio de validez del cupón
   - `end_date`: date - Fecha de fin de validez del cupón


### Explicación de Cupones
- **Cupón por Compra Mínima:** Configurar minimum_purchase para aplicar el cupón solo en compras superiores a cierto monto.
- **Aplicación en Productos :** Usar applicable_products para limitar el cupón a ciertos productos.
- **Límite de Usos:** Con uses_limit, el cupón solo se podrá utilizar un número determinado de veces (útil para promociones limitadas).
- **Descuento Variable:** Personalizar discount_type y discount_value permite aplicar descuentos específicos sin depender de un descuento fijo.

## Documentación de la API

Para ver la documentacion de la API, consulta el archivo [README-API.md](./README-API.md).

## Interfaz RabbitMQ para Notificaciones de Precios

Este servicio se suscribe a un canal de RabbitMQ para notificar de forma asíncrona los cambios en los precios, como nuevas asignaciones o actualizaciones de precios, a servicios externos como **Stats**.

- **Cola RabbitMQ**: `price_notification_queue`

#### Mensaje de Notificación
```json
{
  "_id": "67366854ec21ade4efab8202",
  "article_id": "2",
  "price": 9890,
  "start_date": "2024-11-10T21:07:49.125Z",
  "end_date": "2024-11-16T21:07:49.125Z",
  "createdAt": "2024-11-14T21:15:00.294Z",
  "updatedAt": "2024-11-14T21:15:00.294Z"
}
```

#### Descripción:
- **`_id`**: Identificador único del documento en la base de datos, generado automáticamente.
- **`article_id`**: Identificador del artículo o producto al que corresponde este registro.
- **`price`**: El precio del artículo, expresado en la unidad monetaria correspondiente.
- **`start_date`**: Fecha y hora en que el precio del artículo comienza a ser válido, en formato ISO 8601.
- **`end_date`**: Fecha y hora en que el precio del artículo deja de ser válido, en formato ISO 8601.
- **`createdAt`**: Fecha y hora en que el registro fue creado, en formato ISO 8601.
- **`updatedAt`**: Fecha y hora en que el registro fue actualizado por última vez, en formato ISO 8601.

#### Flujo del Mensaje:
1. Cuando se crea o modifica un precio, se envía una notificación a la cola de RabbitMQ.
2. Los servicios interesados, como **Stats**, consumen esta información para actualizar sus métricas o informes.