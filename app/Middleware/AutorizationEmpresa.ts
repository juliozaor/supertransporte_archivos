import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env';
import axios from "axios";
import ErroresEmpresa from 'App/Exceptions/ErroresEmpresa';
import TokenValidoException from 'App/Exceptions/TokenValidoException';
export default class AutorizationEmpresa {
  public async handle({request, response}: HttpContextContract, next: () => Promise<void>) {
    const {idVigilado, token} = request.all();
    const header = request.header('Authorization')
    if(!header){
      throw new TokenValidoException('Falta el token de autenticación')
    }
    let tokenApi = header.split(' ')[1]
    if(!idVigilado || !token){
     throw new ErroresEmpresa('No tiene autorización, verifique el token de autorización.',401)

    }
    const urlPesv = `${Env.get('PESV')}/validador-empresa`;
    let config = {
      headers: {
        'Authorization': 'Bearer ' + tokenApi
      }
    }

    const autorizado:boolean = await axios.get(`${urlPesv}?idVigilado=${idVigilado}&token=${token}`,config).then(resp =>{
     
      return resp.data.acceso
      
    }).catch(err =>{
      throw new ErroresEmpresa('No tiene autorización, verifique el token de autorización.',401)
    })

    if(autorizado){
      await next()

    }else{
      throw new ErroresEmpresa('No tiene autorización, verifique el token de autorización.',401)
    }
    

  


    
  }
}
