# GREEN Store

Catálogo digital de zapatillas. Explora marcas, modelos, categorías y tallas en una interfaz clara y rápida.

**Demo:** [heraldofortuna.github.io/green-store](https://heraldofortuna.github.io/green-store/)

---

## Características

- Catálogo filtrable por marca, categoría y talla
- Vista de detalle por producto
- Diseño responsive (móvil y escritorio)
- Despliegue automático con GitHub Pages

## Stack

React · TypeScript · Vite

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173/green-store/](http://localhost:5173/green-store/)

## Build

```bash
npm run build
npm run preview
```

## Publicación

Cada push a `main` genera el sitio en la rama `gh-pages`.

Publicación manual:

```bash
npm run deploy
```

## Actualizar stock (PDFs de comercio)

El catálogo se actualiza con un script local (sin revisar foto por foto):

```bash
# Reimportar todos los PDF configurados en scripts/import-catalog.mjs
npm run import:catalog

# Reemplazar solo una marca
npm run import:catalog -- --brand Adidas --file "C:/Users/heral/Downloads/catalogo-adidas.pdf"
```

- Precio mostrado: **Precio Emprendedor**
- Las imágenes salen del PDF automáticamente
- Al actualizar una marca, el resto del stock se conserva

## Licencia

Uso privado del proyecto.
