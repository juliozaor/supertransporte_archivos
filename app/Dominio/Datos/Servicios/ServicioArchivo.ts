import { RepositorioArchivos } from "App/Dominio/Repositorios/RepositorioArchivos";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
export class ServicioArchivos {
    constructor(private repositorio: RepositorioArchivos) {
    }

    crearArchivo(archivo: MultipartFileContract, datos:string) {
        return this.repositorio.crearArchivo(archivo, datos)
    }
    obtenerArchivo(datos:string) {
        return this.repositorio.obtenerArchivo(datos)
    }

    verificarDirectorios() {
        return this.repositorio.verificarDirectorios()
    }

    verificarArchivos() {
        return this.repositorio.verificarArchivos()
    }

    


}