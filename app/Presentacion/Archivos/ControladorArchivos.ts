import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ServicioArchivos } from 'App/Dominio/Datos/Servicios/ServicioArchivo';
import { RepositorioArchivosDb } from 'App/Infrestructura/Implementacion/BaseDatos/RepositorioAlrchivosDb';

export default class ControladorArchivos {
  private servicio: ServicioArchivos
  constructor () {
    this.servicio = new ServicioArchivos(new RepositorioArchivosDb)
  }
  public async guardar ({ request, response }:HttpContextContract) {
    const datos = request.all();
    const archivo = request.file('archivo', {
        extnames: ['jpg', 'jpeg', 'png', 'pdf'],
      })
      if (!archivo) {
        
        return response.status(400).send({
          mensaje:'No se encontro el archivo'
        })
      }

      if (!archivo.isValid) {
        return response.status(400).send({mensaje:'Formato incorrecto para el archivo'})
      }

      return this.servicio.crearArchivo(archivo, JSON.stringify(datos))

  }

  public async obtener ({ request, response }:HttpContextContract) {
    const datos = request.all();
   
      return this.servicio.obtenerArchivo(JSON.stringify(datos))

  }


}
