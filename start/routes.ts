
import Route from '@ioc:Adonis/Core/Route'
const controlador = '../../../app/Presentacion/Archivos/ControladorArchivos'

Route.get('/', async () => {
  return 'Bienvenido al registro de archivos'
})

Route.group(() => {
  Route.post('/', controlador + '.guardar')
}).prefix('api/v1/archivos')
