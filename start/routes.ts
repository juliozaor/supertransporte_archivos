import { extname } from 'path'
import Drive from '@ioc:Adonis/Core/Drive'
import Route from '@ioc:Adonis/Core/Route'
const controlador = '../../../app/Presentacion/Archivos/ControladorArchivos'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/', controlador + '.guardar')
}).prefix('api/v1/archivos')

/* Route.get('/recursos/*', async ({request, response}:HttpContextContract) => {
  const ruta = request.param('*').join('/')
  const path = `${ruta}`
  try {
      const { size } = await Drive.getStats(path)
      response.type(extname(path))
      response.header('content-length', size)
      response.stream(await Drive.getStream(path))
  } catch(e){
      console.log(e)
      response.status(404).send(undefined)
  }
})
 */