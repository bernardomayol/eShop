# Arquitectura de la solución

La solución se compone de varios componentes y servicios que trabajan juntos para proporcionar una experiencia de usuario integral. A continuación, se describe la arquitectura general de la solución:

## Componentes

* **AngularApp**: Aplicación web desarrollada con Angular que proporciona la interfaz de usuario para la solución.
* **Basket.API**: Servicio de API que maneja la lógica de negocio relacionada con el carrito de compras.
* **Catalog.API**: Servicio de API que maneja la lógica de negocio relacionada con el catálogo de productos.
* **ClientApp**: Aplicación móvil desarrollada con Xamarin que proporciona la interfaz de usuario para la solución en dispositivos móviles.
* **Ordering.API**: Servicio de API que maneja la lógica de negocio relacionada con el proceso de pedido.
* **PaymentProcessor**: Servicio de procesamiento de pagos que maneja las transacciones financieras.
* **WebApp**: Aplicación web desarrollada con ASP.NET Core que proporciona la interfaz de usuario para la solución en la web.

## Servicios

* **ICatalogService**: Servicio que proporciona acceso al catálogo de productos.
* **IBasketService**: Servicio que proporciona acceso al carrito de compras.
* **IOrderService**: Servicio que proporciona acceso al proceso de pedido.
* **IPaymentService**: Servicio que proporciona acceso al procesamiento de pagos.

## Flujos de trabajo

* **Flujo de trabajo de compra**: El usuario selecciona un producto, agrega al carrito, realiza el pago y recibe el pedido.
* **Flujo de trabajo de administración**: El administrador gestiona el catálogo de productos, el carrito de compras y el proceso de pedido.

## Tecnologías utilizadas

* **Angular**: Framework de JavaScript para desarrollar aplicaciones web.
* **Xamarin**: Framework de desarrollo de aplicaciones móviles.
* **ASP.NET Core**: Framework de desarrollo de aplicaciones web.
* **Entity Framework Core**: Framework de acceso a datos para .NET Core.
* **RabbitMQ**: Cola de mensajes para la comunicación entre servicios.
