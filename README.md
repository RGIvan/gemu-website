# 🎮 GEMU - Tienda Online de Videojuegos

<div align="center">

![GEMU Logo](frontend-gemu/public/logo.png)

**Plataforma e-commerce de videojuegos desarrollada con Next.js y microservicios Spring Boot**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Demo en vivo](https://tienda-gemu.vercel.app/) · [Reportar Bug](https://github.com/RGIvan/gemu-website/issues) · [Solicitar Feature](https://github.com/RGIvan/gemu-website/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Despliegue](#-despliegue)
- [Autor](#-autor)

---

## 🎯 Sobre el Proyecto

GEMU es una plataforma de comercio electrónico especializada en la venta de videojuegos de múltiples plataformas. Desarrollada como Proyecto Integrado del CFGS en Diseño de Aplicaciones Web, la aplicación demuestra el uso de tecnologías modernas y una arquitectura de microservicios escalable.

### ¿Por qué GEMU?

- 🎮 Catálogo organizado por plataformas (PlayStation, Xbox, Nintendo Switch)
- 🛒 Carrito de compras persistente con Redis
- ❤️ Lista de favoritos personalizada
- 📄 Generación automática de facturas PDF
- 🔐 Autenticación segura con NextAuth (credenciales + Google OAuth)
- 📱 Diseño responsive (móvil, tablet, escritorio)

---

## �?Características

### Usuario
- �?Registro e inicio de sesión (email/contraseña o Google)
- �?Perfil editable (nombre, apellidos, teléfono, dirección)
- �?Eliminación de cuenta

### Catálogo
- �?Visualización de videojuegos con imágenes
- �?Filtrado por plataforma
- �?Búsqueda por nombre
- �?Página de detalle de producto

### Compras
- �?Carrito de compras (añadir, eliminar, modificar cantidad)
- �?Lista de favoritos
- �?Proceso de checkout completo
- �?Historial de pedidos
- �?Descarga de facturas en PDF

---

## 🛠 Tecnologías

### Frontend
| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework React con App Router y SSR |
| **React 18** | Biblioteca de interfaces de usuario |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utility-first |
| **NextAuth.js** | Autenticación |
| **Prisma** | ORM para base de datos |
| **jsPDF** | Generación de facturas PDF |
| **Sonner** | Notificaciones toast |

### Backend
| Tecnología | Uso |
|------------|-----|
| **Java 17** | Lenguaje de programación |
| **Spring Boot 3** | Framework de microservicios |
| **Spring Cloud Gateway** | API Gateway |
| **Spring Data JPA** | Acceso a datos |
| **Spring Security** | Seguridad y JWT |
| **Maven** | Gestión de dependencias |

### Base de Datos e Infraestructura
| Tecnología | Uso |
|------------|-----|
| **PostgreSQL** | Base de datos principal |
| **Redis (Upstash)** | Almacenamiento del carrito |
| **Docker** | Contenedorización |
| **Railway** | Despliegue backend |
| **Vercel** | Despliegue frontend |
| **Cloudinary** | Almacenamiento de imágenes |

---

## 🏗 Arquitectura

```
┌─────────────────�?    ┌─────────────────────────────────────────�?�?                �?    �?             RAILWAY                     �?�?    VERCEL      �?    �? ┌─────────────────────────────────�?   �?�? ┌───────────�? �?    �? �?        API GATEWAY             �?   �?�? �? Next.js  │──┼─────┼─▶│    (Spring Cloud Gateway)       �?   �?�? �? Frontend �? �?    �? └──────────────┬──────────────────�?   �?�? └───────────�? �?    �?                �?                       �?�?                �?    �?   ┌────────────┼────────────�?          �?└─────────────────�?    �?   �?           �?           �?          �?                        �?┌──────�?  ┌──────�?  ┌──────�?         �?                        �?│Users �?  │Games �?  │Orders�?         �?                        �?�?MS   �?  �?MS   �?  �?MS   �?         �?                        �?└──┬───�?  └──┬───�?  └──┬───�?         �?                        �?   �?         �?         �?              �?                        �?   └──────────┼──────────�?              �?                        �?              �?                         �?                        �?      ┌──────────────�?                  �?                        �?      �? PostgreSQL  �?                  �?                        �?      └──────────────�?                  �?                        └─────────────────────────────────────────�?```

### Microservicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Gateway | 8080 | Punto de entrada, enrutamiento y autenticación JWT |
| Usuarios | 8081 | Registro, login, gestión de usuarios |
| Videojuegos | 8082 | Catálogo de productos |
| Pedidos | 8083 | Gestión de pedidos y detalles |
| Facturas | 8084 | Generación de facturas |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- Java 17+
- Docker y Docker Compose
- PostgreSQL (o usar Docker)

### Clonar el repositorio

```bash
git clone https://github.com/RGIvan/gemu-website.git
cd gemu-website
```

### Opción 1: Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Opción 2: Manual

#### Backend (cada microservicio)
```bash
cd backend/microservicio-usuarios
mvn spring-boot:run
```

#### Frontend
```bash
cd frontend-gemu
npm install
npx prisma generate
npm run dev
```

---

## 🔐 Variables de Entorno

### Frontend (.env.local)

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/gemu"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# API Gateway
NEXT_PUBLIC_API_URL="http://localhost:8080/api"

# Redis (Upstash)
KV_REST_API_URL="tu-upstash-url"
KV_REST_API_TOKEN="tu-upstash-token"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
```

### Backend (application.properties)

```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/gemu
spring.datasource.username=postgres
spring.datasource.password=password

# JWT
jwt.secret=tu-jwt-secret
```

---

## 💻 Uso

### Desarrollo local

1. Accede a `http://localhost:3000`
2. Regístrate o inicia sesión
3. Navega por el catálogo de videojuegos
4. Añade productos al carrito o favoritos
5. Realiza un pedido en `/checkout`
6. Descarga tu factura en PDF

### Comandos útiles

```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Build producción
npm run lint         # Linter

# Prisma
npx prisma studio    # GUI de base de datos
npx prisma migrate dev   # Crear migración
npx prisma generate  # Generar cliente

# Docker
docker-compose up -d     # Levantar servicios
docker-compose down      # Parar servicios
docker-compose logs -f   # Ver logs
```

---

## 📡 API Endpoints

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/usuarios/crear` | Registrar usuario |
| POST | `/usuarios/login` | Iniciar sesión |
| GET | `/usuarios/{id}` | Obtener usuario |
| PUT | `/usuarios/actualizar` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

### Videojuegos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/videojuegos` | Listar todos |
| GET | `/videojuegos/{id}` | Obtener por ID |
| GET | `/videojuegos/plataforma/{plataforma}` | Filtrar por plataforma |

### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pedidos/crear` | Crear pedido |
| GET | `/pedidos/usuario/{id}` | Pedidos de usuario |
| GET | `/pedidos/{id}` | Obtener pedido |

### Facturas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/facturas/crear` | Crear factura |
| GET | `/facturas/pedido/{id}` | Factura de pedido |

---

## 🌐 Despliegue

### Frontend (Vercel)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno
3. Deploy automático con cada push

### Backend (Railway)

1. Crea un proyecto en [Railway](https://railway.app)
2. Añade un servicio PostgreSQL
3. Despliega cada microservicio desde el repositorio
4. Configura las variables de entorno

---

## 📁 Estructura del Proyecto

```
gemu-website/
├── frontend-gemu/
�?  ├── src/
�?  �?  ├── app/                 # App Router
�?  �?  �?  ├── (auth)/          # Login, Register
�?  �?  �?  ├── (carts)/         # Cart, Wishlist
�?  �?  �?  ├── (user)/          # Profile, Orders
�?  �?  �?  ├── api/             # API Routes
�?  �?  �?  ├── checkout/        # Checkout flow
�?  �?  �?  └── profile/         # User profile
�?  �?  ├── components/          # Componentes React
�?  �?  ├── libs/                # Utilidades
�?  �?  └── types/               # TypeScript types
�?  ├── prisma/                  # Schema DB
�?  └── public/                  # Assets
�?├── backend/
�?  ├── gateway/                 # API Gateway
�?  ├── microservicio-usuarios/
�?  ├── microservicio-videojuegos/
�?  ├── microservicio-pedidos/
�?  ├── microservicio-facturas/
�?  └── comun/                   # Entidades compartidas
�?└── docker-compose.yml
```

---

## 👤 Autor

**Iván Roales García**

- GitHub: [@RGIvan](https://github.com/RGIvan)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
- [Railway](https://railway.app/)

---

<div align="center">

�?Si te ha gustado el proyecto, ¡dale una estrella!

</div>
