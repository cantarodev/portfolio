# cantaro.dev — Personal Portfolio & Cloud Infrastructure

[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Portafolio profesional de alto rendimiento desarrollado con **Astro** y desplegado sobre una arquitectura **Serverless / Edge estática en AWS** protegida por **Cloudflare**. Diseñado bajo un modelo estricto de **costo $0 USD** y un flujo de despliegue continuo (CI/CD) automatizado con **GitHub Actions**.

🌐 **Sitio en producción:** [https://cantaro.dev](https://cantaro.dev)

---

## 🏗️ Arquitectura de Infraestructura

El proyecto utiliza una estrategia de capas para garantizar máxima velocidad de carga (SSG), disponibilidad global del 99.99% y protección contra ataques volumétricos sin incurrir en costos de AWS.

```
 [ Usuario / Cliente ]
           │
           ▼ (HTTPS / TLS 1.3)
 ┌─────────────────────────────────────────┐
 │ Cloudflare (Proxy / DNS / Anti-DDoS)    │  ──► Capa de Seguridad WAF (Gratis)
 └─────────────────────────────────────────┘
           │
           ▼ (CNAME Proxied)
 ┌─────────────────────────────────────────┐
 │ AWS CloudFront (CDN Global / OAC)      │  ──► Distribución de Edge Caching
 └─────────────────────────────────────────┘
           │
           ▼ (Acceso Restringido mediante OAC)
 ┌─────────────────────────────────────────┐
 │ AWS S3 (Bucket Privado / Storage)       │  ──► Almacenamiento de Archivos /dist
 └─────────────────────────────────────────┘
```

---

## ⚡ Stack Tecnológico

- **Frontend:** [Astro](https://astro.build) (Static Site Generation), React, TailwindCSS.
- **Storage & CDN:** AWS S3, AWS CloudFront, AWS ACM (Certificate Manager).
- **DNS & Security Layer:** Cloudflare (Proxy mode, Free WAF & DDoS Shield).
- **CI/CD:** GitHub Actions (S3 Sync + CloudFront Cache Invalidation).
- **IAM Security:** Política de menor privilegio personalizada para CI/CD y Origin Access Control (OAC) para blindar el bucket S3.

---

## 🛡️ Estrategia de Seguridad y Cero Costo ($0 Budget)

1. **Cloudflare Proxy Shield:** Todo el tráfico pasa primero por la red de Cloudflare. Esto bloquea bots maliciosos y amortigua ataques DDoS antes de que las peticiones alcancen a AWS.
2. **S3 Private Bucket + OAC:** El bucket de S3 rechaza cualquier acceso público directo. Solo la distribución de CloudFront tiene permisos (`s3:GetObject`) asignados mediante Origin Access Control.
3. **Caching Agresivo:** CloudFront sirve los activos estáticos comprimidos desde sus puntos de presencia (Edge Locations), reduciendo las lecturas a S3 a prácticamente cero.
4. **Alarma de Costos (AWS Budgets):** Alerta automática por correo ante cualquier variación superior a **$0.01 USD**.
5. **AWS WAF Desactivado:** Se prescinde de AWS WAF ($14+/mes) delegando toda la protección perimetral al plan gratuito de Cloudflare.

---

## 🔐 IAM Policy (Principio de Menor Privilegio)

El usuario de CI/CD `github-actions-deploy` utiliza la siguiente política personalizada que restringe sus acciones únicamente al bucket y la distribución asignados:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketListing",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::TU_NOMBRE_DE_BUCKET"
    },
    {
      "Sid": "S3ObjectsManagement",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::TU_NOMBRE_DE_BUCKET/*"
    },
    {
      "Sid": "CloudFrontCacheInvalidation",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::*:distribution/TU_DISTRIBUTION_ID"
    }
  ]
}
```

---

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js v20+
- npm, pnpm o yarn

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/cantaro-portfolio.git
   cd cantaro-portfolio
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Iniciar servidor de desarrollo local:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:4321](http://localhost:4321) en tu navegador.

4. Compilar para producción (Genera la carpeta `/dist`):

   ```bash
   npm run build
   ```

5. Previsualizar la compilación localmente:
   ```bash
   npm run preview
   ```

---

## 🔄 Automatización CI/CD (GitHub Actions)

El repositorio incluye un Workflow en `.github/workflows/deploy.yml` que se dispara automáticamente en cada `push` a la rama `main`:

1. Realiza el Checkout del código e instala dependencias.
2. Ejecuta `npm run build` para generar el bundle estático.
3. Autentica contra AWS con credenciales IAM restringidas (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
4. Sincroniza la carpeta `dist/` con el bucket S3 usando `--delete` para remover archivos obsoletos.
5. Emite una invalidación de caché en CloudFront (`/*`) para reflejar los cambios instantáneamente en todo el mundo.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
