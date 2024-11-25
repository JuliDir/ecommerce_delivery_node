## Microservicio de Delivery

### Casos de uso

#### CU: Actualizar proyección de un Delivery
- **Precondición**: El Delivery debe existir
- **Camino normal**:
  - Se busca el Delivery y el tracking asociado a la misma (historico de estados)
  - Se busca el tracking donde su atributo timestamp sea mayor al atributo updatedAt de el Delivery, es decir, el último estado.
  - Se actualiza la proyección de el Delivery actualizando: 
    - status: status del tracking encontrado
    - updatedAt: fecha actual
- **Caminos alternativos**:
  - Si no existe el Delivery entonces se responde con un error.

#### CU: Iniciar entrega
- **Precondición**: La orden está validada (estado `VALIDATED` en Orders).
- **Camino normal**:
  - Orders envía un mensaje ásincrono con el id de la orden y la dirección de envío a Delivery.
  - Delivery busca la orden por su orderId en el microservicio orders
  - Se crea un objeto `Delivery` con: 
    - id: generado
    - orderId: id proveniente del mensaje de Orders
    - shippingAdress: direccion de envío proveniente del mensaje de Orders
    - trackingNumber: generado de la siguiente forma `TN-` + `orderId` (TN-5542)
    - createdAt: fecha actual
  - Se crea un objeto `Tracking` con: 
    - id: generado
    - deliveryId: id del delivery recién creado
    - carrierId: nulo ya que todavía no se asigna un carrier al Delivery 
    - status: `IN_PREPARATION`
    - location: { "latitude": -32.889458, "longitude": -68.845838 } (ubicación inicial: Mendoza)
    - timestamp: fecha actual
  - Se llama al CU `Actualizar proyección de un Delivery`, pasandole el delivery recien creado
- **Caminos alternativos**:
  - Si no existe la orden se responde con un error
  - Si no se envía una dirección de envío se responde con un error
  - Si no se puede crear la entrega se responde con un error


#### CU: Actualización de tracking de una entrega
- **Precondición**: El Delivery se encuentra en estado `IN_PREPARATION`, `IN_TRANSIT`, `NEAR_DESTIN`.
- **Camino normal**:
  - Se busca el Delivery y el Tracking asociado a la misma (historico de estados) 
  - Se busca el ultimo Tracking para validar el estado del delivery
  - Se permite almacenar múltiples estados `IN_TRANSIT` con actualizaciones de `location` para reflejar movimientos.
  - Se crea un nuevo objeto `Tracking` con: 
    - id: generado
    - deliveryId: ID del Delivery
    - carrierId: ID del usuario activo
    - status: nuevo estado (`IN_TRANSIT`, `NEAR_DESTIN`, etc.)
    - location: { "latitude": valor, "longitude": valor }
    - timestamp: fecha actual
  - Se llama al CU `Actualizar proyección de un Delivery`, pasandole el Delivery recien buscado
- **Caminos alternativos**:
  - Si no se encuentra el Delivery se responderá con un error
  - Si el status que se envía en la request no existe o es nulo, se responderá con un error
  - Si location es nulo en la request se responderá con un error
  - Si se envía un status `IN_TRANSIT` y el último Tracking del delivery no se encuentra en estado `IN_PREPARATION` o `IN_TRANSIT` se responderá con un error.
  - Si se envía un status `NEAR_DESTIN` y el último Tracking del delivery no se encuentra en estado `IN_TRANSIT` se responderá con un error.

#### CU: Completar entrega
- **Precondición**: El Delivery se encuentra en estado `NEAR_DESTIN`.
- **Camino normal**:
  - Se busca el Delivery y el Tracking asociado a la misma (historico de estados) 
  - Se busca el ultimo Tracking para validar el estado del delivery
  - Se crea un nuevo objeto `Tracking` con: 
    - id: generado
    - deliveryId: ID del Delivery
    - carrierId: ID del usuario activo
    - status: `COMPLETED`
    - location: { "latitude": <valor>, "longitude": <valor> } (ubicación de la entrega real)
    - timestamp: fecha actual
  - Se llama al CU `Actualizar proyección de un Delivery`, pasandole el Delivery recien buscado
  - Delivery envía un mensaje a Orders indicandole que cambie el estado de la orden a `COMPLETED` 
  - Orders actualiza el estado de la orden a `COMPLETED`
- **Caminos alternativos**:
  - Si no se encuentra el Delivery se responderá con un error.
  - Si el último Tracking del delivery no se encuentra en estado `NEAR_DESTIN` se responderá con un error.

#### CU: Entrega fallida
- **Precondición**: El Delivery se encuentra en estado `NEAR_DESTIN`.
- **Camino normal**:
  - Se busca el Delivery y el Tracking asociado a la misma (historico de estados) 
  - Se busca el ultimo Tracking para validar el estado del delivery
  - Se crea un nuevo objeto `Tracking` con: 
    - id: generado
    - deliveryId: ID del Delivery
    - carrierId: ID del usuario activo
    - status: `FAILED`
    - location: { "latitude": <valor>, "longitude": <valor> } (ubicación donde falló la entrega)
    - timestamp: fecha actual
  - Se llama al CU `Actualizar proyección de un Delivery`, pasandole el Delivery recien buscado
  - Delivery envía un mensaje a Orders indicandole que cambie el estado de la orden a `FAILED` 
  - Orders actualiza el estado de la orden a `FAILED`
- **Caminos alternativos**:
  - Si no se encuentra el Delivery se responderá con un error.
  - Si el último Tracking del delivery no se encuentra en estado `NEAR_DESTIN` se responderá con un error.

#### CU: Consultar Delivery
- **Precondición**: El Delivery debe existir.
- **Camino normal**:
  - Se busca el Delivery por deliveryId o trackingNumber
  - Se llama al CU `Actualizar proyección de un Delivery`, pasandole el Delivery recien buscado
  - Se retorna la proyección del Delivery
- **Caminos alternativos**:
  - Si el Delivery no existe se responderá con un error.

#### CU: Consultar Tracking de un delivery
- **Precondición**: El Delivery debe existir.
- **Camino normal**:
  - Se busca el Delivery por deliveryId o trackingNumber
  - Se busca el Tracking asociado al mismo
  - Se retorna un DTO con: 
    - deliveryId
    - trackingNumber
    - trackingDetails: lista con todos los Tracking del delivery
- **Caminos alternativos**:
  - Si el Delivery no existe se responderá con un error.

## Modelo de datos

### Entidades

**Delivery**
- id: `string`
- status: `Status` 
- orderId: `number`
- shippingAddress: `string` 
- trackingNumber: `string`
- createdAt: `Date` 
- updatedAt: `Date` 

**Tracking**
- id: `string`
- deliveryId: `string` 
- status: `Status`
- location: { "latitude": `number`, "longitude": `number` }
- carrierId: `number`
- timestamp: `Date` 

### Enumeraciones

**Status**
- name: `string` (`IN_PREPARATION`, `IN_TRANSIT`, `NEAR_DESTIN`, `COMPLETED`, `FAILED`)

## API

### CU Iniciar entrega

**Interfaz asincronica (rabbit)** 

Recibe para crear la entrega en direct `order_request_queue`

*body*
```json
{
	"orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
}
```

*Response*  
Si la creacion del delivery fue exitosa responde en fanout `delivery_notification_queue`

```json
{
  "orderId": "123456",
  "status": "IN_PREPARATION",  
  "message": "Delivery started successfully"
}
```

Si la creacion del delivery no fue exitosa responde en fanout `delivery_notification_queue`

```json
{
  "orderId": "123456",
  "status": "FAILED",  
  "message": "Delivery failed"
}
```

`400 BAD REQUEST` si shippingAdress es null

### CU: Actualización de tracking de una entrega

**Interfaz REST**  
`POST /v1/trackings`

*Headers*  
Authorization: Bearer token

*Request*
 ```json
{
  "deliveryId": "123456",
  "location": { 
    "latitude": -32.889458, 
    "longitude": -68.845838 
  },
  "status": {
     "name": "IN_TRANSIT"
  }
}
```

*Response*  
`201 CREATED` si la actualización del tracking fue éxitosa.  
```json
{
  "id": "123456",
  "deliveryId": "123456", 
  "status": {
     "name": "IN_TRANSIT"
  },
  "carrierId": "123456", 
  "location": { 
    "latitude": -32.889458, 
    "longitude": -68.845838 
  }, 
  "timestamp": "2024-11-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

`400 BAD REQUEST` Si location es nulo 

`400 BAD REQUEST` Si se envía un status `IN_TRANSIT` y el último Tracking del delivery no se encuentra en estado `IN_PREPARATION` o `IN_TRANSIT`

`400 BAD REQUEST` Si se envía un status `NEAR_DESTIN` y el último Tracking del delivery no se encuentra en estado `IN_TRANSIT`

### CU: Completar entrega 

**Interfaz REST**  
`PUT /v1/deliveries/{deliveryId}/complete`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si la actualización del delivery fue éxitoso.  
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
     "name": "COMPLETED"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```

`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

**Interfaz asincronica (rabbit)** 

Responde con la entrega del delivery en fanout `delivery_notification_queue`

*body*
```json
{
  "orderId": "123456",
  "status": "COMPLETED",  
  "message": "Delivery completed"
}
```

### CU: Entrega fallida 

**Interfaz REST**  
`PUT /v1/deliveries/{deliveryId}/failed`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si la actualización del delivery fue éxitoso.  
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
     "name": "FAILED"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId

**Interfaz asincronica (rabbit)** 

Responde con el fallo del delivery en fanout `delivery_notification_queue`
*body*
```json
{
  "orderId": "123456",
  "status": "FAILED",  
  "message": "Delivery failed"
}
```

### CU: Consultar Delivery

**Interfaz REST**  
`GET /v1/deliveries/{deliveryId | trackingNumber}`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si el Delivery fue encontrado exitosamente.
```json
{
  "id": "123456",
  "orderId": "123456",
  "shippingAdress": "Calle Antonelli 111, Guaymallen",
  "trackingNumber": "TN-123456",
  "status": {
      "name": "IN_TRANSIT"
  },
  "createdAt": "2024-11-02 16:00:00.000",
  "updatedAt": "2024-12-02 16:00:00.000"
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId o trackingNumber

### CU: Consultar Tracking de un Delivery

**Interfaz REST**  
`GET /v1/trackings/{deliveryId}`

*Headers*  
Authorization: Bearer token

*Response*  
`200 OK` si el Delivery y su historial de Tracking fueron encontrados exitosamente.
```json
{
  "deliveryId": "123456",
  "trackingNumber": "TN-123456",
  "trackingDetails": [
    {
      "id": "1",
      "status": {
          "name": "IN_PREPARATION"
      },
      "location": { 
        "latitude": -32.889458, 
        "longitude": -68.845838 
      }, 
      "carrierId": null,
      "timestamp": "2024-11-02 16:00:00.000"
    },
    {
      "id": "2",
      "status": {
         "name": "IN_TRANSIT"
      },
      "location": { 
        "latitude": -32.889458, 
        "longitude": -68.845838 
      }, 
      "carrierId": "987654",
      "timestamp": "2024-11-03 10:30:00.000"
    }
  ]
}
```
`404 NOT FOUND` si no se encuentra un Delivery con ese deliveryId o trackingNumber