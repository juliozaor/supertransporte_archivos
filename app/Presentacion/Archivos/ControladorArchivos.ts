import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ServicioArchivos } from 'App/Dominio/Datos/Servicios/ServicioArchivo';
import { RepositorioArchivosDb } from 'App/Infrestructura/Implementacion/BaseDatos/RepositorioAlrchivosDb';

export default class ControladorArchivos {
  private servicio: ServicioArchivos
  constructor() {
    this.servicio = new ServicioArchivos(new RepositorioArchivosDb)
  }
  public async guardar({ request, response }: HttpContextContract) {
    const datos = request.all();

    /* let archivo;
    if(datos.extension){
      archivo = request.file('archivo', {
        extnames: ['jpg', 'jpeg', 'png', 'pdf'],
      })
    }else{
      archivo = request.file('archivo')
    } */
    const archivo = request.file('archivo')
    if (!archivo) {

      return response.status(400).send({
        mensaje: 'No se encontro el archivo',
        error: 2
      })
    }

    if (!archivo.isValid) {
      return response.status(400).send({ mensaje: 'Formato incorrecto para el archivo', error: 3 })
    }

    return this.servicio.crearArchivo(archivo, JSON.stringify(datos))

  }

  public async obtener({ request }: HttpContextContract) {
    const datos = request.all();

    return this.servicio.obtenerArchivo(JSON.stringify(datos))

  }

  public async verificarDirectorios() {

    return this.servicio.verificarDirectorios()
  }

  public async verificarArchivos() {

    return this.servicio.verificarArchivos()
  }

  public async guardarEvidencias({ request, response }: HttpContextContract) {
    const datos = request.all();

    if (!datos.extension) {
      return "falta la extension"
    }
    const extension = datos.extension.replace(/\./gm, '').replace(/ /g, '');
    const extensiones = extension.split(',');

    const archivo = request.file('archivo', {
      extnames: extensiones,
    })

    if (!archivo) {

      return response.status(400).send({
        mensaje: 'No se encontro el archivo',
        error: 2
      })
    }

    if (!archivo.isValid) {
      return response.status(400).send({ mensaje: 'Formato incorrecto para el archivo', error: 3 })
    }
    
    
  return this.servicio.crearArchivo(archivo, JSON.stringify(datos))
  


  }




}
