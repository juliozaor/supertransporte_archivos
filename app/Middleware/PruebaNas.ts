import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from "fs";
import path from 'path';
import { EnviadorEmail } from 'App/Dominio/Email/EnviadorEmail'
import { EmailnotificacionCorreo } from 'App/Dominio/Email/Emails/EmailNotificacionCorreo';
import Env from '@ioc:Adonis/Core/Env';
import { EnviadorEmailAdonis } from 'App/Infrestructura/Email/EnviadorEmailAdonis';
let contador = 0;
export default class PruebaNa {
  private enviadorEmail: EnviadorEmail
  public async handle({response}: HttpContextContract, next: () => Promise<void>) {

    const ruta =path.resolve('../../archivos/pruebanas.pdf')

    if(!fs.existsSync(ruta)){
      contador = contador +1;
if( contador == 1){
      const correos = Env.get('CORREOS').split(',')
      correos.forEach(correo => {
        this.enviadorEmail = new EnviadorEmailAdonis()
              this.enviadorEmail.enviarTemplate({
                asunto: 'Fallo de conexión en la NAS',
                destinatarios: correo,
                de: Env.get('SMTP_USERNAME')
              }, new EmailnotificacionCorreo({
                nombre: '',
                mensaje: ''
              }))
        
      });
    }
    if(contador == 200) contador = 0
     return response.status(400).send('La NAS no se encuentra disponible en este momento')
    }else{
      contador = 0;
    }
        
    await next()
  }
}
