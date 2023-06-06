import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
export interface RepositorioArchivos {
    crearArchivo(archivo: MultipartFileContract, datos:string): Promise<{}>
}