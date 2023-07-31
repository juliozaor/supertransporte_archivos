import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from "fs";
import path from 'path';
export default class PruebaNa {
  public async handle({response}: HttpContextContract, next: () => Promise<void>) {

    const ruta =path.resolve('../../archivos/pruebanas.pdf')

    if(!fs.existsSync(ruta)){
     return response.status(400).send('La NAS no se encuentra disponible en este momento')
    }
        
    await next()
  }
}
