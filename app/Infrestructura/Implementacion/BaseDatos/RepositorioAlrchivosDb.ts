
import { RepositorioArchivos } from "../../../Dominio/Repositorios/RepositorioArchivos";
import Drive from '@ioc:Adonis/Core/Drive';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import fs from "fs";
import { TblArchivosTemporales } from "App/Infrestructura/datos/entidades/Archivo";

export class RepositorioArchivosDb implements RepositorioArchivos {

    async crearArchivo(archivo: MultipartFileContract, datos: string): Promise<any> {

        const { idPregunta, idVigilado } = JSON.parse(datos);

        const { ruta, fecha } = this.crearCarpetaSiNoExiste();
        const nombreAlmacenado = `${idPregunta}_${idVigilado}_${fecha}.${archivo.extname}`
        const nombreOriginalArchivo = archivo.clientName;
        let idTemporal;

        await archivo?.moveToDisk(`${ruta}`, {
            name: nombreAlmacenado
        })

        const archivosTemporalesBd = await TblArchivosTemporales.query().where({'art_pregunta_id':idPregunta, 'art_usuario_id':idVigilado}).first()
        if(!archivosTemporalesBd){
            const archivosTemporales = new TblArchivosTemporales()
        archivosTemporales.preguntaId = idPregunta
        archivosTemporales.usuarioId = idVigilado
        archivosTemporales.nombreOriginal = nombreOriginalArchivo
        archivosTemporales.nombreArchivo = nombreAlmacenado
        archivosTemporales.rutaArchivo = ruta
        idTemporal =  (await archivosTemporales.save()).id
            
        }else{
            archivosTemporalesBd.nombreOriginal = nombreOriginalArchivo
            archivosTemporalesBd.nombreArchivo = nombreAlmacenado
            archivosTemporalesBd.rutaArchivo = ruta
            idTemporal =  (await archivosTemporalesBd.save()).id
            
        }
        


        return { nombreAlmacenado, nombreOriginalArchivo, ruta, idTemporal }

    }

    verificarCarpetaExiste = (rutaCarpeta) => {
        return fs.existsSync(rutaCarpeta);
    }

    crearCarpetaSiNoExiste = () => {
        const basePath = './files';
        const fechaCargue = new Date();
        const year = fechaCargue.getFullYear();
        const month = fechaCargue.getMonth() + 1;
        const fecha = `${year}${month}`;

        const rutaCarpeta = `${basePath}/${year}/${month}`;
        const ruta = `/${year}/${month}`

        if (!this.verificarCarpetaExiste(rutaCarpeta)) {
            const rutaAnio = `${basePath}/${year}`;
            if (!this.verificarCarpetaExiste(rutaAnio)) {
                fs.mkdirSync(rutaAnio);
                fs.mkdirSync(rutaCarpeta);
                console.log('La carpeta ha sido creada. año mes')
            } else {
                fs.mkdirSync(rutaCarpeta);
                console.log('La carpeta ha sido creada. solo mes')
            }
        } else {
            console.log('La carpeta ya existe.')
        }

        return { ruta, fecha };
    }



}

