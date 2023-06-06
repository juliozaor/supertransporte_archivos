import { RepositorioArchivos } from "App/Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
export class ServicioArchivos {
    constructor(private repositorio: RepositorioArchivos) {
    }

    crearArchivo(archivo: MultipartFileContract, datos:string) {
        return this.repositorio.crearArchivo(archivo, datos)
    }

}