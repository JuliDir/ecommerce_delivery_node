# Pricing API Documentation

## Índice
1. [Test API](#test-api)
2. [Crear Precio de Producto](#crear-precio-de-producto)
3. [Consultar Precio de Producto](#consultar-precio-de-producto)
10.[Calcular el precio con cupon](#calcular-total-con-cupon)
4. [Obtener todos los Descuentos](#obtener-todos-los-descuentos)
5. [Crear Política de Descuento](#crear-política-de-descuento)
6. [Actualizar Política de Descuento](#actualizar-política-de-descuento)
7. [Obtener todos los Cupones](#obtener-todos-los-cupones)
8. [Crear Cupón](#crear-cupón)
9. [Modificar Cupón](#modificar-cupón)

---

### Test API

`GET /api/test`

Endpoint para probar el funcionamiento de la API.

#### Respuestas

- `200 OK`: API running!
- `401 Unauthorized`: Token de autorización inválido o ausente.
- `400 Bad Request`: Solicitud incorrecta.
- `500 Internal Server Error`: Error interno del servidor.

---

### Crear Precio de Producto

`POST /api/prices`

Crea el precio de un producto.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Body
```json
{
  "article_id": "string",
  "price": 100.00,
}
```

#### Respuesta

- `200 OK`: Precio actualizado correctamente.
  ```json
  {
    "_id": "67366854ec21ade4efab8202",
    "article_id": "2",
    "price": 9890,
    "start_date": "2024-11-10T21:07:49.125Z",
    "createdAt": "2024-11-14T21:15:00.294Z",
    "updatedAt": "2024-11-14T21:15:00.294Z"
  }
  ```

---

### Consultar Precio de Producto

`GET /api/prices/{article_id}`

Devuelve el precio actual de un producto específico.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Parámetros
- `article_id` (string): ID del producto cuyo precio se consulta.

#### Respuesta

- `200 OK`: Precio del producto encontrado.
  ```json
  {
    "_id": "67366854ec21ade4efab8202",
    "article_id": "2",
    "price_with_discount": 8900,
    "discounts": []
  }
  ```

- `404 Not Found`: Producto no encontrado.

---

### Calcular total con cupon

`POST /api/prices/coupon`

Calcula el precio con cupon.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Body
```json
{
  "code": "CUPONMODIFICADO",
  "products": [
    {
      "article_id": "1",
      "price": 100
    }
  ]
}
```
---

### Obtener todos los Descuentos

`GET /api/discounts`

Obtiene todas las políticas de descuento.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Respuesta

- `200 OK`: Descuentos encontrados.
  ```json
  [
    {
      "id": "123",
      "name": "Descuento Verano",
      "type": "Porcentaje",
      "value": 15.0,
      "start_date": "2024-06-01T00:00:00Z",
      "end_date": "2024-08-31T23:59:59Z",
      "article_ids": ["1", "2"]
    }
  ]
  ```

---

### Crear Política de Descuento

`POST /api/discounts`

Crea una nueva política de descuento.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Body
```json
{
  "name": "Descuento de Navidad",
  "type": "Porcentaje",
  "value": 20.0,
  "start_date": "2024-12-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "article_ids": ["3", "4"]
}
```

#### Respuesta

- `200 OK`: Descuento creado correctamente.
  ```json
  {
    "id": "123",
    "name": "Descuento de Navidad",
    "type": "Porcentaje",
    "value": 20.0,
    "start_date": "2024-12-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "article_ids": ["3", "4"]
  }
  ```

---

### Actualizar Política de Descuento

`PUT /api/discounts/{discount_id}`

Actualiza una política de descuento existente.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Parámetros
- `discount_id` (string): ID de la política de descuento a actualizar.

#### Body
```json
{
  "name": "Descuento Actualizado",
  "type": "Monto Fijo",
  "value": 500.0,
  "start_date": "2024-12-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "article_ids": ["5", "6"]
}
```

#### Respuesta

- `200 OK`: Descuento actualizado correctamente.
  ```json
  {
    "id": "123",
    "name": "Descuento Actualizado",
    "type": "Monto Fijo",
    "value": 500.0,
    "start_date": "2024-12-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "article_ids": ["5", "6"]
  }
  ```

---

### Obtener todos los Cupones

`GET /api/coupons`

Obtiene todos los cupones disponibles.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Respuesta

- `200 OK`: Lista de cupones.
  ```json
  [
    {
      "id": "123",
      "code": "NAVIDAD2024",
      "discount_type": "Porcentaje",
      "discount_value": 10.0,
      "applicable_products": ["1", "2", "3"],
      "minimum_purchase": 50.0,
      "uses_limit": 100
    }
  ]
  ```

---

### Crear Cupón

`POST /api/coupons`

Crea un nuevo cupón.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Body
```json
{
  "code": "NUEVOCUPON",
  "discount_type": "Monto Fijo",
  "discount_value": 50.0,
  "applicable_products": ["7", "8"],
  "minimum_purchase": 200.0,
  "uses_limit": 10,
  "start_date": "2024-11-01T00:00:00Z",
  "end_date": "2024-11-30T23:59:59Z"
}
```

#### Respuesta

- `200 OK`: Cupón creado correctamente.
  ```json
  {
    "id": "124",
    "code": "NUEVOCUPON",
    "discount_type": "Monto Fijo",
    "discount_value": 50.0,
    "applicable_products": ["7", "8"]
  }
  ```

---

### Modificar Cupón

`PUT /api/coupons/{coupon_id}`

Modifica un cupón existente.

#### Headers
| Cabecera                     | Contenido           |
|------------------------------|---------------------|
| `Authorization: Bearer xxx`  | Token en formato JWT |

#### Parámetros
- `coupon_id` (string): ID del cupón a modificar.

#### Body
```json
{
  "code": "CUPONMODIFICADO",
  "discount_type": "Porcentaje",
  "discount_value": 15.0,
  "applicable_products": ["1", "2"],
  "minimum_purchase": 50.0,
  "uses_limit": 50,
  "active": true,
  "start_date": "2024-11-01T00:00:00Z",
  "end_date": "2024-11-30T23:59:59Z"
}
```

#### Respuesta

- `200 OK`: Cupón actualizado correctamente.
- `404 Not Found`: Cupón no encontrado.

---


#### Respuesta

- `200 OK`: Cupón aplicado correctamente.
- `404 Not Found`: Cupón no válido.

---