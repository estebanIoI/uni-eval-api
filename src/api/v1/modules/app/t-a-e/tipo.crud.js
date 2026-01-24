const { createCrudModule } = require('@common/crud/base');
const { createRelationsModule } = require('@common/map/relations');

const { createValidatedCrud } = require('@common/crud/base.validation');

const tipo = createValidatedCrud(
  {
    name: 'tipo',
    route: '/tipo',
    displayName: 'Tipo',
    schemaName: 'Tipo',
  },
  {
    rules: {
      nombre: {
        onlyLetters: { allowSpaces: true },
        stringLength: { min: 3, max: 100 }
      },
      descripcion: {
        stringLength: { min: 3, max: 500 }
      }
    }
  }
);

const catT = createValidatedCrud(
  {
    name: 'cat_t',
    route: '/cat/t',
    displayName: 'Categoría Tipo',
    schemaName: 'CategoriaTipo',
  },
  {
    rules: {
      nombre: {
        onlyLetters: { allowSpaces: true },
        stringLength: { min: 3, max: 100 }
      },
      descripcion: {
        stringLength: { min: 3, max: 500 }
      }
    }
  }
);

const cfgT = createValidatedCrud(
  {
    name: 'cfg_t',
    route: '/cfg/t',
    displayName: 'Configuración Tipo',
    schemaName: 'ConfiguracionTipo',
    disable: ['list'],
  },
  {
    rules: {
      fecha_fin: {
        // fecha_fin debe ser >= fecha_inicio
        afterField: { field: 'fecha_inicio', orEqual: true }
      }
    }
  }
);

const cfg_t_rol = createCrudModule({
  name: 'cfg_t_rol',
  route: '/cfg/t/rol',
  displayName: 'Configuración Tipo Rol',
  schemaName: 'ConfiguracionTipoRol',
});

const catTmap = createRelationsModule({
  categoryModel: 'cat_t',
  itemModel: 'tipo',
  mapModel: 'ct_map',
  categoryIdField: 'categoria_id',
  itemIdField: 'tipo_id',

  itemPluralPath: 'tipos',

  tagName: 'Categoría Tipo',
  categoryPathBase: '/cat/t',
  itemSchemaName: 'tipo',
  categorySchemaName: 'CategoriaTipo',
});

module.exports = {
  tipo,
  catT,
  cfgT,
  cfg_t_rol,
  catTmap,
};
