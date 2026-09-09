# Reglas del Proyecto Qvendes

## Persistencia Estricta en Base de Datos (PostgreSQL / Neon DB)
1. **Validación Obligatoria en Servidor**:
   - Todas las sesiones de usuario en el cliente (`localStorage`) deben ser revalidadas mediante llamada API a PostgreSQL (`/api/auth`) contra la tabla `perfiles`.
   - Si un usuario no existe en la base de datos de Neon, la sesión local se debe invalidar de inmediato.

2. **Creación Garantizada de Perfiles**:
   - Toda publicación de anuncio o envío de mensaje exige la existencia confirmada del `vendedor_id` en la tabla `perfiles` de Neon PostgreSQL. Si el perfil no existía previa publicación, se crea síncronamente en la base de datos antes de guardar la relación.

3. **Sin Fallbacks de Memoria Local**:
   - Queda estrictamente prohibido simular inicios de sesión o publicaciones en memoria local/cliente sin haber guardado exitosamente el registro en las tablas de Neon DB.
