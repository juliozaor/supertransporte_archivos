
import Route from '@ioc:Adonis/Core/Route'
const controlador = '../../../app/Presentacion/Archivos/ControladorArchivos'

Route.get('/', async () => {
  return 'Bienvenido al registro de archivos'
})
Route.get('/directorios', `${controlador}.verificarDirectorios`)
Route.get('/archivos', `${controlador}.verificarArchivos`)

Route.group(() => {
  Route.post('/', `${controlador}.guardar`)
  Route.post('/evidencias', `${controlador}.guardarEvidencias`)
  Route.get('/', `${controlador}.obtener`)
}).prefix('api/v1/archivos')//.middleware(['auth', 'nas'])

Route.group(() => {
  Route.post('/', `${controlador}.guardar`)
  Route.post('/evidencias', `${controlador}.guardarEvidencias`)
  Route.get('/', `${controlador}.obtener`)
}).prefix('api/v1/guardar-archivo').middleware('authEmpresa')

